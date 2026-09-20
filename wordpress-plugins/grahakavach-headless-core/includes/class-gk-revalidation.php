<?php
/**
 * Signed revalidation webhook: WordPress -> Next.js.
 *
 * When content changes, the backend tells the storefront which cache tags to
 * drop. The request is signed with HMAC-SHA256 over the exact request body,
 * using a secret that only ever lives in wp-config.php.
 *
 * Security properties:
 *   - Never fires unsigned. No secret configured means no request at all.
 *   - Signature covers the body, so tags cannot be tampered with in transit.
 *   - A timestamp is included and signed so the receiver can reject replays.
 *   - Fires on `shutdown` so a slow or unreachable storefront can never block
 *     an editor's save.
 *
 * The Next.js side must verify with a timing-safe comparison. See README.md.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Queues and dispatches signed revalidation calls.
 */
final class GK_Revalidation {

	/**
	 * Tags queued during this request.
	 *
	 * @var string[]
	 */
	private static $queue = array();

	/**
	 * Whether the shutdown dispatcher is registered.
	 *
	 * @var bool
	 */
	private static $hooked = false;

	public static function init(): void {
		// Editorial content.
		add_action( 'save_post', array( __CLASS__, 'on_save_post' ), 10, 3 );
		add_action( 'deleted_post', array( __CLASS__, 'on_deleted_post' ), 10, 2 );

		// Global settings and menus.
		add_action( 'update_option_' . GK_Config::OPTION_KEY, array( __CLASS__, 'on_settings_change' ) );
		add_action( 'wp_update_nav_menu', array( __CLASS__, 'on_settings_change' ) );

		// ACF options screens, if ACF is present.
		add_action( 'acf/save_post', array( __CLASS__, 'on_acf_save' ), 20 );

		// WooCommerce catalogue changes.
		add_action( 'woocommerce_update_product', array( __CLASS__, 'on_product_change' ) );
		add_action( 'woocommerce_new_product', array( __CLASS__, 'on_product_change' ) );
		add_action( 'woocommerce_product_set_stock', array( __CLASS__, 'on_product_object_change' ) );
		add_action( 'woocommerce_variation_set_stock', array( __CLASS__, 'on_product_object_change' ) );
	}

	/**
	 * Add tags to this request's queue.
	 *
	 * @param string[] $tags Cache tags.
	 */
	public static function queue( array $tags ): void {
		if ( empty( $tags ) || ! GK_Config::revalidation_ready() ) {
			return;
		}

		foreach ( $tags as $tag ) {
			$tag = (string) $tag;
			if ( '' !== $tag && ! in_array( $tag, self::$queue, true ) ) {
				self::$queue[] = $tag;
			}
		}

		if ( ! self::$hooked && ! empty( self::$queue ) ) {
			add_action( 'shutdown', array( __CLASS__, 'dispatch' ), 100 );
			self::$hooked = true;
		}
	}

	/**
	 * Handle a post save.
	 *
	 * @param int     $post_id Post ID.
	 * @param WP_Post $post    Post object.
	 * @param bool    $update  Whether this is an update.
	 */
	public static function on_save_post( $post_id, $post, $update ): void {
		unset( $update );

		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}

		if ( ! $post instanceof WP_Post ) {
			return;
		}

		// Only published transitions matter to the public cache. A draft that
		// was never public has nothing cached to invalidate.
		if ( 'publish' !== $post->post_status && 'trash' !== $post->post_status ) {
			return;
		}

		self::queue( GK_Urls::tags_for_post( (int) $post_id ) );
	}

	/**
	 * Handle a permanent delete.
	 *
	 * @param int     $post_id Post ID.
	 * @param WP_Post $post    Post object.
	 */
	public static function on_deleted_post( $post_id, $post = null ): void {
		unset( $post_id );

		if ( $post instanceof WP_Post ) {
			self::queue( GK_Urls::tags_for_post( (int) $post->ID ) );
		}
	}

	/**
	 * Settings, menus, or anything global changed.
	 */
	public static function on_settings_change(): void {
		self::queue( array( 'wp-settings' ) );
	}

	/**
	 * ACF save handler.
	 *
	 * @param mixed $post_id ACF post id — an int for posts, a string such as
	 *                       'options' for options pages.
	 */
	public static function on_acf_save( $post_id ): void {
		if ( is_numeric( $post_id ) ) {
			self::queue( GK_Urls::tags_for_post( (int) $post_id ) );
			return;
		}

		self::queue( array( 'wp-settings' ) );
	}

	/**
	 * A product changed.
	 *
	 * @param int $product_id Product ID.
	 */
	public static function on_product_change( $product_id ): void {
		$product_id = (int) $product_id;

		if ( $product_id > 0 ) {
			self::queue( array( 'woo-product:' . $product_id, 'woo-products' ) );
		}
	}

	/**
	 * Stock changed; WooCommerce passes the product object here.
	 *
	 * @param mixed $product Product object.
	 */
	public static function on_product_object_change( $product ): void {
		if ( is_object( $product ) && method_exists( $product, 'get_id' ) ) {
			self::on_product_change( (int) $product->get_id() );
		}
	}

	/**
	 * Send the queued tags. Runs on shutdown, after the response is delivered.
	 */
	public static function dispatch(): void {
		if ( empty( self::$queue ) || ! GK_Config::revalidation_ready() ) {
			return;
		}

		$tags        = self::$queue;
		self::$queue = array();

		$payload = wp_json_encode(
			array(
				'tags'      => array_values( $tags ),
				'timestamp' => time(),
				'source'    => home_url(),
			)
		);

		if ( ! is_string( $payload ) ) {
			return;
		}

		$signature = hash_hmac( 'sha256', $payload, GK_Config::revalidate_secret() );

		$response = wp_remote_post(
			GK_Config::revalidate_url(),
			array(
				'timeout'  => 5,
				'blocking' => false,
				'headers'  => array(
					'Content-Type'     => 'application/json',
					'X-GK-Signature'   => 'sha256=' . $signature,
					'User-Agent'       => 'GrahaKavachHeadlessCore/' . GK_HEADLESS_VERSION,
				),
				'body'     => $payload,
			)
		);

		if ( is_wp_error( $response ) && defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			// Log the failure reason only — never the payload or the signature.
			error_log( '[gk-headless] revalidation dispatch failed: ' . $response->get_error_message() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}
	}
}

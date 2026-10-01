<?php
/**
 * Abandoned-cart recovery.
 *
 * The storefront keeps the cart in the browser, so WooCommerce never sees it.
 * The Next.js server posts a signed snapshot here once the customer has typed a
 * valid mobile number at checkout; a cron job then sends up to two reminders
 * with a one-click link that restores the cart.
 *
 * Both endpoints are server-to-server only and are authenticated with an
 * HMAC-SHA256 of the raw body, keyed by the existing revalidation secret.
 *
 * @package GrahaKavach\WhatsApp
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GKWA_Carts {

	public const CRON_HOOK = 'gkwa_process_carts';

	private const REST_NS          = 'gk-whatsapp/v1';
	private const MAX_ITEMS        = 20;
	private const MAX_PER_RUN      = 25;
	private const MAX_CART_AGE     = 3 * DAY_IN_SECONDS;
	private const MAX_REMINDERS_7D = 3;

	public static function init(): void {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		add_filter( 'cron_schedules', array( __CLASS__, 'cron_schedules' ) );
		add_action( self::CRON_HOOK, array( __CLASS__, 'process' ) );

		// Self-heal if the schedule was lost (e.g. after a migration).
		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			self::schedule();
		}
	}

	/**
	 * @param array<string,array<string,mixed>> $schedules Existing schedules.
	 * @return array<string,array<string,mixed>>
	 */
	public static function cron_schedules( array $schedules ): array {
		$schedules['gkwa_ten_minutes'] = array(
			'interval' => 10 * MINUTE_IN_SECONDS,
			'display'  => 'Every 10 minutes',
		);

		return $schedules;
	}

	public static function schedule(): void {
		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			wp_schedule_event( time() + 300, 'gkwa_ten_minutes', self::CRON_HOOK );
		}
	}

	public static function unschedule(): void {
		wp_clear_scheduled_hook( self::CRON_HOOK );
	}

	/* ---------------------------------------------------------------- REST */

	public static function register_routes(): void {
		foreach ( array( 'capture' => 'rest_capture', 'recover' => 'rest_recover' ) as $path => $callback ) {
			register_rest_route(
				self::REST_NS,
				'/cart/' . $path,
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, $callback ),
					'permission_callback' => array( __CLASS__, 'authorize' ),
				)
			);
		}
	}

	/**
	 * @return true|WP_Error
	 */
	public static function authorize( WP_REST_Request $request ) {
		$secret = GKWA_Config::bridge_secret();
		if ( '' === $secret ) {
			return new WP_Error( 'gkwa_not_configured', 'Bridge secret is not configured.', array( 'status' => 503 ) );
		}

		$header = (string) $request->get_header( 'x-gk-signature' );
		if ( 0 !== strpos( $header, 'sha256=' ) ) {
			return new WP_Error( 'gkwa_unauthorized', 'Missing signature.', array( 'status' => 401 ) );
		}

		$expected = hash_hmac( 'sha256', $request->get_body(), $secret );
		if ( ! hash_equals( $expected, substr( $header, 7 ) ) ) {
			return new WP_Error( 'gkwa_unauthorized', 'Invalid signature.', array( 'status' => 401 ) );
		}

		$body = json_decode( $request->get_body(), true );
		$ts   = is_array( $body ) ? (int) ( $body['timestamp'] ?? 0 ) : 0;
		if ( abs( time() - $ts ) > 300 ) {
			return new WP_Error( 'gkwa_expired', 'Expired request.', array( 'status' => 408 ) );
		}

		return true;
	}

	public static function rest_capture( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;

		$body  = (array) json_decode( $request->get_body(), true );
		$phone = GKWA_Client::normalize_phone( $body['phone'] ?? '' );
		if ( '' === $phone ) {
			return new WP_REST_Response( array( 'ok' => false, 'error' => 'invalid_phone' ), 400 );
		}

		$table  = GKWA_DB::carts_table();
		$open   = "('active','reminded1','reminded2')";
		$items  = self::clean_items( (array) ( $body['items'] ?? array() ) );
		$cartid = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE phone = %s AND status IN {$open} ORDER BY id DESC LIMIT 1", $phone ) ); // phpcs:ignore WordPress.DB.PreparedSQL

		// Cart emptied (order placed or cleared): drop the open cart so no reminder fires.
		if ( empty( $items ) ) {
			if ( $cartid ) {
				$wpdb->update( $table, array( 'status' => 'cleared', 'updated_at' => GKWA_DB::now() ), array( 'id' => $cartid ) );
			}
			return new WP_REST_Response( array( 'ok' => true ) );
		}

		$summary = self::summarise( $items );
		$data    = array(
			'name'       => mb_substr( sanitize_text_field( (string) ( $body['name'] ?? '' ) ), 0, 100 ),
			'email'      => mb_substr( sanitize_email( (string) ( $body['email'] ?? '' ) ), 0, 100 ),
			'items'      => wp_json_encode( $items ),
			'summary'    => $summary,
			'updated_at' => GKWA_DB::now(),
		);

		if ( $cartid ) {
			$wpdb->update( $table, $data, array( 'id' => $cartid ) );
		} else {
			$wpdb->insert(
				$table,
				array_merge(
					$data,
					array(
						'token'      => bin2hex( random_bytes( 16 ) ),
						'phone'      => $phone,
						'status'     => 'active',
						'created_at' => GKWA_DB::now(),
					)
				)
			);
		}

		return new WP_REST_Response( array( 'ok' => true ) );
	}

	public static function rest_recover( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;

		$body  = (array) json_decode( $request->get_body(), true );
		$token = preg_replace( '/[^a-f0-9]/', '', strtolower( (string) ( $body['token'] ?? '' ) ) );
		if ( 32 !== strlen( (string) $token ) ) {
			return new WP_REST_Response( array( 'ok' => false, 'error' => 'not_found' ), 404 );
		}

		$table = GKWA_DB::carts_table();
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE token = %s", $token ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL

		if ( ! $row || 'expired' === $row['status'] || strtotime( $row['updated_at'] . ' UTC' ) < time() - ( 7 * DAY_IN_SECONDS ) ) {
			return new WP_REST_Response( array( 'ok' => false, 'error' => 'not_found' ), 404 );
		}

		$wpdb->update( $table, array( 'clicked_at' => GKWA_DB::now() ), array( 'id' => $row['id'] ) );

		return new WP_REST_Response(
			array(
				'ok'    => true,
				'items' => json_decode( (string) $row['items'], true ),
				'name'  => $row['name'],
				'phone' => substr( $row['phone'], -10 ),
				'email' => $row['email'],
			)
		);
	}

	/**
	 * @param array<int,mixed> $raw Items as posted.
	 * @return array<int,array{productId:int,quantity:int,name:string}>
	 */
	private static function clean_items( array $raw ): array {
		$items = array();

		foreach ( array_slice( $raw, 0, self::MAX_ITEMS ) as $item ) {
			$id  = (int) ( $item['productId'] ?? 0 );
			$qty = (int) ( $item['quantity'] ?? 0 );
			if ( $id <= 0 || $qty <= 0 ) {
				continue;
			}

			$product = function_exists( 'wc_get_product' ) ? wc_get_product( $id ) : null;
			if ( ! $product ) {
				continue;
			}

			$items[] = array(
				'productId' => $id,
				'quantity'  => min( $qty, 99 ),
				'name'      => wp_strip_all_tags( $product->get_name() ),
			);
		}

		return $items;
	}

	/**
	 * @param array<int,array{productId:int,quantity:int,name:string}> $items Clean items.
	 */
	private static function summarise( array $items ): string {
		$parts = array();
		foreach ( $items as $item ) {
			$parts[] = $item['name'] . ' x' . $item['quantity'];
		}

		return mb_substr( implode( ', ', $parts ), 0, 120 );
	}

	/* ----------------------------------------------------------------- cron */

	public static function mark_converted( string $phone ): void {
		global $wpdb;

		if ( '' === $phone ) {
			return;
		}

		$table = GKWA_DB::carts_table();
		$wpdb->query( // phpcs:ignore WordPress.DB.PreparedSQL
			$wpdb->prepare(
				"UPDATE {$table} SET status = 'recovered', updated_at = %s WHERE phone = %s AND status IN ('active','reminded1','reminded2')",
				GKWA_DB::now(),
				$phone
			)
		);
	}

	public static function process(): void {
		global $wpdb;

		$table = GKWA_DB::carts_table();

		// Housekeeping first: nothing older than three days is worth chasing.
		$wpdb->query( // phpcs:ignore WordPress.DB.PreparedSQL
			$wpdb->prepare(
				"UPDATE {$table} SET status = 'expired' WHERE status IN ('active','reminded1','reminded2') AND updated_at < %s",
				GKWA_DB::ago( self::MAX_CART_AGE )
			)
		);

		if ( ! GKWA_Config::enabled() || ! GKWA_Config::credentials_ready() ) {
			return;
		}

		$delay1 = max( 15, (int) GKWA_Config::get( 'cart_delay_1' ) ) * MINUTE_IN_SECONDS;
		$delay2 = max( 120, (int) GKWA_Config::get( 'cart_delay_2' ) ) * MINUTE_IN_SECONDS;

		// Reminder 1: cart idle for the first delay.
		$due = $wpdb->get_results( // phpcs:ignore WordPress.DB.PreparedSQL
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE status = 'active' AND updated_at <= %s ORDER BY id ASC LIMIT %d",
				GKWA_DB::ago( $delay1 ),
				self::MAX_PER_RUN
			),
			ARRAY_A
		);
		foreach ( (array) $due as $cart ) {
			self::remind( $cart, 'gk_cart_reminder_1', 'reminded1' );
		}

		// Reminder 2: still no order a day later, and they never opened link 1.
		$due = $wpdb->get_results( // phpcs:ignore WordPress.DB.PreparedSQL
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE status = 'reminded1' AND clicked_at IS NULL AND updated_at <= %s AND last_reminder_at <= %s ORDER BY id ASC LIMIT %d",
				GKWA_DB::ago( $delay2 ),
				GKWA_DB::ago( 6 * HOUR_IN_SECONDS ),
				self::MAX_PER_RUN
			),
			ARRAY_A
		);
		foreach ( (array) $due as $cart ) {
			self::remind( $cart, 'gk_cart_reminder_2', 'reminded2' );
		}
	}

	/**
	 * @param array<string,mixed> $cart     Cart row.
	 * @param string              $template Template to send.
	 * @param string              $status   Status to move the cart to.
	 */
	private static function remind( array $cart, string $template, string $status ): void {
		global $wpdb;

		$table = GKWA_DB::carts_table();

		// Move the cart on first so a slow send can never cause a double reminder.
		$wpdb->update(
			$table,
			array(
				'status'           => $status,
				'last_reminder_at' => GKWA_DB::now(),
			),
			array( 'id' => $cart['id'] )
		);

		// Never pester one number: at most three reminders in any seven days.
		if ( GKWA_DB::reminders_sent_to( (string) $cart['phone'], 7 ) >= self::MAX_REMINDERS_7D ) {
			return;
		}

		$name = trim( explode( ' ', trim( (string) $cart['name'] ) )[0] );

		GKWA_Sender::queue(
			$template,
			(string) $cart['phone'],
			array(
				'customer_name' => '' !== $name ? $name : 'there',
				'cart_items'    => (string) $cart['summary'],
			),
			array( 'button' => (string) $cart['token'] )
		);
	}
}

<?php
/**
 * REST additions.
 *
 * Two things only:
 *   1. A `gk_frontend_url` field on posts and pages, mirroring `frontendUri`
 *      in GraphQL, so REST consumers get the same canonical storefront URL.
 *   2. A public, read-only `gk/v1/settings` endpoint for the same global
 *      settings object, for code paths that do not use GraphQL.
 *
 * Nothing here exposes anything that is not already public on the storefront.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers project-specific REST fields and routes.
 */
final class GK_Rest {

	public const NAMESPACE = 'gk/v1';

	public static function init(): void {
		add_action( 'rest_api_init', array( __CLASS__, 'register_fields' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * Add the storefront URL to post and page responses.
	 */
	public static function register_fields(): void {
		foreach ( array( 'post', 'page' ) as $type ) {
			register_rest_field(
				$type,
				'gk_frontend_url',
				array(
					'get_callback'    => static function ( $object ) {
						return GK_Urls::for_post( (int) ( $object['id'] ?? 0 ) );
					},
					'update_callback' => null,
					'schema'          => array(
						'description' => __( 'Canonical URL of this content on the public storefront.', 'grahakavach-headless-core' ),
						'type'        => 'string',
						'context'     => array( 'view', 'edit' ),
					),
				)
			);
		}
	}

	/**
	 * Register the settings route.
	 */
	public static function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			'/settings',
			array(
				'methods'             => WP_REST_Server::READABLE,
				// Public by design: this is the same data rendered in the site
				// header and footer. No secret is ever returned.
				'permission_callback' => '__return_true',
				'callback'            => array( __CLASS__, 'get_settings' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/health',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'permission_callback' => '__return_true',
				'callback'            => array( __CLASS__, 'get_health' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/auth/login',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'permission_callback' => '__return_true',
				'callback'            => array( __CLASS__, 'handle_login' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/inquiries',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'permission_callback' => '__return_true',
				'callback'            => array( __CLASS__, 'handle_inquiry' ),
			)
		);
	}

	/**
	 * Save customer contact inquiry.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public static function handle_inquiry( WP_REST_Request $request ): WP_REST_Response {
		$name    = sanitize_text_field( (string) $request->get_param( 'name' ) );
		$email   = sanitize_email( (string) $request->get_param( 'email' ) );
		$phone   = sanitize_text_field( (string) $request->get_param( 'phone' ) );
		$subject = sanitize_text_field( (string) $request->get_param( 'subject' ) );
		$message = sanitize_textarea_field( (string) $request->get_param( 'message' ) );

		if ( empty( $name ) || empty( $email ) || empty( $message ) ) {
			return new WP_REST_Response(
				array( 'error' => __( 'Name, email, and message are required.', 'grahakavach-headless-core' ) ),
				400
			);
		}

		$post_id = wp_insert_post(
			array(
				'post_type'    => GK_CPT::INQUIRY,
				'post_title'   => sprintf( '%s — %s', $name, $subject ?: 'General Enquiry' ),
				'post_content' => $message,
				'post_status'  => 'publish',
				'meta_input'   => array(
					'inquiry_name'    => $name,
					'inquiry_email'   => $email,
					'inquiry_phone'   => $phone,
					'inquiry_subject' => $subject,
					'inquiry_date'    => current_time( 'mysql' ),
				),
			)
		);

		if ( is_wp_error( $post_id ) ) {
			return new WP_REST_Response(
				array( 'error' => __( 'Could not save inquiry.', 'grahakavach-headless-core' ) ),
				500
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'id'      => $post_id,
				'message' => __( 'Inquiry received successfully.', 'grahakavach-headless-core' ),
			),
			201
		);
	}

	/**
	 * Authenticate user credentials securely using wp_authenticate().
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public static function handle_login( WP_REST_Request $request ): WP_REST_Response {
		$username = trim( (string) $request->get_param( 'username' ) );
		$password = (string) $request->get_param( 'password' );

		if ( empty( $username ) || empty( $password ) ) {
			return new WP_REST_Response(
				array( 'error' => __( 'Email and password are required.', 'grahakavach-headless-core' ) ),
				400
			);
		}

		// Authenticate against WordPress core
		$user = wp_authenticate( $username, $password );

		if ( is_wp_error( $user ) ) {
			return new WP_REST_Response(
				array( 'error' => __( 'Invalid email or password.', 'grahakavach-headless-core' ) ),
				401
			);
		}

		// Retrieve customer info
		$customer_id = $user->ID;
		$customer    = function_exists( 'wc_get_customer' ) ? wc_get_customer( $customer_id ) : null;

		$billing  = $customer ? $customer->get_billing() : array();
		$shipping = $customer ? $customer->get_shipping() : array();

		return new WP_REST_Response(
			array(
				'success'    => true,
				'customerId' => $customer_id,
				'email'      => $user->user_email,
				'username'   => $user->user_login,
				'firstName'  => $user->first_name ?: ( $customer ? $customer->get_first_name() : '' ),
				'lastName'   => $user->last_name ?: ( $customer ? $customer->get_last_name() : '' ),
				'roles'      => $user->roles,
				'billing'    => $billing,
				'shipping'   => $shipping,
			),
			200
		);
	}

	/**
	 * Global settings payload.
	 *
	 * Reads the same ACF content model that GraphQL serves, so REST and
	 * GraphQL can never disagree. Only the public subset is returned.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_settings(): WP_REST_Response {
		$id = GK_CPT::settings_post_id();

		$get = static function ( string $name ) use ( $id ) {
			if ( ! $id ) {
				return '';
			}

			$value = function_exists( 'get_field' ) ? get_field( $name, $id ) : get_post_meta( $id, $name, true );

			return is_scalar( $value ) ? (string) $value : '';
		};

		return new WP_REST_Response(
			array(
				'frontendUrl' => GK_Config::frontend_url(),
				'contact'     => array(
					'phone'    => $get( 'contact_phone_primary' ),
					'email'    => $get( 'contact_email_primary' ),
					'address'  => $get( 'contact_address' ),
					'whatsapp' => $get( 'contact_whatsapp_number' ),
					'mapsUrl'  => $get( 'contact_maps_url' ),
				),
				'social'      => array(
					'facebook'  => $get( 'social_facebook' ),
					'instagram' => $get( 'social_instagram' ),
					'linkedin'  => $get( 'social_linkedin' ),
					'youtube'   => $get( 'social_youtube' ),
					'x'         => $get( 'social_x' ),
				),
				'businessHours' => GK_Structured::parse( $get( 'contact_hours' ), array( 'days', 'hours' ) ),
			),
			200
		);
	}

	/**
	 * Lightweight status endpoint for deployment checks.
	 *
	 * Reports only booleans and versions — never a URL containing a secret and
	 * never the secret itself.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_health(): WP_REST_Response {
		return new WP_REST_Response(
			array(
				'plugin'              => GK_HEADLESS_VERSION,
				'graphql'             => class_exists( 'WPGraphQL' ),
				'woocommerce'         => class_exists( 'WooCommerce' ),
				'acf'                 => class_exists( 'ACF' ),
				'revalidationReady'   => GK_Config::revalidation_ready(),
				'noindex'             => GK_Config::noindex_enabled(),
				'allowedOriginCount'  => count( GK_Config::allowed_origins() ),
			),
			200
		);
	}
}

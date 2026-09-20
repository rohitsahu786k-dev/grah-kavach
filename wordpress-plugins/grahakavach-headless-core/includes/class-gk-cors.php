<?php
/**
 * Strict CORS for the headless APIs.
 *
 * Rules enforced here:
 *   - The origin must appear in an explicit allowlist. There is no wildcard.
 *   - `Access-Control-Allow-Credentials: true` is only ever sent alongside a
 *     single concrete origin, never alongside `*`. The two are mutually
 *     exclusive under the CORS spec and browsers reject the combination.
 *   - `Vary: Origin` is always sent so shared caches cannot serve one origin's
 *     CORS headers to another.
 *
 * The WooCommerce Store API needs `Cart-Token` and `Nonce` to survive the round
 * trip, so they are added to both the allowed and exposed header lists.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Applies an origin allowlist to REST and GraphQL responses.
 */
final class GK_Cors {

	/**
	 * Headers the browser may send.
	 */
	private const ALLOW_HEADERS = array(
		'Authorization',
		'Content-Type',
		'X-WP-Nonce',
		'Cart-Token',
		'Nonce',
		'X-GK-Request',
	);

	/**
	 * Headers the browser may read from the response.
	 */
	private const EXPOSE_HEADERS = array(
		'X-WP-Total',
		'X-WP-TotalPages',
		'Link',
		'Cart-Token',
		'Nonce',
		'Nonce-Timestamp',
	);

	public static function init(): void {
		// WordPress sets its own permissive-ish CORS headers by default.
		// Replace that handler entirely with ours.
		remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
		add_filter( 'rest_pre_serve_request', array( __CLASS__, 'rest_cors' ), 15 );

		// WPGraphQL has its own header pipeline.
		add_filter( 'graphql_response_headers_to_send', array( __CLASS__, 'graphql_cors' ) );

		// Answer preflight before WordPress routes the request.
		add_action( 'rest_api_init', array( __CLASS__, 'handle_preflight' ), 15 );
	}

	/**
	 * Resolve the request origin, if it is one we trust.
	 *
	 * @return string Empty string when the origin is absent or not allowed.
	 */
	private static function resolve_origin(): string {
		$origin = get_http_origin();

		if ( ! $origin ) {
			return '';
		}

		$parts = wp_parse_url( $origin );
		if ( empty( $parts['scheme'] ) || empty( $parts['host'] ) ) {
			return '';
		}

		$normalised = $parts['scheme'] . '://' . $parts['host'];
		if ( ! empty( $parts['port'] ) ) {
			$normalised .= ':' . $parts['port'];
		}

		return in_array( $normalised, GK_Config::allowed_origins(), true ) ? $normalised : '';
	}

	/**
	 * Build the header set for an allowed origin.
	 *
	 * @param string $origin Allowed origin.
	 * @return array<string,string>
	 */
	private static function headers_for( string $origin ): array {
		return array(
			'Access-Control-Allow-Origin'      => $origin,
			'Access-Control-Allow-Credentials' => 'true',
			'Access-Control-Allow-Methods'     => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
			'Access-Control-Allow-Headers'     => implode( ', ', self::ALLOW_HEADERS ),
			'Access-Control-Expose-Headers'    => implode( ', ', self::EXPOSE_HEADERS ),
			'Access-Control-Max-Age'           => '600',
		);
	}

	/**
	 * Attach CORS headers to REST responses.
	 *
	 * @param bool $served Whether the request has already been served.
	 * @return bool
	 */
	public static function rest_cors( $served ) {
		// Always vary, even for disallowed origins, so caches stay correct.
		header( 'Vary: Origin', false );

		$origin = self::resolve_origin();

		if ( '' === $origin ) {
			// No CORS headers at all. Same-origin and server-to-server calls
			// are unaffected; cross-origin browser calls are refused.
			return $served;
		}

		foreach ( self::headers_for( $origin ) as $name => $value ) {
			header( $name . ': ' . $value, true );
		}

		return $served;
	}

	/**
	 * Attach CORS headers to GraphQL responses.
	 *
	 * @param array $headers Existing headers.
	 * @return array
	 */
	public static function graphql_cors( $headers ): array {
		if ( ! is_array( $headers ) ) {
			$headers = array();
		}

		$headers['Vary'] = isset( $headers['Vary'] ) ? $headers['Vary'] . ', Origin' : 'Origin';

		$origin = self::resolve_origin();
		if ( '' === $origin ) {
			return $headers;
		}

		return array_merge( $headers, self::headers_for( $origin ) );
	}

	/**
	 * Short-circuit OPTIONS preflight requests with a 204.
	 */
	public static function handle_preflight(): void {
		$method = isset( $_SERVER['REQUEST_METHOD'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ) ) : '';

		if ( 'OPTIONS' !== $method ) {
			return;
		}

		header( 'Vary: Origin', false );

		$origin = self::resolve_origin();
		if ( '' === $origin ) {
			// Disallowed origin: reply without CORS headers. The browser will
			// block the follow-up request, which is the intended outcome.
			status_header( 403 );
			exit;
		}

		foreach ( self::headers_for( $origin ) as $name => $value ) {
			header( $name . ': ' . $value, true );
		}

		status_header( 204 );
		exit;
	}
}

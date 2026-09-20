<?php
/**
 * Stop the page cache from storing API responses.
 *
 * WHY THIS EXISTS
 * ---------------
 * LiteSpeed Cache on this host stores WooCommerce REST responses in its
 * "private" bucket with `max-age=1800`. That bucket is keyed by session
 * cookie — but a server-to-server call authenticated with HTTP Basic auth
 * carries no cookie, so it lands in the *cookieless* bucket, which every
 * anonymous visitor also shares.
 *
 * Reproduced on this install (2026-09-20):
 *
 *   1. GET /wp-json/wc/v3/settings/general?proof=N  with Basic auth
 *      -> 200, X-LiteSpeed-Cache: miss, stored private/max-age=1800
 *   2. GET the same URL with NO credentials
 *      -> 200, X-LiteSpeed-Cache: hit,private, full settings body returned
 *
 * With real data present this would expose orders and customer PII to
 * unauthenticated callers. Next.js reads Woo REST server-side with Basic auth
 * and no cookies, which is exactly the pattern that triggers it.
 *
 * Mitigation: mark every REST and GraphQL response uncacheable, through both
 * the LiteSpeed control API and standard HTTP headers.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Forces API responses to bypass the page cache.
 */
final class GK_Cache_Control {

	public static function init(): void {
		// REST: run late so nothing re-enables caching afterwards.
		add_action( 'rest_api_init', array( __CLASS__, 'disable_for_rest' ), 999 );
		add_filter( 'rest_pre_serve_request', array( __CLASS__, 'send_nocache_headers' ), 999 );

		// GraphQL.
		add_action( 'do_graphql_request', array( __CLASS__, 'disable_for_graphql' ), 999 );
		add_filter( 'graphql_response_headers_to_send', array( __CLASS__, 'graphql_nocache_headers' ), 999 );

		// Belt and braces: catch the endpoints before routing, in case another
		// plugin short-circuits the request earlier than rest_api_init.
		add_action( 'init', array( __CLASS__, 'maybe_disable_early' ), 1 );
	}

	/**
	 * Tell LiteSpeed (and any other cache listening) not to store this response.
	 */
	private static function set_nocache( string $reason ): void {
		// LiteSpeed Cache public API.
		do_action( 'litespeed_control_set_nocache', 'gk-headless: ' . $reason );

		// WP Super Cache / W3TC / generic.
		if ( ! defined( 'DONOTCACHEPAGE' ) ) {
			define( 'DONOTCACHEPAGE', true );
		}
		if ( ! defined( 'DONOTCACHEOBJECT' ) ) {
			define( 'DONOTCACHEOBJECT', true );
		}
		if ( ! defined( 'DONOTCACHEDB' ) ) {
			define( 'DONOTCACHEDB', true );
		}
	}

	/**
	 * Emit explicit no-store headers.
	 */
	private static function emit_headers(): void {
		if ( headers_sent() ) {
			return;
		}

		header( 'Cache-Control: no-cache, no-store, must-revalidate, max-age=0, private', true );
		header( 'X-LiteSpeed-Cache-Control: no-cache', true );
		header( 'Pragma: no-cache', true );
	}

	public static function disable_for_rest(): void {
		self::set_nocache( 'rest' );
	}

	/**
	 * @param bool $served Whether the response was already served.
	 * @return bool
	 */
	public static function send_nocache_headers( $served ) {
		self::set_nocache( 'rest' );
		self::emit_headers();

		return $served;
	}

	public static function disable_for_graphql(): void {
		self::set_nocache( 'graphql' );
	}

	/**
	 * @param array $headers Existing GraphQL headers.
	 * @return array
	 */
	public static function graphql_nocache_headers( $headers ): array {
		if ( ! is_array( $headers ) ) {
			$headers = array();
		}

		self::set_nocache( 'graphql' );

		$headers['Cache-Control']             = 'no-cache, no-store, must-revalidate, max-age=0, private';
		$headers['X-LiteSpeed-Cache-Control'] = 'no-cache';

		return $headers;
	}

	/**
	 * Catch API requests as early as possible based on the request path.
	 */
	public static function maybe_disable_early(): void {
		$uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';

		if ( '' === $uri ) {
			return;
		}

		if ( preg_match( '#^/(wp-json|graphql)(/|\?|$)#', $uri ) ) {
			self::set_nocache( 'early-path' );
		}
	}
}

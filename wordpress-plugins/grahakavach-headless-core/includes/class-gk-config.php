<?php
/**
 * Configuration resolver.
 *
 * Constants in wp-config.php always win over database options. Secrets are
 * only ever read from constants — never stored in, or read from, the options
 * table — so that a database dump never contains the webhook secret.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads plugin configuration from constants, then options.
 */
final class GK_Config {

	public const OPTION_KEY = 'gk_headless_settings';

	/**
	 * Default frontend origin. Used when nothing else is configured.
	 */
	public const DEFAULT_FRONTEND = 'https://grahakavach.in';

	/**
	 * Canonical public frontend URL, no trailing slash.
	 */
	public static function frontend_url(): string {
		if ( defined( 'GK_HEADLESS_FRONTEND_URL' ) && GK_HEADLESS_FRONTEND_URL ) {
			return untrailingslashit( (string) GK_HEADLESS_FRONTEND_URL );
		}

		$stored = self::option( 'frontend_url' );

		return $stored ? untrailingslashit( $stored ) : self::DEFAULT_FRONTEND;
	}

	/**
	 * Next.js revalidation endpoint. Empty string disables outbound webhooks.
	 */
	public static function revalidate_url(): string {
		if ( defined( 'GK_HEADLESS_REVALIDATE_URL' ) && GK_HEADLESS_REVALIDATE_URL ) {
			return (string) GK_HEADLESS_REVALIDATE_URL;
		}

		return (string) self::option( 'revalidate_url' );
	}

	/**
	 * Shared secret used to sign revalidation payloads.
	 *
	 * Deliberately constant-only. If this returns an empty string the webhook
	 * module refuses to send anything rather than sending it unsigned.
	 */
	public static function revalidate_secret(): string {
		if ( defined( 'GK_HEADLESS_REVALIDATE_SECRET' ) && GK_HEADLESS_REVALIDATE_SECRET ) {
			return (string) GK_HEADLESS_REVALIDATE_SECRET;
		}

		return '';
	}

	/**
	 * Explicit CORS origin allowlist.
	 *
	 * There is no wildcard fallback anywhere in this plugin. An unlisted origin
	 * simply receives no CORS headers.
	 *
	 * @return string[]
	 */
	public static function allowed_origins(): array {
		$raw = '';

		if ( defined( 'GK_HEADLESS_ALLOWED_ORIGINS' ) && GK_HEADLESS_ALLOWED_ORIGINS ) {
			$raw = (string) GK_HEADLESS_ALLOWED_ORIGINS;
		} else {
			$raw = (string) self::option( 'allowed_origins' );
		}

		$origins = array_filter( array_map( 'trim', explode( ',', $raw ) ) );

		$normalised = self::normalise_origins( $origins );

		// The fallback is applied *after* normalisation, not before: a config
		// value that is present but entirely malformed must still degrade to
		// the canonical frontend rather than to an empty allowlist. Falling
		// back to nothing would silently disable CORS for every origin.
		if ( empty( $normalised ) ) {
			// Fall back to the canonical frontend only. Never to '*'.
			$normalised = self::normalise_origins( array( self::frontend_url() ) );
		}

		return $normalised;
	}

	/**
	 * Normalise origins to scheme + host + optional port.
	 *
	 * Anything without both a scheme and a host is dropped, which excludes
	 * values such as `javascript:alert(1)` and bare hostnames.
	 *
	 * @param string[] $origins Raw origin strings.
	 * @return string[]
	 */
	private static function normalise_origins( array $origins ): array {
		$normalised = array();

		foreach ( $origins as $origin ) {
			$parts = wp_parse_url( $origin );
			if ( empty( $parts['scheme'] ) || empty( $parts['host'] ) ) {
				continue;
			}

			// Only web origins are meaningful for CORS.
			$scheme = strtolower( $parts['scheme'] );
			if ( 'http' !== $scheme && 'https' !== $scheme ) {
				continue;
			}

			$value = $scheme . '://' . $parts['host'];
			if ( ! empty( $parts['port'] ) ) {
				$value .= ':' . $parts['port'];
			}
			$normalised[] = $value;
		}

		return array_values( array_unique( $normalised ) );
	}

	/**
	 * Whether the public backend should be kept out of search indexes.
	 */
	public static function noindex_enabled(): bool {
		if ( defined( 'GK_HEADLESS_NOINDEX' ) ) {
			return (bool) GK_HEADLESS_NOINDEX;
		}

		$stored = self::option( 'noindex' );

		// Default on. This is a CMS backend, not a public site.
		return null === $stored ? true : (bool) $stored;
	}

	/**
	 * Read a single key from the options array.
	 *
	 * @param string $key Option key.
	 * @return mixed|null
	 */
	public static function option( string $key ) {
		$all = get_option( self::OPTION_KEY, array() );

		if ( ! is_array( $all ) || ! array_key_exists( $key, $all ) ) {
			return null;
		}

		return $all[ $key ];
	}

	/**
	 * Whether the webhook is fully configured and safe to fire.
	 */
	public static function revalidation_ready(): bool {
		return '' !== self::revalidate_url() && '' !== self::revalidate_secret();
	}
}

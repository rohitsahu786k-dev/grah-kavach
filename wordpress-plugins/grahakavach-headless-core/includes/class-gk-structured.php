<?php
/**
 * Structured list parser — the ACF-free Repeater substitute.
 *
 * ACF free has no Repeater field, and installing an unlicensed ACF Pro was
 * ruled out. Simple repeatable lists are therefore authored as one item per
 * line, with `|` separating the columns:
 *
 *     Fast response|Discharges in 10-12 seconds
 *     Wide throw|Reaches 3-4 metres
 *
 * Each list declares its own column names, so the same parser produces a typed
 * array for every shape. Malformed lines are skipped rather than saved, so a
 * stray line can never produce a half-populated item on the storefront.
 *
 * Richer repeatables that carry their own image and need reuse across pages
 * (FAQs, certifications, testimonials, safety guides, kit items) are custom
 * post types instead — see class-gk-cpt.php.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Parses pipe-delimited multi-line text into typed rows.
 */
final class GK_Structured {

	/**
	 * Parse raw textarea content into a list of rows.
	 *
	 * A row is kept only when every declared column has a non-empty value, so
	 * partial lines never reach the frontend. URL columns are validated and
	 * the row is dropped if the URL is not http(s) — this is what stops a
	 * `javascript:` value being rendered as a link.
	 *
	 * @param string   $raw     Raw field value.
	 * @param string[] $columns Ordered column names.
	 * @return array<int,array<string,string>>
	 */
	public static function parse( string $raw, array $columns ): array {
		if ( '' === trim( $raw ) || empty( $columns ) ) {
			return array();
		}

		$rows  = array();
		$count = count( $columns );

		foreach ( preg_split( '/\r\n|\r|\n/', $raw ) as $line ) {
			$line = trim( (string) $line );

			// Blank lines and comments are ignored.
			if ( '' === $line || 0 === strpos( $line, '#' ) ) {
				continue;
			}

			$parts = array_map( 'trim', explode( '|', $line, $count ) );

			if ( count( $parts ) !== $count ) {
				continue;
			}

			$row   = array();
			$valid = true;

			foreach ( $columns as $i => $column ) {
				$value = $parts[ $i ];

				if ( '' === $value ) {
					$valid = false;
					break;
				}

				if ( self::is_url_column( $column ) ) {
					$value = self::safe_url( $value );
					if ( '' === $value ) {
						$valid = false;
						break;
					}
				} else {
					$value = wp_strip_all_tags( $value );
				}

				$row[ $column ] = $value;
			}

			if ( $valid ) {
				$rows[] = $row;
			}
		}

		return $rows;
	}

	/**
	 * Whether a column holds a URL and must be validated as one.
	 *
	 * @param string $column Column name.
	 */
	private static function is_url_column( string $column ): bool {
		return in_array( $column, array( 'url', 'link', 'href' ), true );
	}

	/**
	 * Return the URL only when it is a safe http(s) absolute URL or a site
	 * relative path. Anything else becomes an empty string.
	 *
	 * @param string $value Candidate URL.
	 */
	private static function safe_url( string $value ): string {
		// Allow relative paths such as /shop or /about-us/.
		if ( 0 === strpos( $value, '/' ) && 0 !== strpos( $value, '//' ) ) {
			return esc_url_raw( $value );
		}

		if ( ! preg_match( '#^https?://#i', $value ) ) {
			return '';
		}

		return esc_url_raw( $value );
	}

	/**
	 * Human-readable hint shown under each structured field in the editor.
	 *
	 * @param string[] $columns Ordered column names.
	 */
	public static function instructions( array $columns ): string {
		$pattern = implode( ' | ', array_map( static function ( $c ) {
			return strtoupper( $c );
		}, $columns ) );

		return sprintf(
			/* translators: %s: the pipe-separated column pattern, e.g. "TITLE | TEXT". */
			__( 'One item per line, columns separated by "|" in this order: %s. Lines that do not match are ignored. Start a line with # to comment it out.', 'grahakavach-headless-core' ),
			$pattern
		);
	}
}

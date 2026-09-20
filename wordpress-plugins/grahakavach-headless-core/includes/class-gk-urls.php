<?php
/**
 * Frontend URL helpers.
 *
 * Every public URL the backend hands out must point at the storefront, never at
 * admin.grahakavach.in. These helpers are the single place that mapping happens.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Translates backend URLs into public storefront URLs.
 */
final class GK_Urls {

	/**
	 * Map a backend permalink onto the storefront.
	 *
	 * Only the origin is swapped; the path is preserved, because both sides use
	 * the same `/%postname%/` permalink structure.
	 *
	 * @param string $url Backend URL.
	 * @return string
	 */
	public static function to_frontend( string $url ): string {
		if ( '' === $url ) {
			return '';
		}

		$path = wp_make_link_relative( $url );

		// wp_make_link_relative leaves external URLs untouched; if nothing
		// changed and the URL is off-site, hand it back as-is.
		if ( $path === $url && preg_match( '#^https?://#i', $url ) ) {
			return $url;
		}

		return GK_Config::frontend_url() . $path;
	}

	/**
	 * Public storefront URL for a post or page.
	 *
	 * @param int $post_id Post ID.
	 * @return string
	 */
	public static function for_post( int $post_id ): string {
		$permalink = get_permalink( $post_id );

		return $permalink ? self::to_frontend( $permalink ) : '';
	}

	/**
	 * Next.js cache tags a given post should invalidate.
	 *
	 * Mirrors the tag scheme documented in docs/ARCHITECTURE.md §8.
	 *
	 * @param int $post_id Post ID.
	 * @return string[]
	 */
	public static function tags_for_post( int $post_id ): array {
		$post = get_post( $post_id );

		if ( ! $post ) {
			return array();
		}

		$tags = array();

		switch ( $post->post_type ) {
			case GK_CPT::SETTINGS:
				// Global settings affect every rendered page.
				$tags[] = 'wp-settings';
				break;

			case GK_CPT::FAQ:
			case GK_CPT::CERTIFICATION:
			case GK_CPT::TESTIMONIAL:
			case GK_CPT::SAFETY_GUIDE:
			case GK_CPT::KIT_ITEM:
				// Reusable content is embedded in several surfaces, so
				// invalidate both its own tag and the pages that compose it.
				$tags[] = 'wp-' . $post->post_type . ':' . $post->ID;
				$tags[] = 'wp-' . $post->post_type;
				$tags[] = 'wp-page:home';
				break;

			case 'page':
				$tags[] = 'wp-page:' . $post->post_name;
				break;
			case 'post':
				$tags[] = 'wp-post:' . $post->post_name;
				$tags[] = 'wp-posts';
				break;
			case 'product':
				$tags[] = 'woo-product:' . $post->ID;
				$tags[] = 'woo-products';
				break;
			default:
				$tags[] = 'wp-' . $post->post_type . ':' . $post->post_name;
		}

		return $tags;
	}
}

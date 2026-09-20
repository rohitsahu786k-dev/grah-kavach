<?php
/**
 * Core GraphQL registrations: menus and content URL helpers.
 *
 * Global settings used to be registered here, backed by the plugin's own
 * options screen. That moved to the ACF content model in Phase 3 — see
 * class-gk-content-graphql.php, which now owns `grahaKavachSettings`.
 * Registering it in both places would define the same root field twice and
 * leave two sources of truth for the same data, so this file no longer
 * touches it.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers menu locations and per-node frontend URL fields.
 */
final class GK_GraphQL {

	public static function init(): void {
		// Header and footer navigation are native WordPress menus: drag-and-drop
		// ordering for editors, and WPGraphQL exposes registered locations with
		// no extra code. Footer *link groups* are a structured field in the
		// settings model; these menus cover the primary navigation.
		add_action( 'after_setup_theme', array( __CLASS__, 'register_menus' ) );

		add_action( 'graphql_register_types', array( __CLASS__, 'register_types' ) );
	}

	/**
	 * Register header/footer menu locations.
	 */
	public static function register_menus(): void {
		register_nav_menus(
			array(
				'gk_header' => __( 'Graha Kavach — Header', 'grahakavach-headless-core' ),
				'gk_footer' => __( 'Graha Kavach — Footer', 'grahakavach-headless-core' ),
			)
		);
	}

	/**
	 * Add the public storefront URL to content nodes.
	 */
	public static function register_types(): void {
		if ( ! function_exists( 'register_graphql_field' ) ) {
			return;
		}

		foreach ( array( 'Post', 'Page' ) as $type ) {
			register_graphql_field(
				$type,
				'frontendUri',
				array(
					'type'        => 'String',
					'description' => __( 'Canonical URL of this content on the public storefront.', 'grahakavach-headless-core' ),
					'resolve'     => static function ( $node ) {
						$id = is_object( $node ) && isset( $node->databaseId ) ? (int) $node->databaseId : 0;

						return $id ? GK_Urls::for_post( $id ) : '';
					},
				)
			);
		}
	}
}

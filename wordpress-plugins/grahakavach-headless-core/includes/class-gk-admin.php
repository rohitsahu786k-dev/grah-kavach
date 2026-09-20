<?php
/**
 * Admin helpers.
 *
 * Small quality-of-life changes that make a headless backend less confusing to
 * work in. Nothing here alters content or third-party plugin behaviour.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Editor-facing helpers for the headless backend.
 */
final class GK_Admin {

	public static function init(): void {
		// "View" and "Preview" should open the storefront, not the backend.
		add_filter( 'post_row_actions', array( __CLASS__, 'filter_row_actions' ), 10, 2 );
		add_filter( 'page_row_actions', array( __CLASS__, 'filter_row_actions' ), 10, 2 );

		// Make it obvious which install an editor is looking at.
		add_action( 'admin_notices', array( __CLASS__, 'headless_notice' ) );
		add_action( 'admin_bar_menu', array( __CLASS__, 'admin_bar_link' ), 100 );

		// Disable XML-RPC and pingback header (headless uses WPGraphQL & REST v3; prevents brute-force / amplification vectors).
		add_filter( 'xmlrpc_enabled', '__return_false' );
		add_filter( 'wp_headers', array( __CLASS__, 'remove_pingback_header' ) );
	}

	/**
	 * Point the row "View" link at the storefront.
	 *
	 * @param array   $actions Row actions.
	 * @param WP_Post $post    Post object.
	 * @return array
	 */
	public static function filter_row_actions( $actions, $post ): array {
		if ( ! is_array( $actions ) || ! $post instanceof WP_Post ) {
			return (array) $actions;
		}

		if ( 'publish' !== $post->post_status ) {
			return $actions;
		}

		$url = GK_Urls::for_post( (int) $post->ID );

		if ( '' === $url ) {
			return $actions;
		}

		$actions['view'] = sprintf(
			'<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>',
			esc_url( $url ),
			esc_html__( 'View on site', 'grahakavach-headless-core' )
		);

		return $actions;
	}

	/**
	 * One-line reminder that this install is not the public site.
	 */
	public static function headless_notice(): void {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

		// Only on the dashboard, to avoid nagging on every screen.
		if ( ! $screen || 'dashboard' !== $screen->id ) {
			return;
		}

		printf(
			'<div class="notice notice-info"><p><strong>%s</strong> %s <a href="%s" target="_blank" rel="noopener noreferrer">%s</a></p></div>',
			esc_html__( 'Headless backend.', 'grahakavach-headless-core' ),
			esc_html__( 'This install is the CMS and commerce backend. The public storefront is served by Next.js at', 'grahakavach-headless-core' ),
			esc_url( GK_Config::frontend_url() ),
			esc_html( GK_Config::frontend_url() )
		);
	}

	/**
	 * Replace the admin bar "Visit Site" target with the storefront.
	 *
	 * @param WP_Admin_Bar $bar Admin bar instance.
	 */
	public static function admin_bar_link( $bar ): void {
		if ( ! $bar instanceof WP_Admin_Bar ) {
			return;
		}

		$node = $bar->get_node( 'view-site' );

		if ( ! $node ) {
			return;
		}

		$bar->add_node(
			array(
				'id'    => 'view-site',
				'title' => __( 'Visit Storefront', 'grahakavach-headless-core' ),
				'href'  => GK_Config::frontend_url(),
				'meta'  => array( 'target' => '_blank' ),
			)
		);
	}

	/**
	 * Remove the X-Pingback header.
	 *
	 * @param array $headers HTTP headers.
	 * @return array
	 */
	public static function remove_pingback_header( array $headers ): array {
		unset( $headers['X-Pingback'] );
		return $headers;
	}
}

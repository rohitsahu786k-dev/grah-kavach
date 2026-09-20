<?php
/**
 * Uninstall handler.
 *
 * Removes only the plugin's own option row. Content, products, menus and
 * third-party plugin data are never touched.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'gk_headless_settings' );

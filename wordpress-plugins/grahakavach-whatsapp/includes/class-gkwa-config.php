<?php
/**
 * Settings resolver.
 *
 * Credentials are read from wp-config.php constants first and only then from
 * the options table, so production can keep the access token out of the
 * database entirely:
 *
 *   define( 'GKWA_ACCESS_TOKEN', '...' );   // System User token, never expires
 *   define( 'GKWA_APP_SECRET',   '...' );   // Meta app secret (webhook signature)
 *   define( 'GKWA_VERIFY_TOKEN', '...' );   // any random string, typed into Meta
 *   define( 'GKWA_DISABLED',     true );    // emergency kill switch, no deploy needed
 *
 * @package GrahaKavach\WhatsApp
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GKWA_Config {

	public const OPTION = 'gkwa_settings';

	/**
	 * @return array<string,mixed>
	 */
	public static function defaults(): array {
		return array(
			'enabled'            => 0,
			'phone_id'           => '',
			'waba_id'            => '',
			'access_token'       => '',
			'app_secret'         => '',
			'verify_token'       => '',
			'language'           => 'en_US',
			'country_code'       => '91',
			'admin_phone'        => '',
			'cart_delay_1'       => 60,
			'cart_delay_2'       => 1440,
			'processing_delay'   => 5,
			'delivery_eta'       => '3-7 business days',
			'disabled_templates' => array(),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function all(): array {
		$stored = get_option( self::OPTION, array() );

		return array_merge( self::defaults(), is_array( $stored ) ? $stored : array() );
	}

	/**
	 * @param string $key Setting key.
	 * @return mixed
	 */
	public static function get( string $key ) {
		$all = self::all();

		return $all[ $key ] ?? null;
	}

	private static function secret( string $constant, string $key ): string {
		if ( defined( $constant ) && constant( $constant ) ) {
			return trim( (string) constant( $constant ) );
		}

		return trim( (string) self::get( $key ) );
	}

	public static function access_token(): string {
		return self::secret( 'GKWA_ACCESS_TOKEN', 'access_token' );
	}

	public static function app_secret(): string {
		return self::secret( 'GKWA_APP_SECRET', 'app_secret' );
	}

	public static function verify_token(): string {
		return self::secret( 'GKWA_VERIFY_TOKEN', 'verify_token' );
	}

	public static function phone_id(): string {
		return preg_replace( '/\D/', '', (string) self::get( 'phone_id' ) );
	}

	public static function waba_id(): string {
		return preg_replace( '/\D/', '', (string) self::get( 'waba_id' ) );
	}

	public static function secret_from_constant( string $constant ): bool {
		return defined( $constant ) && constant( $constant );
	}

	/**
	 * Shared secret with the Next.js storefront. Reuses the existing
	 * revalidation secret so no new configuration is needed on either side.
	 */
	public static function bridge_secret(): string {
		if ( class_exists( 'GK_Config' ) ) {
			return GK_Config::revalidate_secret();
		}

		return defined( 'GK_HEADLESS_REVALIDATE_SECRET' ) ? (string) GK_HEADLESS_REVALIDATE_SECRET : '';
	}

	public static function frontend_url(): string {
		if ( class_exists( 'GK_Config' ) ) {
			return GK_Config::frontend_url();
		}

		return 'https://grahakavach.in';
	}

	/**
	 * Master switch. The constant always wins so it works as a kill switch even
	 * when wp-admin is unreachable.
	 */
	public static function enabled(): bool {
		if ( defined( 'GKWA_DISABLED' ) && GKWA_DISABLED ) {
			return false;
		}

		return ! empty( self::get( 'enabled' ) );
	}

	public static function credentials_ready(): bool {
		return '' !== self::access_token() && '' !== self::phone_id();
	}

	public static function template_enabled( string $template ): bool {
		$disabled = self::get( 'disabled_templates' );

		return ! is_array( $disabled ) || ! in_array( $template, $disabled, true );
	}
}

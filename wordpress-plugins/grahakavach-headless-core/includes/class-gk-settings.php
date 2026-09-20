<?php
/**
 * Technical headless configuration.
 *
 * SCOPE — read this before adding a field here.
 *
 * This screen holds *infrastructure* settings only: where the storefront
 * lives, which origins may call the API, and whether the backend is indexed.
 *
 * All *editorial* content — brand assets, contact details, social links,
 * header/footer copy, commerce messaging — lives in the ACF content model
 * under **Site Settings** and is defined in class-gk-model.php. Phase 3 moved
 * it there deliberately: having brand and contact data in two screens meant
 * two sources of truth and an inevitable drift between them.
 *
 * If a field is something a content editor would change, it belongs in the ACF
 * model, not here.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers and renders the headless configuration screen.
 */
final class GK_Settings {

	private const PAGE_SLUG = 'gk-headless-settings';
	private const GROUP     = 'gk_headless_settings_group';

	public static function init(): void {
		add_action( 'admin_menu', array( __CLASS__, 'add_page' ) );
		add_action( 'admin_init', array( __CLASS__, 'register' ) );
	}

	/**
	 * Default values.
	 *
	 * @return array<string,mixed>
	 */
	public static function defaults(): array {
		return array(
			'frontend_url'    => GK_Config::DEFAULT_FRONTEND,
			'revalidate_url'  => '',
			'allowed_origins' => '',
			'noindex'         => 1,
		);
	}

	/**
	 * Current settings merged over defaults.
	 *
	 * @return array<string,mixed>
	 */
	public static function all(): array {
		$stored = get_option( GK_Config::OPTION_KEY, array() );

		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		return array_merge( self::defaults(), $stored );
	}

	public static function add_page(): void {
		add_options_page(
			__( 'Graha Kavach Headless', 'grahakavach-headless-core' ),
			__( 'Graha Kavach Headless', 'grahakavach-headless-core' ),
			'manage_options',
			self::PAGE_SLUG,
			array( __CLASS__, 'render' )
		);
	}

	public static function register(): void {
		register_setting(
			self::GROUP,
			GK_Config::OPTION_KEY,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize' ),
				'default'           => self::defaults(),
			)
		);
	}

	/**
	 * Sanitise every field on save.
	 *
	 * Unknown keys are dropped rather than merged, so stale editorial values
	 * left over from the pre-Phase-3 version of this screen are cleaned up the
	 * first time it is saved.
	 *
	 * @param mixed $input Raw submitted value.
	 * @return array<string,mixed>
	 */
	public static function sanitize( $input ): array {
		if ( ! is_array( $input ) ) {
			return self::defaults();
		}

		return array(
			'frontend_url'    => esc_url_raw( $input['frontend_url'] ?? '' ),
			'revalidate_url'  => esc_url_raw( $input['revalidate_url'] ?? '' ),
			'allowed_origins' => sanitize_text_field( $input['allowed_origins'] ?? '' ),
			'noindex'         => empty( $input['noindex'] ) ? 0 : 1,
		);
	}

	/**
	 * Render the screen.
	 */
	public static function render(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$s    = self::all();
		$name = GK_Config::OPTION_KEY;
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Graha Kavach — Headless Configuration', 'grahakavach-headless-core' ); ?></h1>

			<p class="description">
				<?php esc_html_e( 'Technical settings only. Brand, contact, social and all other editable content live under Site Settings.', 'grahakavach-headless-core' ); ?>
			</p>

			<form method="post" action="options.php">
				<?php settings_fields( self::GROUP ); ?>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="gk_frontend"><?php esc_html_e( 'Frontend URL', 'grahakavach-headless-core' ); ?></label></th>
						<td>
							<input id="gk_frontend" class="regular-text" type="url" name="<?php echo esc_attr( $name ); ?>[frontend_url]" value="<?php echo esc_attr( $s['frontend_url'] ); ?>" />
							<?php if ( defined( 'GK_HEADLESS_FRONTEND_URL' ) ) : ?>
								<p class="description"><strong><?php esc_html_e( 'Overridden by wp-config.php.', 'grahakavach-headless-core' ); ?></strong></p>
							<?php endif; ?>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="gk_revalidate"><?php esc_html_e( 'Revalidation endpoint', 'grahakavach-headless-core' ); ?></label></th>
						<td>
							<input id="gk_revalidate" class="regular-text" type="url" name="<?php echo esc_attr( $name ); ?>[revalidate_url]" value="<?php echo esc_attr( $s['revalidate_url'] ); ?>" />
							<p class="description">
								<?php
								echo GK_Config::revalidation_ready()
									? '<span style="color:#1a7f37">' . esc_html__( 'Configured — webhooks are signed and active.', 'grahakavach-headless-core' ) . '</span>'
									: '<span style="color:#b32d2e">' . esc_html__( 'Inactive. Set GK_HEADLESS_REVALIDATE_SECRET in wp-config.php. Webhooks never fire unsigned.', 'grahakavach-headless-core' ) . '</span>';
								?>
							</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="gk_origins"><?php esc_html_e( 'Allowed CORS origins', 'grahakavach-headless-core' ); ?></label></th>
						<td>
							<input id="gk_origins" class="large-text" type="text" name="<?php echo esc_attr( $name ); ?>[allowed_origins]" value="<?php echo esc_attr( $s['allowed_origins'] ); ?>" />
							<p class="description">
								<?php esc_html_e( 'Comma separated, scheme + host, no trailing slash. Wildcards are not accepted.', 'grahakavach-headless-core' ); ?><br />
								<?php esc_html_e( 'Currently active:', 'grahakavach-headless-core' ); ?>
								<code><?php echo esc_html( implode( ', ', GK_Config::allowed_origins() ) ); ?></code>
							</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Search engines', 'grahakavach-headless-core' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="<?php echo esc_attr( $name ); ?>[noindex]" value="1" <?php checked( ! empty( $s['noindex'] ) ); ?> />
								<?php esc_html_e( 'Keep this backend out of search engines (recommended)', 'grahakavach-headless-core' ); ?>
							</label>
							<p class="description"><?php esc_html_e( 'Applies to public page views only. wp-admin, REST and GraphQL are never affected.', 'grahakavach-headless-core' ); ?></p>
						</td>
					</tr>
				</table>

				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}
}

<?php
/**
 * SEO redirect manager.
 *
 * Lets an SEO manager add 301/302/307/308/410 rules from wp-admin without a
 * deploy. Rules live in one option, are served to the storefront through the
 * public `gk/v1/redirects` endpoint, and are applied by the Next.js proxy.
 *
 * Who can use it: administrators, plus the Yoast "SEO Manager" and "SEO
 * Editor" roles and WooCommerce Shop Managers (anyone with `wpseo_manage_options`,
 * `wpseo_bulk_edit` or `manage_woocommerce`),
 * through the `gk_manage_redirects` capability.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Redirect rules: storage, admin screen, REST output.
 */
final class GK_Redirects {

	public const OPTION = 'gk_redirects';
	public const CAP    = 'gk_manage_redirects';
	public const SLUG   = 'gk-redirects';
	public const TAG    = 'wp-redirects';
	public const LIMIT  = 1000;

	/**
	 * Allowed status codes. 410 means "gone" and needs no destination.
	 *
	 * @var int[]
	 */
	private const CODES = array( 301, 302, 307, 308, 410 );

	/**
	 * Paths that must never be redirected, so a bad rule cannot lock anyone out.
	 *
	 * @var string[]
	 */
	private const PROTECTED = array( '/api', '/_next', '/wp-admin', '/wp-login.php', '/robots.txt', '/sitemap.xml' );

	public static function init(): void {
		add_filter( 'user_has_cap', array( __CLASS__, 'grant_cap' ), 10, 4 );
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ) );
		add_action( 'admin_post_gk_redirect_save', array( __CLASS__, 'handle_save' ) );
		add_action( 'admin_post_gk_redirect_bulk', array( __CLASS__, 'handle_bulk' ) );
		add_action( 'admin_post_gk_redirect_import', array( __CLASS__, 'handle_import' ) );
		add_action( 'admin_post_gk_redirect_export', array( __CLASS__, 'handle_export' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		add_action( 'update_option_' . self::OPTION, array( __CLASS__, 'on_change' ) );
		add_action( 'add_option_' . self::OPTION, array( __CLASS__, 'on_change' ) );
	}

	/**
	 * Give admins, Yoast SEO roles and WooCommerce Shop Managers the redirect capability.
	 *
	 * @param array $allcaps All capabilities of the user.
	 * @return array
	 */
	public static function grant_cap( $allcaps, $caps = array(), $args = array(), $user = null ): array {
		$allcaps = (array) $allcaps;

		if ( ! empty( $allcaps['manage_options'] ) || ! empty( $allcaps['wpseo_manage_options'] ) || ! empty( $allcaps['wpseo_bulk_edit'] ) || ! empty( $allcaps['manage_woocommerce'] ) ) {
			$allcaps[ self::CAP ] = true;
		}

		return $allcaps;
	}

	public static function on_change(): void {
		GK_Revalidation::queue( array( self::TAG ) );
	}

	public static function register_menu(): void {
		add_menu_page(
			__( 'Redirects', 'grahakavach-headless-core' ),
			__( 'Redirects', 'grahakavach-headless-core' ),
			self::CAP,
			self::SLUG,
			array( __CLASS__, 'render_page' ),
			'dashicons-randomize',
			80
		);
	}

	/**
	 * Public, read-only list of enabled rules for the storefront proxy.
	 */
	public static function register_routes(): void {
		register_rest_route(
			GK_Rest::NAMESPACE,
			'/redirects',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'permission_callback' => '__return_true',
				'callback'            => static function (): WP_REST_Response {
					$rules = array();

					foreach ( self::all() as $rule ) {
						if ( empty( $rule['enabled'] ) ) {
							continue;
						}
						$rules[] = array(
							'from' => $rule['from'],
							'to'   => $rule['to'],
							'code' => (int) $rule['code'],
							'wild' => ! empty( $rule['wild'] ),
						);
					}

					$response = new WP_REST_Response( array( 'redirects' => $rules ) );
					$response->header( 'Cache-Control', 'public, max-age=30' );

					return $response;
				},
			)
		);
	}

	/* ------------------------------------------------------------------ *
	 * Storage and validation
	 * ------------------------------------------------------------------ */

	/**
	 * @return array<int, array<string, mixed>>
	 */
	public static function all(): array {
		$rules = get_option( self::OPTION, array() );

		return is_array( $rules ) ? array_values( $rules ) : array();
	}

	/**
	 * Normalise a source path: leading slash, no query/fragment, no trailing slash.
	 */
	public static function normalise_from( string $from ): string {
		$from = trim( $from );

		// Accept a full storefront URL pasted from the browser.
		if ( preg_match( '#^https?://#i', $from ) ) {
			$path = wp_parse_url( $from, PHP_URL_PATH );
			$from = is_string( $path ) ? $path : '/';
		}

		$from = (string) preg_replace( '/[?#].*$/', '', $from );
		$from = '/' . ltrim( $from, '/' );

		if ( '/' !== $from ) {
			$from = untrailingslashit( $from );
		}

		return strtolower( $from );
	}

	/**
	 * Normalise a destination: a root-relative path or an absolute http(s) URL.
	 *
	 * @return string Empty string when invalid, including any URL outside the storefront domain.
	 */
	public static function normalise_to( string $to ): string {
		$to = trim( $to );

		if ( '' === $to ) {
			return '';
		}

		if ( preg_match( '#^https?://#i', $to ) ) {
			$clean = esc_url_raw( $to );

			// Only the storefront domain is allowed. It is stored as a path so it survives a domain change.
			$front = strtolower( (string) preg_replace( '/^www\./', '', (string) wp_parse_url( GK_Config::frontend_url(), PHP_URL_HOST ) ) );
			$host  = strtolower( (string) preg_replace( '/^www\./', '', (string) wp_parse_url( $clean, PHP_URL_HOST ) ) );
			if ( '' === $front || $front !== $host ) {
				return '';
			}

			$path  = (string) wp_parse_url( $clean, PHP_URL_PATH );
			$query = (string) wp_parse_url( $clean, PHP_URL_QUERY );
			return ( '' === $path ? '/' : $path ) . ( '' !== $query ? '?' . $query : '' );
		}

		// Reject schemeless junk such as "javascript:..." or "//evil.com".
		if ( preg_match( '#^[a-z][a-z0-9+.-]*:#i', $to ) || 0 === strpos( $to, '//' ) ) {
			return '';
		}

		return '/' . ltrim( (string) esc_url_raw( $to ), '/' );
	}

	/**
	 * Validate one rule against the existing list.
	 *
	 * @param array<string, mixed> $input    Raw rule.
	 * @param array<int, array>    $existing Other rules (excluding the one being edited).
	 * @return array<string, mixed>|WP_Error
	 */
	public static function build_rule( array $input, array $existing ) {
		$code = (int) ( $input['code'] ?? 301 );
		$wild = ! empty( $input['wild'] );
		$from = self::normalise_from( (string) ( $input['from'] ?? '' ) );
		$to   = 410 === $code ? '' : self::normalise_to( (string) ( $input['to'] ?? '' ) );

		if ( ! in_array( $code, self::CODES, true ) ) {
			return new WP_Error( 'gk_code', __( 'Pick a valid redirect type.', 'grahakavach-headless-core' ) );
		}

		if ( '/' === $from && ! $wild ) {
			return new WP_Error( 'gk_home', __( 'The home page cannot be redirected.', 'grahakavach-headless-core' ) );
		}

		foreach ( self::PROTECTED as $path ) {
			if ( $from === $path || 0 === strpos( $from, $path . '/' ) ) {
				/* translators: %s: protected path */
				return new WP_Error( 'gk_protected', sprintf( __( '%s is reserved and cannot be redirected.', 'grahakavach-headless-core' ), $path ) );
			}
		}

		if ( 410 !== $code && '' === $to ) {
			return new WP_Error( 'gk_to', __( 'Enter a valid destination on grahakavach.in: a path like /fire-safety-kit or a full https://grahakavach.in/... URL. External sites are not allowed.', 'grahakavach-headless-core' ) );
		}

		if ( 410 !== $code && ! $wild && strtolower( strtok( $to, '?' ) ) === $from ) {
			return new WP_Error( 'gk_loop', __( 'Source and destination are the same.', 'grahakavach-headless-core' ) );
		}

		foreach ( $existing as $other ) {
			if ( $other['from'] === $from ) {
				/* translators: %s: source path */
				return new WP_Error( 'gk_dupe', sprintf( __( 'A rule for %s already exists.', 'grahakavach-headless-core' ), $from ) );
			}

			// A -> B while B -> A is a loop.
			if ( 410 !== $code && ! $wild && empty( $other['wild'] ) && $other['to'] === $from && strtolower( strtok( $to, '?' ) ) === $other['from'] ) {
				/* translators: %s: source path */
				return new WP_Error( 'gk_loop', sprintf( __( 'This would create a redirect loop with the rule for %s.', 'grahakavach-headless-core' ), $other['from'] ) );
			}
		}

		return array(
			'id'      => (string) ( $input['id'] ?? '' ) ?: wp_generate_uuid4(),
			'from'    => $from,
			'to'      => $to,
			'code'    => $code,
			'wild'    => $wild,
			'enabled' => ! isset( $input['enabled'] ) || ! empty( $input['enabled'] ),
			'note'    => sanitize_text_field( (string) ( $input['note'] ?? '' ) ),
			'updated' => time(),
			'by'      => get_current_user_id(),
		);
	}

	/* ------------------------------------------------------------------ *
	 * Form handlers
	 * ------------------------------------------------------------------ */

	private static function guard( string $nonce_action ): void {
		if ( ! current_user_can( self::CAP ) ) {
			wp_die( esc_html__( 'You do not have permission to manage redirects.', 'grahakavach-headless-core' ), 403 );
		}
		check_admin_referer( $nonce_action );
	}

	private static function back( string $notice, string $type = 'success', array $extra = array() ): void {
		$url = add_query_arg(
			array_merge(
				array(
					'page'      => self::SLUG,
					'gk_notice' => rawurlencode( $notice ),
					'gk_type'   => $type,
				),
				$extra
			),
			admin_url( 'admin.php' )
		);
		wp_safe_redirect( $url );
		exit;
	}

	public static function handle_save(): void {
		self::guard( 'gk_redirect_save' );

		$rules = self::all();
		$id    = sanitize_text_field( wp_unslash( (string) ( $_POST['id'] ?? '' ) ) ); // phpcs:ignore WordPress.Security.NonceVerification
		$index = null;

		foreach ( $rules as $i => $rule ) {
			if ( '' !== $id && $rule['id'] === $id ) {
				$index = $i;
			}
		}

		if ( null === $index && count( $rules ) >= self::LIMIT ) {
			self::back( __( 'Rule limit reached. Delete unused rules first.', 'grahakavach-headless-core' ), 'error' );
		}

		$others = $rules;
		if ( null !== $index ) {
			unset( $others[ $index ] );
		}

		$rule = self::build_rule( wp_unslash( $_POST ), array_values( $others ) ); // phpcs:ignore WordPress.Security.NonceVerification

		if ( is_wp_error( $rule ) ) {
			self::back( $rule->get_error_message(), 'error', '' !== $id ? array( 'edit' => $id ) : array() );
		}

		if ( null !== $index ) {
			$rules[ $index ] = $rule;
		} else {
			array_unshift( $rules, $rule );
		}

		update_option( self::OPTION, array_values( $rules ), false );
		self::back( null !== $index ? __( 'Redirect updated.', 'grahakavach-headless-core' ) : __( 'Redirect added.', 'grahakavach-headless-core' ) );
	}

	public static function handle_bulk(): void {
		self::guard( 'gk_redirect_bulk' );

		$ids    = array_map( 'sanitize_text_field', (array) wp_unslash( $_POST['ids'] ?? array() ) ); // phpcs:ignore WordPress.Security.NonceVerification
		$action = sanitize_key( wp_unslash( (string) ( $_POST['bulk_action'] ?? '' ) ) ); // phpcs:ignore WordPress.Security.NonceVerification

		if ( empty( $ids ) || ! in_array( $action, array( 'delete', 'enable', 'disable' ), true ) ) {
			self::back( __( 'Select at least one rule and an action.', 'grahakavach-headless-core' ), 'error' );
		}

		$rules = array();
		foreach ( self::all() as $rule ) {
			if ( in_array( $rule['id'], $ids, true ) ) {
				if ( 'delete' === $action ) {
					continue;
				}
				$rule['enabled'] = 'enable' === $action;
			}
			$rules[] = $rule;
		}

		update_option( self::OPTION, $rules, false );
		self::back( __( 'Redirects updated.', 'grahakavach-headless-core' ) );
	}

	/**
	 * CSV import: from,to,code[,note]. Invalid and duplicate lines are skipped and counted.
	 */
	public static function handle_import(): void {
		self::guard( 'gk_redirect_import' );

		$csv   = (string) wp_unslash( $_POST['csv'] ?? '' ); // phpcs:ignore WordPress.Security.NonceVerification
		$rules = self::all();
		$added = 0;
		$skip  = 0;

		foreach ( preg_split( '/\r\n|\r|\n/', $csv ) ?: array() as $line ) {
			$line = trim( $line );
			if ( '' === $line ) {
				continue;
			}

			$cols = str_getcsv( $line );
			if ( 'from' === strtolower( trim( (string) $cols[0] ) ) || count( $rules ) >= self::LIMIT ) {
				continue;
			}

			$rule = self::build_rule(
				array(
					'from' => $cols[0] ?? '',
					'to'   => $cols[1] ?? '',
					'code' => isset( $cols[2] ) && '' !== trim( $cols[2] ) ? $cols[2] : 301,
					'note' => $cols[3] ?? '',
				),
				$rules
			);

			if ( is_wp_error( $rule ) ) {
				++$skip;
				continue;
			}

			$rules[] = $rule;
			++$added;
		}

		update_option( self::OPTION, $rules, false );

		/* translators: 1: added count, 2: skipped count */
		self::back( sprintf( __( 'Imported %1$d redirects, skipped %2$d invalid or duplicate lines.', 'grahakavach-headless-core' ), $added, $skip ), $added > 0 ? 'success' : 'warning' );
	}

	public static function handle_export(): void {
		if ( ! current_user_can( self::CAP ) ) {
			wp_die( esc_html__( 'You do not have permission to manage redirects.', 'grahakavach-headless-core' ), 403 );
		}
		check_admin_referer( 'gk_redirect_export' );

		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="graha-kavach-redirects.csv"' );

		$out = fopen( 'php://output', 'w' );
		fputcsv( $out, array( 'from', 'to', 'code', 'note' ) );
		foreach ( self::all() as $rule ) {
			// Guard against spreadsheet formula injection.
			$note = (string) $rule['note'];
			if ( '' !== $note && in_array( $note[0], array( '=', '+', '-', '@' ), true ) ) {
				$note = "'" . $note;
			}
			fputcsv( $out, array( $rule['from'], $rule['to'], $rule['code'], $note ) );
		}
		fclose( $out ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
		exit;
	}

	/* ------------------------------------------------------------------ *
	 * Admin screen
	 * ------------------------------------------------------------------ */

	public static function render_page(): void {
		if ( ! current_user_can( self::CAP ) ) {
			wp_die( esc_html__( 'You do not have permission to manage redirects.', 'grahakavach-headless-core' ), 403 );
		}

		$rules   = self::all();
		$edit_id = isset( $_GET['edit'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['edit'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
		$editing = array();
		foreach ( $rules as $rule ) {
			if ( '' !== $edit_id && $rule['id'] === $edit_id ) {
				$editing = $rule;
			}
		}

		$search = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['s'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
		if ( '' !== $search ) {
			$rules = array_values(
				array_filter(
					$rules,
					static function ( $rule ) use ( $search ) {
						return false !== stripos( $rule['from'] . ' ' . $rule['to'] . ' ' . $rule['note'], $search );
					}
				)
			);
		}

		$notice = isset( $_GET['gk_notice'] ) ? sanitize_text_field( rawurldecode( wp_unslash( (string) $_GET['gk_notice'] ) ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
		$type   = isset( $_GET['gk_type'] ) ? sanitize_key( wp_unslash( (string) $_GET['gk_type'] ) ) : 'success'; // phpcs:ignore WordPress.Security.NonceVerification
		$type   = in_array( $type, array( 'success', 'error', 'warning' ), true ) ? $type : 'success';
		$labels = array(
			301 => __( '301 Permanent', 'grahakavach-headless-core' ),
			302 => __( '302 Temporary', 'grahakavach-headless-core' ),
			307 => __( '307 Temporary (keeps method)', 'grahakavach-headless-core' ),
			308 => __( '308 Permanent (keeps method)', 'grahakavach-headless-core' ),
			410 => __( '410 Gone (page removed)', 'grahakavach-headless-core' ),
		);
		$sel    = (int) ( $editing['code'] ?? 301 );
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Redirects', 'grahakavach-headless-core' ); ?></h1>
			<p class="description">
				<?php esc_html_e( 'Redirect an old URL to a new one on the public storefront. Changes go live within about a minute.', 'grahakavach-headless-core' ); ?>
			</p>

			<?php if ( '' !== $notice ) : ?>
				<div class="notice notice-<?php echo esc_attr( $type ); ?> is-dismissible"><p><?php echo esc_html( $notice ); ?></p></div>
			<?php endif; ?>

			<h2><?php echo $editing ? esc_html__( 'Edit redirect', 'grahakavach-headless-core' ) : esc_html__( 'Add redirect', 'grahakavach-headless-core' ); ?></h2>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="gk_redirect_save" />
				<input type="hidden" name="id" value="<?php echo esc_attr( (string) ( $editing['id'] ?? '' ) ); ?>" />
				<?php wp_nonce_field( 'gk_redirect_save' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="gk-from"><?php esc_html_e( 'Old URL (source)', 'grahakavach-headless-core' ); ?></label></th>
						<td>
							<input type="text" id="gk-from" name="from" class="regular-text" required placeholder="/old-page" value="<?php echo esc_attr( (string) ( $editing['from'] ?? '' ) ); ?>" />
							<p class="description"><?php esc_html_e( 'Path on the storefront, e.g. /old-page. A full URL is accepted; the domain and query string are ignored.', 'grahakavach-headless-core' ); ?></p>
							<label><input type="checkbox" name="wild" value="1" <?php checked( ! empty( $editing['wild'] ) ); ?> /> <?php esc_html_e( 'Also match everything below this path (e.g. /old-blog also matches /old-blog/post-1)', 'grahakavach-headless-core' ); ?></label>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="gk-to"><?php esc_html_e( 'New URL (destination)', 'grahakavach-headless-core' ); ?></label></th>
						<td>
							<input type="text" id="gk-to" name="to" class="regular-text" placeholder="/fire-safety-kit" value="<?php echo esc_attr( (string) ( $editing['to'] ?? '' ) ); ?>" />
							<p class="description"><?php esc_html_e( 'A path like /fire-safety-kit or a full https://grahakavach.in/... URL. Only grahakavach.in is allowed. Not needed for 410 Gone.', 'grahakavach-headless-core' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="gk-code"><?php esc_html_e( 'Type', 'grahakavach-headless-core' ); ?></label></th>
						<td>
							<select id="gk-code" name="code">
								<?php foreach ( $labels as $code => $label ) : ?>
									<option value="<?php echo esc_attr( (string) $code ); ?>" <?php selected( $sel, $code ); ?>><?php echo esc_html( $label ); ?></option>
								<?php endforeach; ?>
							</select>
							<p class="description"><?php esc_html_e( 'Use 301 for pages that moved for good. It passes ranking to the new URL.', 'grahakavach-headless-core' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="gk-note"><?php esc_html_e( 'Note', 'grahakavach-headless-core' ); ?></label></th>
						<td><input type="text" id="gk-note" name="note" class="regular-text" maxlength="200" value="<?php echo esc_attr( (string) ( $editing['note'] ?? '' ) ); ?>" /></td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Status', 'grahakavach-headless-core' ); ?></th>
						<td><label><input type="checkbox" name="enabled" value="1" <?php checked( ! $editing || ! empty( $editing['enabled'] ) ); ?> /> <?php esc_html_e( 'Enabled', 'grahakavach-headless-core' ); ?></label></td>
					</tr>
				</table>
				<?php submit_button( $editing ? __( 'Update redirect', 'grahakavach-headless-core' ) : __( 'Add redirect', 'grahakavach-headless-core' ), 'primary', 'submit', false ); ?>
				<?php if ( $editing ) : ?>
					<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=' . self::SLUG ) ); ?>"><?php esc_html_e( 'Cancel', 'grahakavach-headless-core' ); ?></a>
				<?php endif; ?>
			</form>

			<hr />
			<h2><?php esc_html_e( 'All redirects', 'grahakavach-headless-core' ); ?> (<?php echo esc_html( (string) count( self::all() ) ); ?>)</h2>

			<form method="get" style="margin-bottom:8px;">
				<input type="hidden" name="page" value="<?php echo esc_attr( self::SLUG ); ?>" />
				<input type="search" name="s" value="<?php echo esc_attr( $search ); ?>" placeholder="<?php esc_attr_e( 'Search redirects', 'grahakavach-headless-core' ); ?>" />
				<button class="button"><?php esc_html_e( 'Search', 'grahakavach-headless-core' ); ?></button>
				<a class="button" href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=gk_redirect_export' ), 'gk_redirect_export' ) ); ?>"><?php esc_html_e( 'Export CSV', 'grahakavach-headless-core' ); ?></a>
			</form>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="gk_redirect_bulk" />
				<?php wp_nonce_field( 'gk_redirect_bulk' ); ?>
				<select name="bulk_action">
					<option value=""><?php esc_html_e( 'Bulk actions', 'grahakavach-headless-core' ); ?></option>
					<option value="enable"><?php esc_html_e( 'Enable', 'grahakavach-headless-core' ); ?></option>
					<option value="disable"><?php esc_html_e( 'Disable', 'grahakavach-headless-core' ); ?></option>
					<option value="delete"><?php esc_html_e( 'Delete', 'grahakavach-headless-core' ); ?></option>
				</select>
				<button class="button"><?php esc_html_e( 'Apply', 'grahakavach-headless-core' ); ?></button>

				<table class="widefat striped" style="margin-top:8px;">
					<thead>
						<tr>
							<td class="check-column"><input type="checkbox" onclick="document.querySelectorAll('.gk-rule-cb').forEach(function(c){c.checked=this.checked}.bind(this))" /></td>
							<th><?php esc_html_e( 'Old URL', 'grahakavach-headless-core' ); ?></th>
							<th><?php esc_html_e( 'New URL', 'grahakavach-headless-core' ); ?></th>
							<th><?php esc_html_e( 'Type', 'grahakavach-headless-core' ); ?></th>
							<th><?php esc_html_e( 'Status', 'grahakavach-headless-core' ); ?></th>
							<th><?php esc_html_e( 'Note', 'grahakavach-headless-core' ); ?></th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<?php if ( empty( $rules ) ) : ?>
							<tr><td colspan="7"><?php esc_html_e( 'No redirects yet.', 'grahakavach-headless-core' ); ?></td></tr>
						<?php endif; ?>
						<?php foreach ( $rules as $rule ) : ?>
							<tr>
								<th class="check-column"><input type="checkbox" class="gk-rule-cb" name="ids[]" value="<?php echo esc_attr( $rule['id'] ); ?>" /></th>
								<td><code><?php echo esc_html( $rule['from'] . ( ! empty( $rule['wild'] ) ? '/*' : '' ) ); ?></code></td>
								<td><?php echo '' === $rule['to'] ? '&mdash;' : '<code>' . esc_html( $rule['to'] ) . '</code>'; ?></td>
								<td><?php echo esc_html( (string) $rule['code'] ); ?></td>
								<td><?php echo ! empty( $rule['enabled'] ) ? esc_html__( 'Enabled', 'grahakavach-headless-core' ) : '<em>' . esc_html__( 'Disabled', 'grahakavach-headless-core' ) . '</em>'; ?></td>
								<td><?php echo esc_html( (string) $rule['note'] ); ?></td>
								<td><a href="<?php echo esc_url( admin_url( 'admin.php?page=' . self::SLUG . '&edit=' . rawurlencode( $rule['id'] ) ) ); ?>"><?php esc_html_e( 'Edit', 'grahakavach-headless-core' ); ?></a></td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			</form>

			<hr />
			<h2><?php esc_html_e( 'Bulk import', 'grahakavach-headless-core' ); ?></h2>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="gk_redirect_import" />
				<?php wp_nonce_field( 'gk_redirect_import' ); ?>
				<p class="description"><?php esc_html_e( 'One rule per line: old-path,new-path,code,note. Code defaults to 301. Use code 410 with an empty new-path for removed pages.', 'grahakavach-headless-core' ); ?></p>
				<textarea name="csv" rows="6" class="large-text code" placeholder="/old-page,/fire-safety-kit,301,Product renamed"></textarea>
				<p><button class="button"><?php esc_html_e( 'Import', 'grahakavach-headless-core' ); ?></button></p>
			</form>
		</div>
		<?php
	}
}

<?php
/**
 * WooCommerce -> WhatsApp admin screen: settings, templates, message log, carts.
 *
 * @package GrahaKavach\WhatsApp
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GKWA_Admin {

	private const SLUG  = 'gk-whatsapp';
	private const GROUP = 'gkwa_settings_group';

	public static function init(): void {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register' ) );
		add_action( 'admin_post_gkwa_sync_templates', array( __CLASS__, 'action_sync' ) );
		add_action( 'admin_post_gkwa_subscribe', array( __CLASS__, 'action_subscribe' ) );
		add_action( 'admin_post_gkwa_test', array( __CLASS__, 'action_test' ) );
	}

	public static function menu(): void {
		add_submenu_page(
			'woocommerce',
			'WhatsApp Alerts',
			'WhatsApp Alerts',
			'manage_woocommerce',
			self::SLUG,
			array( __CLASS__, 'render' )
		);
	}

	public static function register(): void {
		register_setting(
			self::GROUP,
			GKWA_Config::OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize' ),
				'default'           => GKWA_Config::defaults(),
			)
		);
	}

	/**
	 * @param mixed $input Submitted settings.
	 * @return array<string,mixed>
	 */
	public static function sanitize( $input ): array {
		$old   = GKWA_Config::all();
		$input = is_array( $input ) ? $input : array();

		// A blank secret field means "keep the current value".
		$keep = static function ( string $key ) use ( $input, $old ): string {
			$new = trim( (string) ( $input[ $key ] ?? '' ) );

			return '' !== $new ? $new : (string) $old[ $key ];
		};

		$enabled_templates  = array_map( 'sanitize_key', (array) ( $input['enabled_templates'] ?? array() ) );
		$disabled_templates = array_values( array_diff( array_keys( GKWA_Templates::all() ), $enabled_templates ) );

		return array(
			'enabled'            => empty( $input['enabled'] ) ? 0 : 1,
			'phone_id'           => preg_replace( '/\D/', '', (string) ( $input['phone_id'] ?? '' ) ),
			'waba_id'            => preg_replace( '/\D/', '', (string) ( $input['waba_id'] ?? '' ) ),
			'access_token'       => $keep( 'access_token' ),
			'app_secret'         => $keep( 'app_secret' ),
			'verify_token'       => $keep( 'verify_token' ),
			'language'           => sanitize_text_field( (string) ( $input['language'] ?? 'en_US' ) ) ?: 'en_US',
			'country_code'       => preg_replace( '/\D/', '', (string) ( $input['country_code'] ?? '91' ) ) ?: '91',
			'admin_phone'        => preg_replace( '/\D/', '', (string) ( $input['admin_phone'] ?? '' ) ),
			'cart_delay_1'       => max( 15, (int) ( $input['cart_delay_1'] ?? 60 ) ),
			'cart_delay_2'       => max( 120, (int) ( $input['cart_delay_2'] ?? 1440 ) ),
			'processing_delay'   => max( 0, (int) ( $input['processing_delay'] ?? 5 ) ),
			'delivery_eta'       => sanitize_text_field( (string) ( $input['delivery_eta'] ?? '3-7 business days' ) ),
			'disabled_templates' => $disabled_templates,
		);
	}

	/* ------------------------------------------------------------ actions */

	private static function guard(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'Not allowed.' );
		}
		check_admin_referer( 'gkwa_action' );
	}

	private static function back( string $tab, string $message, bool $ok ): void {
		set_transient( 'gkwa_notice_' . get_current_user_id(), array( $ok, $message ), 60 );
		wp_safe_redirect( admin_url( 'admin.php?page=' . self::SLUG . '&tab=' . $tab ) );
		exit;
	}

	public static function action_sync(): void {
		self::guard();

		if ( '' === GKWA_Config::waba_id() || '' === GKWA_Config::access_token() ) {
			self::back( 'templates', 'Set the WhatsApp Business Account ID and the access token first.', false );
		}

		$existing = GKWA_Client::list_templates();
		if ( ! $existing['ok'] ) {
			self::back( 'templates', 'Could not read templates from Meta: ' . $existing['error'], false );
		}

		$have = array();
		foreach ( (array) ( $existing['data']['data'] ?? array() ) as $row ) {
			$have[ $row['name'] . '|' . $row['language'] ] = true;
		}

		$language = (string) GKWA_Config::get( 'language' );
		$created  = 0;
		$errors   = array();

		foreach ( GKWA_Templates::all() as $name => $tpl ) {
			if ( isset( $have[ $name . '|' . $language ] ) ) {
				continue;
			}
			$res = GKWA_Client::create_template( GKWA_Templates::create_payload( $tpl, $language ) );
			if ( $res['ok'] ) {
				++$created;
			} else {
				$errors[] = $name . ': ' . $res['error'];
			}
		}

		$message = sprintf( '%d template(s) submitted to Meta for approval.', $created );
		if ( $errors ) {
			$message .= ' Problems: ' . implode( ' | ', $errors );
		}
		self::back( 'templates', $message, empty( $errors ) );
	}

	public static function action_subscribe(): void {
		self::guard();

		$res = GKWA_Client::subscribe_app();
		self::back( 'settings', $res['ok'] ? 'App subscribed to your WhatsApp Business Account.' : 'Subscribe failed: ' . $res['error'], $res['ok'] );
	}

	public static function action_test(): void {
		self::guard();

		$phone = GKWA_Client::normalize_phone( sanitize_text_field( wp_unslash( $_POST['test_phone'] ?? '' ) ) ); // phpcs:ignore WordPress.Security.NonceVerification
		if ( '' === $phone ) {
			self::back( 'settings', 'Enter a valid 10-digit mobile number.', false );
		}
		if ( ! GKWA_Config::enabled() || ! GKWA_Config::credentials_ready() ) {
			self::back( 'settings', 'Turn on "Enable WhatsApp sending" and save the credentials first.', false );
		}

		GKWA_Sender::queue( 'gk_welcome', $phone, array( 'customer_name' => 'Test' ), array( 'delay' => 0 ) );
		self::back( 'logs', 'Test message queued. It is sent within a minute; check the status here.', true );
	}

	/* ------------------------------------------------------------- render */

	public static function render(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}

		$tab  = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'settings'; // phpcs:ignore WordPress.Security.NonceVerification
		$tabs = array(
			'settings'  => 'Settings',
			'templates' => 'Templates',
			'logs'      => 'Message log',
			'carts'     => 'Abandoned carts',
		);
		if ( ! isset( $tabs[ $tab ] ) ) {
			$tab = 'settings';
		}

		echo '<div class="wrap"><h1>WhatsApp Alerts</h1>';

		$notice = get_transient( 'gkwa_notice_' . get_current_user_id() );
		if ( $notice ) {
			delete_transient( 'gkwa_notice_' . get_current_user_id() );
			printf( '<div class="notice notice-%s"><p>%s</p></div>', $notice[0] ? 'success' : 'error', esc_html( (string) $notice[1] ) );
		}

		if ( defined( 'GKWA_DISABLED' ) && GKWA_DISABLED ) {
			echo '<div class="notice notice-warning"><p><strong>Kill switch active:</strong> GKWA_DISABLED is set in wp-config.php. No WhatsApp message will be sent.</p></div>';
		}

		echo '<nav class="nav-tab-wrapper">';
		foreach ( $tabs as $key => $label ) {
			printf(
				'<a href="%s" class="nav-tab %s">%s</a>',
				esc_url( admin_url( 'admin.php?page=' . self::SLUG . '&tab=' . $key ) ),
				$key === $tab ? 'nav-tab-active' : '',
				esc_html( $label )
			);
		}
		echo '</nav>';

		call_user_func( array( __CLASS__, 'tab_' . $tab ) );
		echo '</div>';
	}

	private static function secret_row( string $label, string $key, string $constant, string $help ): void {
		$name = GKWA_Config::OPTION . '[' . $key . ']';
		echo '<tr><th scope="row">' . esc_html( $label ) . '</th><td>';
		if ( GKWA_Config::secret_from_constant( $constant ) ) {
			echo '<span style="color:#1a7f37">Set in wp-config.php (' . esc_html( $constant ) . ')</span>';
		} else {
			$is_set = '' !== (string) GKWA_Config::get( $key );
			printf(
				'<input type="password" class="regular-text" autocomplete="new-password" name="%s" value="" placeholder="%s" />',
				esc_attr( $name ),
				esc_attr( $is_set ? 'Saved - leave blank to keep' : '' )
			);
			echo '<p class="description">Recommended: define <code>' . esc_html( $constant ) . '</code> in wp-config.php instead, so it never sits in the database.</p>';
		}
		echo '<p class="description">' . esc_html( $help ) . '</p></td></tr>';
	}

	private static function tab_settings(): void {
		$s    = GKWA_Config::all();
		$name = GKWA_Config::OPTION;
		?>
		<form method="post" action="options.php">
			<?php settings_fields( self::GROUP ); ?>
			<h2>Connection</h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">Enable WhatsApp sending</th>
					<td><label><input type="checkbox" name="<?php echo esc_attr( $name ); ?>[enabled]" value="1" <?php checked( ! empty( $s['enabled'] ) ); ?> /> Send messages (master switch)</label></td>
				</tr>
				<tr>
					<th scope="row"><label for="gkwa_phone_id">Phone number ID</label></th>
					<td><input id="gkwa_phone_id" class="regular-text" name="<?php echo esc_attr( $name ); ?>[phone_id]" value="<?php echo esc_attr( (string) $s['phone_id'] ); ?>" /><p class="description">From Meta -> WhatsApp -> API Setup (15-16 digits). Not the phone number itself.</p></td>
				</tr>
				<tr>
					<th scope="row"><label for="gkwa_waba_id">WhatsApp Business Account ID</label></th>
					<td><input id="gkwa_waba_id" class="regular-text" name="<?php echo esc_attr( $name ); ?>[waba_id]" value="<?php echo esc_attr( (string) $s['waba_id'] ); ?>" /></td>
				</tr>
				<?php
				self::secret_row( 'Access token', 'access_token', 'GKWA_ACCESS_TOKEN', 'System User token with whatsapp_business_messaging + whatsapp_business_management, expiry "Never".' );
				self::secret_row( 'App secret', 'app_secret', 'GKWA_APP_SECRET', 'Meta app -> Settings -> Basic. Used only to verify webhook signatures.' );
				self::secret_row( 'Webhook verify token', 'verify_token', 'GKWA_VERIFY_TOKEN', 'Any long random string; you type the same value into Meta when adding the webhook.' );
				?>
			</table>

			<h2>Behaviour</h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="gkwa_lang">Template language</label></th>
					<td><input id="gkwa_lang" class="small-text" name="<?php echo esc_attr( $name ); ?>[language]" value="<?php echo esc_attr( (string) $s['language'] ); ?>" /><p class="description">Must match the language the templates were approved in (default en_US).</p></td>
				</tr>
				<tr>
					<th scope="row"><label for="gkwa_cc">Default country code</label></th>
					<td><input id="gkwa_cc" class="small-text" name="<?php echo esc_attr( $name ); ?>[country_code]" value="<?php echo esc_attr( (string) $s['country_code'] ); ?>" /><p class="description">Added to 10-digit numbers. India = 91.</p></td>
				</tr>
				<tr>
					<th scope="row"><label for="gkwa_admin">Store owner WhatsApp number</label></th>
					<td><input id="gkwa_admin" class="regular-text" name="<?php echo esc_attr( $name ); ?>[admin_phone]" value="<?php echo esc_attr( (string) $s['admin_phone'] ); ?>" placeholder="9876543210" /><p class="description">Receives a "new order" alert. Leave blank to turn it off.</p></td>
				</tr>
				<tr>
					<th scope="row">Abandoned-cart timing</th>
					<td>
						Reminder 1 after <input type="number" min="15" class="small-text" name="<?php echo esc_attr( $name ); ?>[cart_delay_1]" value="<?php echo esc_attr( (string) $s['cart_delay_1'] ); ?>" /> minutes,
						reminder 2 after <input type="number" min="120" class="small-text" name="<?php echo esc_attr( $name ); ?>[cart_delay_2]" value="<?php echo esc_attr( (string) $s['cart_delay_2'] ); ?>" /> minutes
						<p class="description">Measured from the last cart activity. Defaults: 60 and 1440 (24 h).</p>
					</td>
				</tr>
				<tr>
					<th scope="row">"Order is being processed" delay</th>
					<td><input type="number" min="0" class="small-text" name="<?php echo esc_attr( $name ); ?>[processing_delay]" value="<?php echo esc_attr( (string) $s['processing_delay'] ); ?>" /> minutes after payment confirmation</td>
				</tr>
				<tr>
					<th scope="row"><label for="gkwa_eta">Delivery estimate text</label></th>
					<td><input id="gkwa_eta" class="regular-text" name="<?php echo esc_attr( $name ); ?>[delivery_eta]" value="<?php echo esc_attr( (string) $s['delivery_eta'] ); ?>" /><p class="description">Shown in the "shipped" message.</p></td>
				</tr>
				<tr>
					<th scope="row">Messages to send</th>
					<td>
						<?php foreach ( GKWA_Templates::all() as $tpl_name => $tpl ) : ?>
							<label style="display:block;margin-bottom:4px">
								<input type="checkbox" name="<?php echo esc_attr( $name ); ?>[enabled_templates][]" value="<?php echo esc_attr( $tpl_name ); ?>" <?php checked( GKWA_Config::template_enabled( $tpl_name ) ); ?> />
								<?php echo esc_html( $tpl['title'] ); ?> <code><?php echo esc_html( $tpl_name ); ?></code>
							</label>
						<?php endforeach; ?>
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>

		<hr />
		<h2>Webhook (delivery receipts and STOP replies)</h2>
		<p>In Meta -> WhatsApp -> Configuration, set the callback URL to <code><?php echo esc_html( GKWA_Webhook::url() ); ?></code>, paste your verify token, and subscribe to the <strong>messages</strong> field. Then attach the app to your account:</p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="gkwa_subscribe" />
			<?php wp_nonce_field( 'gkwa_action' ); ?>
			<?php submit_button( 'Subscribe app to WhatsApp account', 'secondary', 'submit', false ); ?>
		</form>

		<h2>Send a test message</h2>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="gkwa_test" />
			<?php wp_nonce_field( 'gkwa_action' ); ?>
			<input type="text" name="test_phone" class="regular-text" placeholder="10-digit mobile" />
			<?php submit_button( 'Send test (gk_welcome)', 'secondary', 'submit', false ); ?>
			<p class="description">Needs the gk_welcome template to be APPROVED.</p>
		</form>
		<?php
	}

	private static function tab_templates(): void {
		$remote = array();
		$error  = '';

		if ( '' !== GKWA_Config::waba_id() && '' !== GKWA_Config::access_token() ) {
			$res = GKWA_Client::list_templates();
			if ( $res['ok'] ) {
				foreach ( (array) ( $res['data']['data'] ?? array() ) as $row ) {
					$remote[ $row['name'] . '|' . $row['language'] ] = $row;
				}
			} else {
				$error = $res['error'];
			}
		}

		$language = (string) GKWA_Config::get( 'language' );
		?>
		<p>These are the templates this plugin sends. Submit them to Meta once; each needs to show <strong>APPROVED</strong> before it can be delivered.</p>
		<?php if ( $error ) : ?>
			<div class="notice notice-error inline"><p>Could not read status from Meta: <?php echo esc_html( $error ); ?></p></div>
		<?php endif; ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="gkwa_sync_templates" />
			<?php wp_nonce_field( 'gkwa_action' ); ?>
			<?php submit_button( 'Submit missing templates to Meta', 'primary', 'submit', false ); ?>
		</form>
		<table class="widefat striped" style="margin-top:12px">
			<thead><tr><th>Template</th><th>Category</th><th>Status on Meta</th><th>Message</th></tr></thead>
			<tbody>
			<?php foreach ( GKWA_Templates::all() as $name => $tpl ) : ?>
				<?php
				$row    = $remote[ $name . '|' . $language ] ?? null;
				$status = $row ? (string) $row['status'] : ( $error ? 'unknown' : 'NOT SUBMITTED' );
				$reason = $row && ! empty( $row['rejected_reason'] ) && 'NONE' !== $row['rejected_reason'] ? ' (' . $row['rejected_reason'] . ')' : '';
				?>
				<tr>
					<td><code><?php echo esc_html( $name ); ?></code></td>
					<td><?php echo esc_html( $tpl['category'] ); ?></td>
					<td><strong><?php echo esc_html( $status . $reason ); ?></strong></td>
					<td><?php echo esc_html( $tpl['body'] ); ?></td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
		<?php
	}

	private static function tab_logs(): void {
		$rows = GKWA_DB::log_recent( 100 );
		?>
		<p>Latest 100 messages. Status moves queued -> sent -> delivered -> read, or failed / skipped.</p>
		<table class="widefat striped">
			<thead><tr><th>Time (UTC)</th><th>To</th><th>Template</th><th>Order</th><th>Status</th><th>Tries</th><th>Detail</th></tr></thead>
			<tbody>
			<?php if ( ! $rows ) : ?>
				<tr><td colspan="7">No messages yet.</td></tr>
			<?php endif; ?>
			<?php foreach ( $rows as $row ) : ?>
				<tr>
					<td><?php echo esc_html( $row['created_at'] ); ?></td>
					<td>+<?php echo esc_html( $row['phone'] ); ?></td>
					<td><code><?php echo esc_html( $row['template'] ); ?></code></td>
					<td><?php echo $row['order_id'] ? esc_html( '#' . $row['order_id'] ) : '-'; ?></td>
					<td><strong><?php echo esc_html( $row['status'] ); ?></strong></td>
					<td><?php echo esc_html( (string) $row['attempts'] ); ?></td>
					<td><?php echo esc_html( (string) $row['error'] ); ?></td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
		<?php
	}

	private static function tab_carts(): void {
		global $wpdb;

		$table  = GKWA_DB::carts_table();
		$counts = $wpdb->get_results( "SELECT status, COUNT(*) AS n FROM {$table} GROUP BY status", OBJECT_K ); // phpcs:ignore WordPress.DB.PreparedSQL
		$rows   = $wpdb->get_results( "SELECT phone, name, summary, status, updated_at, clicked_at FROM {$table} ORDER BY id DESC LIMIT 50", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL
		?>
		<p>
			<?php
			foreach ( array( 'active', 'reminded1', 'reminded2', 'recovered', 'cleared', 'expired' ) as $status ) {
				printf( '<strong>%s:</strong> %d &nbsp; ', esc_html( $status ), isset( $counts[ $status ] ) ? (int) $counts[ $status ]->n : 0 );
			}
			?>
		</p>
		<table class="widefat striped">
			<thead><tr><th>Last activity (UTC)</th><th>Customer</th><th>Mobile</th><th>Cart</th><th>Status</th><th>Opened link</th></tr></thead>
			<tbody>
			<?php if ( ! $rows ) : ?>
				<tr><td colspan="6">No carts captured yet.</td></tr>
			<?php endif; ?>
			<?php foreach ( (array) $rows as $row ) : ?>
				<tr>
					<td><?php echo esc_html( $row['updated_at'] ); ?></td>
					<td><?php echo esc_html( $row['name'] ); ?></td>
					<td>+<?php echo esc_html( $row['phone'] ); ?></td>
					<td><?php echo esc_html( $row['summary'] ); ?></td>
					<td><strong><?php echo esc_html( $row['status'] ); ?></strong></td>
					<td><?php echo $row['clicked_at'] ? esc_html( $row['clicked_at'] ) : '-'; ?></td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
		<?php
	}
}

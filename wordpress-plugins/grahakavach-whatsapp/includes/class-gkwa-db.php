<?php
/**
 * Database tables: message log, abandoned carts, marketing opt-outs.
 *
 * @package GrahaKavach\WhatsApp
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GKWA_DB {

	private const DB_VERSION = '1';

	public static function log_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'gkwa_log';
	}

	public static function carts_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'gkwa_carts';
	}

	public static function optout_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'gkwa_optout';
	}

	public static function install(): void {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset = $wpdb->get_charset_collate();
		$log     = self::log_table();
		$carts   = self::carts_table();
		$optout  = self::optout_table();

		dbDelta(
			"CREATE TABLE {$log} (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				created_at DATETIME NOT NULL,
				updated_at DATETIME NOT NULL,
				phone VARCHAR(20) NOT NULL DEFAULT '',
				template VARCHAR(80) NOT NULL DEFAULT '',
				order_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
				user_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
				status VARCHAR(20) NOT NULL DEFAULT 'queued',
				wamid VARCHAR(255) NOT NULL DEFAULT '',
				error TEXT NULL,
				attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
				payload LONGTEXT NULL,
				PRIMARY KEY  (id),
				KEY wamid (wamid(100)),
				KEY phone_template (phone, template),
				KEY order_id (order_id),
				KEY created_at (created_at)
			) {$charset};"
		);

		dbDelta(
			"CREATE TABLE {$carts} (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				token CHAR(32) NOT NULL,
				phone VARCHAR(20) NOT NULL,
				name VARCHAR(100) NOT NULL DEFAULT '',
				email VARCHAR(100) NOT NULL DEFAULT '',
				items LONGTEXT NOT NULL,
				summary VARCHAR(255) NOT NULL DEFAULT '',
				status VARCHAR(20) NOT NULL DEFAULT 'active',
				created_at DATETIME NOT NULL,
				updated_at DATETIME NOT NULL,
				last_reminder_at DATETIME NULL,
				clicked_at DATETIME NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY token (token),
				KEY phone_status (phone, status),
				KEY status_updated (status, updated_at)
			) {$charset};"
		);

		dbDelta(
			"CREATE TABLE {$optout} (
				phone VARCHAR(20) NOT NULL,
				created_at DATETIME NOT NULL,
				PRIMARY KEY  (phone)
			) {$charset};"
		);

		update_option( 'gkwa_db_version', self::DB_VERSION );
	}

	public static function maybe_upgrade(): void {
		if ( get_option( 'gkwa_db_version' ) !== self::DB_VERSION ) {
			self::install();
		}
	}

	public static function now(): string {
		return gmdate( 'Y-m-d H:i:s' );
	}

	public static function ago( int $seconds ): string {
		return gmdate( 'Y-m-d H:i:s', time() - $seconds );
	}

	/* ---------------------------------------------------------------- log */

	/**
	 * @param array<string,mixed> $row Column => value.
	 */
	public static function log_insert( array $row ): int {
		global $wpdb;

		$now = self::now();
		$wpdb->insert(
			self::log_table(),
			array_merge(
				array(
					'created_at' => $now,
					'updated_at' => $now,
					'status'     => 'queued',
				),
				$row
			)
		);

		return (int) $wpdb->insert_id;
	}

	/**
	 * @param array<string,mixed> $row Column => value.
	 */
	public static function log_update( int $id, array $row ): void {
		global $wpdb;

		$wpdb->update( self::log_table(), array_merge( $row, array( 'updated_at' => self::now() ) ), array( 'id' => $id ) );
	}

	/**
	 * @return array<string,mixed>|null
	 */
	public static function log_get( int $id ): ?array {
		global $wpdb;

		$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::log_table() . ' WHERE id = %d', $id ), ARRAY_A );

		return $row ?: null;
	}

	public static function log_update_by_wamid( string $wamid, string $status, string $error = '' ): void {
		global $wpdb;

		$data = array(
			'status'     => $status,
			'updated_at' => self::now(),
		);
		if ( '' !== $error ) {
			$data['error'] = $error;
		}

		// Receipts can arrive out of order; never let "sent" overwrite "read".
		$rank = array(
			'sent'      => 1,
			'delivered' => 2,
			'read'      => 3,
		);
		if ( isset( $rank[ $status ] ) ) {
			$rows = $wpdb->get_col( $wpdb->prepare( 'SELECT status FROM ' . self::log_table() . ' WHERE wamid = %s', $wamid ) );
			foreach ( $rows as $current ) {
				if ( isset( $rank[ $current ] ) && $rank[ $current ] >= $rank[ $status ] ) {
					return;
				}
			}
		}

		$wpdb->update( self::log_table(), $data, array( 'wamid' => $wamid ) );
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function log_recent( int $limit = 100 ): array {
		global $wpdb;

		return (array) $wpdb->get_results(
			$wpdb->prepare( 'SELECT id, created_at, phone, template, order_id, status, error, attempts FROM ' . self::log_table() . ' ORDER BY id DESC LIMIT %d', $limit ),
			ARRAY_A
		);
	}

	public static function reminders_sent_to( string $phone, int $days ): int {
		global $wpdb;

		return (int) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT COUNT(*) FROM ' . self::log_table() . " WHERE phone = %s AND template LIKE 'gk\\_cart\\_reminder%%' AND status <> 'skipped' AND created_at > %s",
				$phone,
				self::ago( $days * DAY_IN_SECONDS )
			)
		);
	}

	/* ------------------------------------------------------------ opt-out */

	public static function is_opted_out( string $phone ): bool {
		global $wpdb;

		return (bool) $wpdb->get_var( $wpdb->prepare( 'SELECT 1 FROM ' . self::optout_table() . ' WHERE phone = %s', $phone ) );
	}

	public static function opt_out( string $phone ): void {
		global $wpdb;

		$wpdb->query( $wpdb->prepare( 'INSERT IGNORE INTO ' . self::optout_table() . ' (phone, created_at) VALUES (%s, %s)', $phone, self::now() ) );
	}

	public static function opt_in( string $phone ): void {
		global $wpdb;

		$wpdb->delete( self::optout_table(), array( 'phone' => $phone ) );
	}
}

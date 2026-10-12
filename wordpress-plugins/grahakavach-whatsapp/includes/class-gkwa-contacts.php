<?php
/**
 * Contacts endpoint: one row per WhatsApp number, for audience building.
 *
 *   GET https://<backend>/wp-json/gk-whatsapp/v1/contacts
 *       ?updated_after=2026-10-01T00:00:00Z   (optional, ISO 8601 or Y-m-d)
 *       &page=1&per_page=100                   (per_page max 200)
 *
 * Auth: `Authorization: Bearer <GKWA_CONTACTS_API_KEY>` (constant in wp-config.php),
 * or a logged-in user who can manage WooCommerce. With no key configured the
 * endpoint is closed to everyone but those users. Phone numbers are personal
 * data, so this is never public.
 *
 * @package GrahaKavach\WhatsApp
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GKWA_Contacts {

	private const REST_NS  = 'gk-whatsapp/v1';
	private const PER_PAGE = 100;
	private const MAX_PAGE = 200;

	public static function init(): void {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	public static function register_routes(): void {
		register_rest_route(
			self::REST_NS,
			'/contacts',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'list_contacts' ),
				'permission_callback' => array( __CLASS__, 'authorize' ),
				'args'                => array(
					'updated_after' => array( 'type' => 'string' ),
					'page'          => array(
						'type'    => 'integer',
						'default' => 1,
						'minimum' => 1,
					),
					'per_page'      => array(
						'type'    => 'integer',
						'default' => self::PER_PAGE,
						'minimum' => 1,
						'maximum' => self::MAX_PAGE,
					),
				),
			)
		);
	}

	/**
	 * @return bool|WP_Error
	 */
	public static function authorize( WP_REST_Request $request ) {
		$key = GKWA_Config::contacts_api_key();

		if ( '' !== $key ) {
			$header = (string) $request->get_header( 'authorization' );
			if ( 0 === stripos( $header, 'bearer ' ) && hash_equals( $key, trim( substr( $header, 7 ) ) ) ) {
				return true;
			}
		}

		if ( current_user_can( 'manage_woocommerce' ) ) {
			return true;
		}

		return new WP_Error( 'gkwa_forbidden', 'Not allowed.', array( 'status' => 401 ) );
	}

	public static function list_contacts( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;

		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$per_page = min( self::MAX_PAGE, max( 1, (int) ( $request->get_param( 'per_page' ) ?: self::PER_PAGE ) ) );
		$offset   = ( $page - 1 ) * $per_page;

		$since = '1970-01-01 00:00:00';
		$raw   = trim( (string) $request->get_param( 'updated_after' ) );
		if ( '' !== $raw ) {
			$ts = strtotime( $raw );
			if ( false === $ts ) {
				return new WP_REST_Response( array( 'error' => 'updated_after must be an ISO 8601 date.' ), 400 );
			}
			$since = gmdate( 'Y-m-d H:i:s', $ts );
		}

		$contacts = GKWA_DB::contacts_table();
		$log      = GKWA_DB::log_table();
		$carts    = GKWA_DB::carts_table();
		$optout   = GKWA_DB::optout_table();

		// Every number we know about, with the time anything about it last changed.
		$union = "SELECT phone, updated_at AS ts FROM {$contacts}
			UNION ALL SELECT phone, updated_at FROM {$log} WHERE phone <> ''
			UNION ALL SELECT phone, updated_at FROM {$carts} WHERE phone <> ''
			UNION ALL SELECT phone, created_at FROM {$optout}";

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$total = (int) $wpdb->get_var(
			$wpdb->prepare( "SELECT COUNT(*) FROM (SELECT phone FROM ({$union}) u GROUP BY phone HAVING MAX(ts) > %s) c", $since )
		);

		$phones = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT phone FROM ({$union}) u GROUP BY phone HAVING MAX(ts) > %s ORDER BY MAX(ts) ASC, phone ASC LIMIT %d OFFSET %d",
				$since,
				$per_page,
				$offset
			)
		);

		$rows = array();
		if ( ! empty( $phones ) ) {
			$rows = self::build_rows( array_map( 'strval', $phones ) );
		}
		// phpcs:enable

		return new WP_REST_Response(
			array(
				'total'    => $total,
				'page'     => $page,
				'per_page' => $per_page,
				'pages'    => (int) ceil( $total / $per_page ),
				'contacts' => $rows,
			),
			200
		);
	}

	/**
	 * @param string[] $phones Normalised numbers (91XXXXXXXXXX).
	 * @return array<int,array<string,mixed>>
	 */
	private static function build_rows( array $phones ): array {
		global $wpdb;

		$in = implode( ',', array_fill( 0, count( $phones ), '%s' ) );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
		$contact_rows = self::keyed(
			$wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . GKWA_DB::contacts_table() . " WHERE phone IN ({$in})", $phones ), ARRAY_A )
		);

		$log_rows = self::keyed(
			$wpdb->get_results(
				$wpdb->prepare(
					'SELECT phone, MIN(created_at) AS first_out, MAX(created_at) AS last_out, COUNT(*) AS sent FROM ' . GKWA_DB::log_table() . " WHERE phone IN ({$in}) GROUP BY phone",
					$phones
				),
				ARRAY_A
			)
		);

		$cart_rows = self::keyed(
			$wpdb->get_results(
				$wpdb->prepare(
					'SELECT phone, SUBSTRING_INDEX(GROUP_CONCAT(name ORDER BY updated_at DESC SEPARATOR "\n"), "\n", 1) AS name, '
					. "SUM(status = 'active') AS active_carts, MAX(clicked_at) AS clicked_at FROM " . GKWA_DB::carts_table() . " WHERE phone IN ({$in}) GROUP BY phone",
					$phones
				),
				ARRAY_A
			)
		);

		$optouts = self::keyed(
			$wpdb->get_results( $wpdb->prepare( 'SELECT phone, created_at FROM ' . GKWA_DB::optout_table() . " WHERE phone IN ({$in})", $phones ), ARRAY_A )
		);

		// Orders are linked to a number through the message log.
		$order_links = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT DISTINCT phone, order_id FROM ' . GKWA_DB::log_table() . " WHERE order_id > 0 AND phone IN ({$in})",
				$phones
			),
			ARRAY_A
		);
		// phpcs:enable

		$orders = array();
		if ( function_exists( 'wc_get_order' ) ) {
			$paid = function_exists( 'wc_get_is_paid_statuses' ) ? wc_get_is_paid_statuses() : array( 'processing', 'completed' );
			foreach ( (array) $order_links as $link ) {
				$order = wc_get_order( (int) $link['order_id'] );
				if ( ! $order || ! in_array( $order->get_status(), $paid, true ) ) {
					continue;
				}
				$phone = (string) $link['phone'];
				if ( ! isset( $orders[ $phone ] ) ) {
					$orders[ $phone ] = array(
						'count'  => 0,
						'amount' => 0.0,
						'name'   => '',
						'last'   => '',
					);
				}
				++$orders[ $phone ]['count'];
				$orders[ $phone ]['amount'] += (float) $order->get_total();
				$orders[ $phone ]['name']    = trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() ) ?: $orders[ $phone ]['name'];
				$created                     = $order->get_date_created();
				if ( $created ) {
					$orders[ $phone ]['last'] = max( $orders[ $phone ]['last'], gmdate( 'c', $created->getTimestamp() ) );
				}
			}
		}

		$out = array();
		foreach ( $phones as $phone ) {
			$c     = $contact_rows[ $phone ] ?? array();
			$l     = $log_rows[ $phone ] ?? array();
			$cart  = $cart_rows[ $phone ] ?? array();
			$ord   = $orders[ $phone ] ?? null;
			$opt   = $optouts[ $phone ] ?? null;
			$reply = ! empty( $c['last_inbound_at'] );

			if ( $ord ) {
				$status = 'ordered';
			} elseif ( $opt ) {
				$status = 'not_interested';
			} elseif ( $reply || ! empty( $cart['clicked_at'] ) || (int) ( $cart['active_carts'] ?? 0 ) > 0 ) {
				$status = 'interested';
			} else {
				$status = 'no_reply';
			}

			$first = array_filter( array( $c['first_inbound_at'] ?? '', $l['first_out'] ?? '' ) );
			$last  = array_filter( array( $c['last_inbound_at'] ?? '', $l['last_out'] ?? '' ) );

			$out[] = array(
				'phone'            => $phone,
				'name'             => (string) ( ( $c['name'] ?? '' ) ?: ( $ord['name'] ?? '' ) ?: ( $cart['name'] ?? '' ) ),
				'first_message_at' => $first ? self::iso( min( $first ) ) : null,
				'last_message_at'  => $last ? self::iso( max( $last ) ) : null,
				'first_reply_at'   => self::iso( $c['first_inbound_at'] ?? '' ),
				'last_reply_at'    => self::iso( $c['last_inbound_at'] ?? '' ),
				'messages_sent'    => (int) ( $l['sent'] ?? 0 ),
				'lead_status'      => $status,
				'orders'           => (int) ( $ord['count'] ?? 0 ),
				'order_amount'     => $ord ? round( $ord['amount'], 2 ) : 0,
				'currency'         => 'INR',
				'opted_out'        => (bool) $opt,
				'opted_out_at'     => $opt ? self::iso( $opt['created_at'] ) : null,
				'ad'               => array(
					'ad_id'     => ( $c['ad_id'] ?? '' ) ?: null,
					'ctwa_clid' => ( $c['ctwa_clid'] ?? '' ) ?: null,
					'headline'  => ( $c['ad_headline'] ?? '' ) ?: null,
					'source_url' => ( $c['ad_source_url'] ?? '' ) ?: null,
				),
			);
		}

		return $out;
	}

	/**
	 * @param array<int,array<string,mixed>>|null $rows Rows with a `phone` column.
	 * @return array<string,array<string,mixed>>
	 */
	private static function keyed( $rows ): array {
		$out = array();
		foreach ( (array) $rows as $row ) {
			$out[ (string) $row['phone'] ] = $row;
		}
		return $out;
	}

	/** Stored times are UTC `Y-m-d H:i:s`; the API speaks ISO 8601. */
	private static function iso( string $mysql ): ?string {
		if ( '' === $mysql ) {
			return null;
		}
		$ts = strtotime( $mysql . ' UTC' );
		return false === $ts ? null : gmdate( 'c', $ts );
	}
}

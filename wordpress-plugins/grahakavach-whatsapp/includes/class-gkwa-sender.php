<?php
/**
 * Queue + send pipeline.
 *
 * Nothing sends inside a request. queue() writes a log row and schedules a
 * background job; process_job() does the HTTP call. That is what guarantees a
 * Meta outage, a bad token or a timeout can never slow down or break checkout,
 * and it gives every message a retry history in the log.
 *
 * @package GrahaKavach\WhatsApp
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GKWA_Sender {

	public const JOB_HOOK     = 'gkwa_send_job';
	private const MAX_ATTEMPTS = 4;

	public static function init(): void {
		add_action( self::JOB_HOOK, array( __CLASS__, 'process_job' ), 10, 1 );
	}

	/**
	 * Queue one message.
	 *
	 * ctx keys: order_id, user_id, button (dynamic URL value), delay (seconds).
	 *
	 * @param string               $template Template name from templates.json.
	 * @param mixed                $phone    Raw phone number.
	 * @param array<string,string> $values   Param key => value.
	 * @param array<string,mixed>  $ctx      Context.
	 * @return int Log row id, 0 when nothing was queued.
	 */
	public static function queue( string $template, $phone, array $values, array $ctx = array() ): int {
		if ( ! GKWA_Config::enabled() || ! GKWA_Config::credentials_ready() ) {
			return 0;
		}
		if ( ! GKWA_Config::template_enabled( $template ) ) {
			return 0;
		}

		$tpl = GKWA_Templates::get( $template );
		if ( ! $tpl ) {
			return 0;
		}

		$to       = GKWA_Client::normalize_phone( $phone );
		$order_id = (int) ( $ctx['order_id'] ?? 0 );
		$user_id  = (int) ( $ctx['user_id'] ?? 0 );

		if ( '' === $to ) {
			return GKWA_DB::log_insert(
				array(
					'phone'    => substr( preg_replace( '/\D/', '', (string) $phone ), 0, 20 ),
					'template' => $template,
					'order_id' => $order_id,
					'user_id'  => $user_id,
					'status'   => 'skipped',
					'error'    => 'No valid mobile number on file.',
				)
			);
		}

		if ( GKWA_Templates::is_marketing( $template ) && GKWA_DB::is_opted_out( $to ) ) {
			return GKWA_DB::log_insert(
				array(
					'phone'    => $to,
					'template' => $template,
					'order_id' => $order_id,
					'user_id'  => $user_id,
					'status'   => 'skipped',
					'error'    => 'Customer opted out of marketing messages.',
				)
			);
		}

		$log_id = GKWA_DB::log_insert(
			array(
				'phone'    => $to,
				'template' => $template,
				'order_id' => $order_id,
				'user_id'  => $user_id,
				'status'   => 'queued',
				'payload'  => wp_json_encode(
					array(
						'values' => $values,
						'button' => (string) ( $ctx['button'] ?? '' ),
					)
				),
			)
		);

		self::schedule( $log_id, max( 0, (int) ( $ctx['delay'] ?? 0 ) ) );

		return $log_id;
	}

	private static function schedule( int $log_id, int $delay ): void {
		$when = time() + max( 5, $delay );

		if ( function_exists( 'as_schedule_single_action' ) ) {
			as_schedule_single_action( $when, self::JOB_HOOK, array( $log_id ), 'gkwa' );
		} else {
			wp_schedule_single_event( $when, self::JOB_HOOK, array( $log_id ) );
		}
	}

	/**
	 * Background job: perform the send and record the outcome.
	 */
	public static function process_job( $log_id ): void {
		$log_id = (int) $log_id;
		$row    = GKWA_DB::log_get( $log_id );

		if ( ! $row || ! in_array( $row['status'], array( 'queued', 'retry' ), true ) ) {
			return;
		}

		// Re-checked at send time so the kill switch stops messages already queued.
		if ( ! GKWA_Config::enabled() || ! GKWA_Config::credentials_ready() || ! GKWA_Config::template_enabled( (string) $row['template'] ) ) {
			GKWA_DB::log_update(
				$log_id,
				array(
					'status' => 'skipped',
					'error'  => 'Sending was disabled before this message went out.',
				)
			);
			return;
		}

		$tpl     = GKWA_Templates::get( (string) $row['template'] );
		$payload = json_decode( (string) $row['payload'], true );
		if ( ! $tpl || ! is_array( $payload ) ) {
			GKWA_DB::log_update(
				$log_id,
				array(
					'status' => 'failed',
					'error'  => 'Unknown template or corrupt payload.',
				)
			);
			return;
		}

		$components = GKWA_Templates::send_components( $tpl, (array) ( $payload['values'] ?? array() ), (string) ( $payload['button'] ?? '' ) );
		$result     = GKWA_Client::send_template( (string) $row['phone'], (string) $row['template'], (string) GKWA_Config::get( 'language' ), $components );
		$attempts   = (int) $row['attempts'] + 1;

		if ( $result['ok'] ) {
			$wamid = (string) ( $result['data']['messages'][0]['id'] ?? '' );
			GKWA_DB::log_update(
				$log_id,
				array(
					'status'   => 'sent',
					'wamid'    => $wamid,
					'attempts' => $attempts,
					'error'    => null,
				)
			);
			self::order_note( (int) $row['order_id'], sprintf( 'WhatsApp "%s" sent to +%s.', $row['template'], $row['phone'] ) );
			return;
		}

		if ( $result['retryable'] && $attempts < self::MAX_ATTEMPTS ) {
			GKWA_DB::log_update(
				$log_id,
				array(
					'status'   => 'retry',
					'attempts' => $attempts,
					'error'    => $result['error'],
				)
			);
			// 2, 10, 30 minutes.
			$backoff = array( 1 => 120, 2 => 600, 3 => 1800 );
			self::schedule( $log_id, $backoff[ $attempts ] ?? 1800 );
			return;
		}

		GKWA_DB::log_update(
			$log_id,
			array(
				'status'   => 'failed',
				'attempts' => $attempts,
				'error'    => $result['error'],
			)
		);
		self::order_note( (int) $row['order_id'], sprintf( 'WhatsApp "%s" to +%s failed: %s', $row['template'], $row['phone'], $result['error'] ) );
	}

	private static function order_note( int $order_id, string $note ): void {
		if ( $order_id <= 0 || ! function_exists( 'wc_get_order' ) ) {
			return;
		}

		$order = wc_get_order( $order_id );
		if ( $order ) {
			$order->add_order_note( $note );
		}
	}
}

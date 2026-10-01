<?php
/**
 * Meta webhook: delivery receipts and customer replies.
 *
 * Callback URL to enter in Meta (WhatsApp -> Configuration):
 *   https://<backend>/wp-json/gk-whatsapp/v1/webhook
 * Subscribed field: messages.
 *
 * @package GrahaKavach\WhatsApp
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GKWA_Webhook {

	private const REST_NS = 'gk-whatsapp/v1';

	private const STOP_WORDS  = array( 'stop', 'unsubscribe', 'optout', 'opt out', 'stop promotions', 'stop messages' );
	private const START_WORDS = array( 'start', 'subscribe', 'optin', 'opt in', 'resume' );

	public static function init(): void {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	public static function url(): string {
		return rest_url( self::REST_NS . '/webhook' );
	}

	public static function register_routes(): void {
		register_rest_route(
			self::REST_NS,
			'/webhook',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'handshake' ),
					'permission_callback' => '__return_true',
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'receive' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Runbook B21: echo hub.challenge as the bare body when the token matches.
	 */
	public static function handshake( WP_REST_Request $request ) {
		$expected = GKWA_Config::verify_token();
		$token    = (string) $request->get_param( 'hub_verify_token' );
		$mode     = (string) $request->get_param( 'hub_mode' );

		if ( '' === $expected || 'subscribe' !== $mode || ! hash_equals( $expected, $token ) ) {
			return new WP_REST_Response( 'Forbidden', 403 );
		}

		// A REST response would JSON-encode the challenge; Meta needs it raw.
		$challenge = preg_replace( '/[^A-Za-z0-9_-]/', '', (string) $request->get_param( 'hub_challenge' ) );
		status_header( 200 );
		header( 'Content-Type: text/plain; charset=utf-8' );
		echo $challenge; // phpcs:ignore WordPress.Security.EscapeOutput
		exit;
	}

	/**
	 * Runbook B22: verify X-Hub-Signature-256 over the raw body, then answer 200 quickly.
	 */
	public static function receive( WP_REST_Request $request ): WP_REST_Response {
		$secret = GKWA_Config::app_secret();
		$raw    = $request->get_body();
		$header = (string) $request->get_header( 'x-hub-signature-256' );

		if ( '' === $secret ) {
			return new WP_REST_Response( array( 'error' => 'App secret is not configured.' ), 503 );
		}
		if ( 0 !== strpos( $header, 'sha256=' ) || ! hash_equals( hash_hmac( 'sha256', $raw, $secret ), substr( $header, 7 ) ) ) {
			return new WP_REST_Response( array( 'error' => 'Invalid signature.' ), 401 );
		}

		$payload = json_decode( $raw, true );
		if ( is_array( $payload ) ) {
			foreach ( (array) ( $payload['entry'] ?? array() ) as $entry ) {
				foreach ( (array) ( $entry['changes'] ?? array() ) as $change ) {
					$value = (array) ( $change['value'] ?? array() );
					foreach ( (array) ( $value['statuses'] ?? array() ) as $status ) {
						self::handle_status( (array) $status );
					}
					foreach ( (array) ( $value['messages'] ?? array() ) as $message ) {
						self::handle_message( (array) $message );
					}
				}
			}
		}

		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}

	/**
	 * @param array<string,mixed> $status Status entry.
	 */
	private static function handle_status( array $status ): void {
		$wamid = (string) ( $status['id'] ?? '' );
		$state = (string) ( $status['status'] ?? '' );
		if ( '' === $wamid || ! in_array( $state, array( 'sent', 'delivered', 'read', 'failed' ), true ) ) {
			return;
		}

		$error = '';
		if ( 'failed' === $state && ! empty( $status['errors'][0] ) ) {
			$e     = $status['errors'][0];
			$error = sprintf( '(#%s) %s', $e['code'] ?? '?', $e['title'] ?? $e['message'] ?? 'Delivery failed' );
		}

		GKWA_DB::log_update_by_wamid( $wamid, $state, $error );
	}

	/**
	 * @param array<string,mixed> $message Inbound message.
	 */
	private static function handle_message( array $message ): void {
		$from = preg_replace( '/\D/', '', (string) ( $message['from'] ?? '' ) );
		if ( '' === $from ) {
			return;
		}

		$text = '';
		if ( 'text' === ( $message['type'] ?? '' ) ) {
			$text = (string) ( $message['text']['body'] ?? '' );
		} elseif ( 'button' === ( $message['type'] ?? '' ) ) {
			$text = (string) ( $message['button']['text'] ?? '' );
		}
		$text = strtolower( trim( preg_replace( '/[^\p{L}\p{N} ]/u', '', $text ) ) );

		if ( in_array( $text, self::STOP_WORDS, true ) && ! GKWA_DB::is_opted_out( $from ) ) {
			GKWA_DB::opt_out( $from );
			GKWA_Client::send_text( $from, 'You will no longer receive promotional messages from Graha Kavach. You will still get important updates about your orders. Reply START anytime to resubscribe.' );
		} elseif ( in_array( $text, self::START_WORDS, true ) && GKWA_DB::is_opted_out( $from ) ) {
			GKWA_DB::opt_in( $from );
			GKWA_Client::send_text( $from, 'Thank you! You are subscribed to Graha Kavach updates again.' );
		}
	}
}

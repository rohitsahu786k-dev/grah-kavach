<?php
/**
 * Thin WhatsApp Cloud API client (Graph API v22.0).
 *
 * @package GrahaKavach\WhatsApp
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GKWA_Client {

	private const GRAPH = 'https://graph.facebook.com/v22.0';

	/**
	 * Meta error codes worth retrying: rate limit, throughput, temporary faults.
	 */
	private const RETRYABLE_CODES = array( 1, 2, 4, 17, 80007, 130429, 131000, 131016, 131056 );

	/**
	 * Normalise an Indian (or international) number to E.164 digits, no plus.
	 *
	 * @param mixed $raw Phone as typed or stored.
	 * @return string Empty string when it cannot be a valid mobile number.
	 */
	public static function normalize_phone( $raw ): string {
		$digits = preg_replace( '/\D/', '', (string) $raw );
		if ( '' === $digits ) {
			return '';
		}

		$country = preg_replace( '/\D/', '', (string) GKWA_Config::get( 'country_code' ) );
		if ( '' === $country ) {
			$country = '91';
		}

		// 00 international prefix.
		if ( 0 === strpos( $digits, '00' ) ) {
			$digits = substr( $digits, 2 );
		}
		// Trunk zero on a national number: 09876543210.
		if ( 11 === strlen( $digits ) && '0' === $digits[0] ) {
			$digits = substr( $digits, 1 );
		}
		// Bare national number.
		if ( 10 === strlen( $digits ) ) {
			$digits = $country . $digits;
		}

		// India: validate the 10-digit mobile that follows 91.
		if ( '91' === $country && 0 === strpos( $digits, '91' ) && 12 === strlen( $digits ) ) {
			return preg_match( '/^91[6-9]\d{9}$/', $digits ) ? $digits : '';
		}

		return ( strlen( $digits ) >= 11 && strlen( $digits ) <= 15 ) ? $digits : '';
	}

	/**
	 * @param string              $method HTTP method.
	 * @param string              $path   Path after the version, starting with /.
	 * @param array<string,mixed> $body   JSON body (POST) or query (GET).
	 * @return array{ok:bool,code:int,data:array<string,mixed>,error:string,error_code:int,retryable:bool}
	 */
	public static function request( string $method, string $path, array $body = array() ): array {
		$token = GKWA_Config::access_token();
		$url   = self::GRAPH . $path;
		$args  = array(
			'method'  => $method,
			'timeout' => 20,
			'headers' => array(
				'Authorization' => 'Bearer ' . $token,
				'Content-Type'  => 'application/json',
			),
		);

		if ( 'GET' === $method ) {
			$url = add_query_arg( $body, $url );
		} elseif ( ! empty( $body ) ) {
			$args['body'] = wp_json_encode( $body );
		}

		$res = wp_remote_request( $url, $args );

		if ( is_wp_error( $res ) ) {
			return array(
				'ok'         => false,
				'code'       => 0,
				'data'       => array(),
				'error'      => $res->get_error_message(),
				'error_code' => 0,
				'retryable'  => true,
			);
		}

		$code = (int) wp_remote_retrieve_response_code( $res );
		$data = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		$data = is_array( $data ) ? $data : array();

		if ( $code >= 200 && $code < 300 && empty( $data['error'] ) ) {
			return array(
				'ok'         => true,
				'code'       => $code,
				'data'       => $data,
				'error'      => '',
				'error_code' => 0,
				'retryable'  => false,
			);
		}

		$err        = $data['error'] ?? array();
		$error_code = (int) ( $err['code'] ?? 0 );
		$message    = (string) ( $err['error_data']['details'] ?? $err['message'] ?? ( 'HTTP ' . $code ) );

		return array(
			'ok'         => false,
			'code'       => $code,
			'data'       => $data,
			'error'      => sprintf( '(#%d) %s', $error_code, $message ),
			'error_code' => $error_code,
			'retryable'  => $code >= 500 || 429 === $code || in_array( $error_code, self::RETRYABLE_CODES, true ),
		);
	}

	/**
	 * @param array<int,array<string,mixed>> $components Send components.
	 * @return array{ok:bool,code:int,data:array<string,mixed>,error:string,error_code:int,retryable:bool}
	 */
	public static function send_template( string $to, string $name, string $language, array $components ): array {
		$template = array(
			'name'     => $name,
			'language' => array( 'code' => $language ),
		);
		if ( ! empty( $components ) ) {
			$template['components'] = $components;
		}

		return self::request(
			'POST',
			'/' . GKWA_Config::phone_id() . '/messages',
			array(
				'messaging_product' => 'whatsapp',
				'recipient_type'    => 'individual',
				'to'                => $to,
				'type'              => 'template',
				'template'          => $template,
			)
		);
	}

	/**
	 * Free text. Only deliverable inside the 24-hour customer-service window,
	 * so it is used solely to answer a customer who just messaged us.
	 *
	 * @return array{ok:bool,code:int,data:array<string,mixed>,error:string,error_code:int,retryable:bool}
	 */
	public static function send_text( string $to, string $text ): array {
		return self::request(
			'POST',
			'/' . GKWA_Config::phone_id() . '/messages',
			array(
				'messaging_product' => 'whatsapp',
				'to'                => $to,
				'type'              => 'text',
				'text'              => array(
					'preview_url' => false,
					'body'        => $text,
				),
			)
		);
	}

	/**
	 * @return array{ok:bool,code:int,data:array<string,mixed>,error:string,error_code:int,retryable:bool}
	 */
	public static function list_templates(): array {
		return self::request(
			'GET',
			'/' . GKWA_Config::waba_id() . '/message_templates',
			array(
				'limit'  => 200,
				'fields' => 'name,status,category,language,rejected_reason',
			)
		);
	}

	/**
	 * @param array<string,mixed> $payload Create-template body.
	 * @return array{ok:bool,code:int,data:array<string,mixed>,error:string,error_code:int,retryable:bool}
	 */
	public static function create_template( array $payload ): array {
		return self::request( 'POST', '/' . GKWA_Config::waba_id() . '/message_templates', $payload );
	}

	/**
	 * @return array{ok:bool,code:int,data:array<string,mixed>,error:string,error_code:int,retryable:bool}
	 */
	public static function subscribe_app(): array {
		return self::request( 'POST', '/' . GKWA_Config::waba_id() . '/subscribed_apps' );
	}
}

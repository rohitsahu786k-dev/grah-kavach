<?php
/**
 * Template catalogue (templates.json) and the payload builders.
 *
 * templates.json is the single source of truth: this class sends from it, the
 * admin screen submits it to Meta, and the Meta approval document is generated
 * from it, so the three can never drift apart.
 *
 * @package GrahaKavach\WhatsApp
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GKWA_Templates {

	/** @var array<string,array<string,mixed>>|null */
	private static $cache = null;

	/**
	 * @return array<string,array<string,mixed>> Keyed by template name.
	 */
	public static function all(): array {
		if ( null !== self::$cache ) {
			return self::$cache;
		}

		self::$cache = array();
		$raw         = file_get_contents( GKWA_DIR . 'templates.json' ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		$json        = is_string( $raw ) ? json_decode( $raw, true ) : null;

		if ( is_array( $json ) && ! empty( $json['templates'] ) ) {
			foreach ( $json['templates'] as $tpl ) {
				self::$cache[ $tpl['name'] ] = $tpl;
			}
		}

		return self::$cache;
	}

	/**
	 * @return array<string,mixed>|null
	 */
	public static function get( string $name ): ?array {
		return self::all()[ $name ] ?? null;
	}

	public static function is_marketing( string $name ): bool {
		$tpl = self::get( $name );

		return $tpl && 'MARKETING' === $tpl['category'];
	}

	/**
	 * A text parameter may not contain newlines, tabs or 4+ consecutive spaces
	 * (Meta error 132012), and is capped so the hydrated body stays in limits.
	 */
	public static function clean_value( $value ): string {
		$value = wp_strip_all_tags( (string) $value );
		$value = preg_replace( '/[\r\n\t]+/', ' ', $value );
		$value = preg_replace( '/ {2,}/', ' ', (string) $value );
		$value = trim( (string) $value );

		if ( '' === $value ) {
			$value = '-';
		}

		return mb_substr( $value, 0, 200 );
	}

	/**
	 * Components array for a send, with body values in the template's order.
	 *
	 * @param array<string,mixed>  $tpl    Template definition.
	 * @param array<string,string> $values Param key => value.
	 * @param string               $button Value for the dynamic URL button, if any.
	 * @return array<int,array<string,mixed>>
	 */
	public static function send_components( array $tpl, array $values, string $button = '' ): array {
		$components = array();

		if ( ! empty( $tpl['params'] ) ) {
			$params = array();
			foreach ( $tpl['params'] as $param ) {
				$params[] = array(
					'type' => 'text',
					'text' => self::clean_value( $values[ $param['key'] ] ?? '' ),
				);
			}
			$components[] = array(
				'type'       => 'body',
				'parameters' => $params,
			);
		}

		foreach ( (array) ( $tpl['buttons'] ?? array() ) as $index => $btn ) {
			if ( ! empty( $btn['dynamic'] ) ) {
				$components[] = array(
					'type'       => 'button',
					'sub_type'   => 'url',
					'index'      => (string) $index,
					'parameters' => array(
						array(
							'type' => 'text',
							'text' => '' !== $button ? $button : 'x',
						),
					),
				);
			}
		}

		return $components;
	}

	/**
	 * Body of POST /{waba}/message_templates (runbook B4 / B5).
	 *
	 * @param array<string,mixed> $tpl      Template definition.
	 * @param string              $language Language code.
	 * @return array<string,mixed>
	 */
	public static function create_payload( array $tpl, string $language ): array {
		$components = array();

		$body = array(
			'type' => 'BODY',
			'text' => $tpl['body'],
		);
		if ( ! empty( $tpl['params'] ) ) {
			$body['example'] = array(
				'body_text' => array( array_map( static fn( $p ) => $p['sample'], $tpl['params'] ) ),
			);
		}
		$components[] = $body;

		if ( ! empty( $tpl['footer'] ) ) {
			$components[] = array(
				'type' => 'FOOTER',
				'text' => $tpl['footer'],
			);
		}

		if ( ! empty( $tpl['buttons'] ) ) {
			$buttons = array();
			foreach ( $tpl['buttons'] as $btn ) {
				$item = array(
					'type' => 'URL',
					'text' => $btn['text'],
					'url'  => $btn['url'],
				);
				if ( ! empty( $btn['dynamic'] ) ) {
					$item['example'] = array( $btn['sample'] );
				}
				$buttons[] = $item;
			}
			$components[] = array(
				'type'    => 'BUTTONS',
				'buttons' => $buttons,
			);
		}

		return array(
			'name'       => $tpl['name'],
			'category'   => $tpl['category'],
			'language'   => $language,
			'components' => $components,
		);
	}
}

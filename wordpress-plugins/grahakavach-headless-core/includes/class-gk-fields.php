<?php
/**
 * ACF field group registration, generated from the manifest.
 *
 * Field groups are registered in PHP rather than clicked together in wp-admin.
 * That keeps the whole content model in version control, makes it reviewable in
 * a diff, and means a fresh environment gets the identical model on activation
 * with nothing to import.
 *
 * Groups are registered with `show_in_graphql => false` on purpose. The GraphQL
 * surface is hand-built in class-gk-content-graphql.php so that structured
 * lists are exposed as typed arrays rather than raw pipe-delimited strings, and
 * so nothing is exposed by accident. One deliberate API, not two overlapping
 * ones.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds ACF field groups from GK_Model declarations.
 */
final class GK_Fields {

	public static function init(): void {
		add_action( 'acf/init', array( __CLASS__, 'register' ) );
	}

	/**
	 * Translate one manifest entry into an ACF field definition.
	 *
	 * @param array  $field  Manifest entry.
	 * @param string $prefix Key prefix, unique per group.
	 * @return array<string,mixed>
	 */
	private static function to_acf( array $field, string $prefix ): array {
		$base = array(
			'key'          => 'field_' . $prefix . '_' . $field['name'],
			'label'        => $field['label'],
			'name'         => $field['name'],
			'instructions' => $field['hint'] ?? '',
			// The hand-built GraphQL layer owns exposure; see the class docblock.
			'show_in_graphql' => 0,
		);

		switch ( $field['type'] ) {

			case 'structured':
				return array_merge(
					$base,
					array(
						'type'         => 'textarea',
						'rows'         => 6,
						'new_lines'    => '',
						'instructions' => trim(
							( $field['hint'] ?? '' ) . ' ' . GK_Structured::instructions( $field['shape'] )
						),
					)
				);

			case 'relationship':
				return array_merge(
					$base,
					array(
						'type'          => 'relationship',
						'post_type'     => array( $field['post_type'] ),
						'filters'       => array( 'search' ),
						'return_format' => 'id',
					)
				);

			case 'gallery_rel':
				// ACF free has no Gallery field. A relationship limited to
				// attachments gives the same multi-select-and-order behaviour
				// without requiring ACF Pro.
				return array_merge(
					$base,
					array(
						'type'          => 'relationship',
						'post_type'     => array( 'attachment' ),
						'filters'       => array( 'search' ),
						'return_format' => 'id',
					)
				);

			case 'image':
				return array_merge( $base, array( 'type' => 'image', 'return_format' => 'id', 'preview_size' => 'medium' ) );

			case 'file':
				return array_merge( $base, array( 'type' => 'file', 'return_format' => 'id' ) );

			case 'wysiwyg':
				return array_merge( $base, array( 'type' => 'wysiwyg', 'media_upload' => 1, 'tabs' => 'all' ) );

			case 'textarea':
				return array_merge( $base, array( 'type' => 'textarea', 'rows' => 4 ) );

			case 'true_false':
				return array_merge( $base, array( 'type' => 'true_false', 'ui' => 1 ) );

			case 'number':
				return array_merge( $base, array( 'type' => 'number' ) );

			case 'email':
			case 'url':
			case 'text':
			default:
				return array_merge( $base, array( 'type' => $field['type'] ) );
		}
	}

	/**
	 * Expand a manifest into ACF fields, inserting a tab field whenever the
	 * declared tab changes. Tabs are an ACF free layout field and keep a long
	 * edit screen navigable without needing ACF Pro's Group field.
	 *
	 * @param array  $manifest Manifest entries.
	 * @param string $prefix   Key prefix.
	 * @return array<int,array<string,mixed>>
	 */
	private static function build( array $manifest, string $prefix ): array {
		$fields  = array();
		$current = null;

		foreach ( $manifest as $entry ) {
			$tab = $entry['tab'] ?? null;

			if ( null !== $tab && $tab !== $current ) {
				$fields[] = array(
					'key'       => 'field_' . $prefix . '_tab_' . sanitize_key( $tab ),
					'label'     => $tab,
					'name'      => '',
					'type'      => 'tab',
					'placement' => 'left',
				);
				$current = $tab;
			}

			$fields[] = self::to_acf( $entry, $prefix );
		}

		return $fields;
	}

	/**
	 * Register one field group.
	 *
	 * @param string $key      Group key suffix.
	 * @param string $title    Group title.
	 * @param array  $manifest Manifest entries.
	 * @param array  $location ACF location rules.
	 */
	private static function group( string $key, string $title, array $manifest, array $location ): void {
		acf_add_local_field_group(
			array(
				'key'                   => 'group_gk_' . $key,
				'title'                 => $title,
				'fields'                => self::build( $manifest, $key ),
				'location'              => $location,
				'menu_order'            => 0,
				'position'              => 'normal',
				'style'                 => 'default',
				'label_placement'       => 'top',
				'active'                => true,
				'show_in_graphql'       => 0,
				'hide_on_screen'        => array(),
			)
		);
	}

	/**
	 * Location rule helper: a specific post type.
	 *
	 * @param string $post_type Post type name.
	 * @return array<int,array<int,array<string,string>>>
	 */
	private static function where_post_type( string $post_type ): array {
		return array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => $post_type ) ) );
	}

	/**
	 * Location rule helper: one specific page.
	 *
	 * @param int $page_id Page ID.
	 * @return array<int,array<int,array<string,string>>>
	 */
	private static function where_page( int $page_id ): array {
		return array( array( array( 'param' => 'page', 'operator' => '==', 'value' => (string) $page_id ) ) );
	}

	public static function register(): void {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}

		// Global settings — attached to the singleton settings post.
		self::group(
			'settings',
			__( 'Global Site Settings', 'grahakavach-headless-core' ),
			GK_Model::settings(),
			self::where_post_type( GK_CPT::SETTINGS )
		);

		// Homepage and About — attached to their specific pages, creating the
		// pages if they do not exist yet.
		$home_id = GK_CPT::page_id_by_slug( 'home', 'Home' );
		if ( $home_id ) {
			self::group( 'homepage', __( 'Homepage Content', 'grahakavach-headless-core' ), GK_Model::homepage(), self::where_page( $home_id ) );
		}

		$about_id = GK_CPT::page_id_by_slug( 'about-us', 'About Us' );
		if ( $about_id ) {
			self::group( 'about', __( 'About Page Content', 'grahakavach-headless-core' ), GK_Model::about(), self::where_page( $about_id ) );
		}

		// Product supplemental content.
		//
		// Registered unconditionally. A `post_type_exists( 'product' )` guard
		// looks sensible but fails: ACF fires `acf/init` before WooCommerce has
		// registered the `product` post type, so the guard is false on every
		// request and the group silently never exists. An ACF location rule for
		// a post type that is absent simply never matches, so registering it
		// unconditionally is harmless when WooCommerce is inactive.
		self::group( 'product', __( 'Extended Product Content', 'grahakavach-headless-core' ), GK_Model::product(), self::where_post_type( 'product' ) );

		// Reusable content types.
		self::group( 'faq', __( 'FAQ', 'grahakavach-headless-core' ), GK_Model::faq(), self::where_post_type( GK_CPT::FAQ ) );
		self::group( 'cert', __( 'Certification', 'grahakavach-headless-core' ), GK_Model::certification(), self::where_post_type( GK_CPT::CERTIFICATION ) );
		self::group( 'tst', __( 'Testimonial', 'grahakavach-headless-core' ), GK_Model::testimonial(), self::where_post_type( GK_CPT::TESTIMONIAL ) );
		self::group( 'guide', __( 'Safety Guide', 'grahakavach-headless-core' ), GK_Model::safety_guide(), self::where_post_type( GK_CPT::SAFETY_GUIDE ) );
		self::group( 'kit', __( 'Kit Item', 'grahakavach-headless-core' ), GK_Model::kit_item(), self::where_post_type( GK_CPT::KIT_ITEM ) );
	}
}

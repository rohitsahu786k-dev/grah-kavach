<?php
/**
 * Reusable content types.
 *
 * A post type is used only where the content is genuinely reusable across more
 * than one surface and carries its own media. Everything else is a structured
 * list on the page that owns it (see class-gk-structured.php), because a post
 * type for a one-off list would be more machinery to maintain, not less.
 *
 *   gk_faq          referenced by the homepage and by products
 *   gk_certification referenced by the homepage, about page and products
 *   gk_testimonial   referenced by the homepage
 *   gk_safety_guide  standalone educational content
 *   gk_kit_item      referenced by the homepage protection section AND by the
 *                    product kit contents — the clearest case for reuse
 *   gk_settings      singleton holding global site settings
 *
 * These are edited in wp-admin and read over GraphQL. None of them are
 * publicly queryable on the backend host, because the backend is not a website.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the project's custom post types.
 */
final class GK_CPT {

	public const FAQ           = 'gk_faq';
	public const CERTIFICATION = 'gk_certification';
	public const TESTIMONIAL   = 'gk_testimonial';
	public const SAFETY_GUIDE  = 'gk_safety_guide';
	public const KIT_ITEM      = 'gk_kit_item';
	public const SETTINGS      = 'gk_settings';
	public const INQUIRY       = 'gk_inquiry';

	public static function init(): void {
		add_action( 'init', array( __CLASS__, 'register' ), 5 );
		add_action( 'admin_menu', array( __CLASS__, 'settings_menu' ) );

		// Keep the settings singleton to exactly one entry.
		add_filter( 'map_meta_cap', array( __CLASS__, 'lock_settings_singleton' ), 10, 4 );
	}

	/**
	 * Build a label set for a post type.
	 *
	 * @param string $singular Singular label.
	 * @param string $plural   Plural label.
	 * @return array<string,string>
	 */
	private static function labels( string $singular, string $plural ): array {
		return array(
			'name'               => $plural,
			'singular_name'      => $singular,
			'menu_name'          => $plural,
			'add_new'            => __( 'Add New', 'grahakavach-headless-core' ),
			/* translators: %s: singular post type name. */
			'add_new_item'       => sprintf( __( 'Add New %s', 'grahakavach-headless-core' ), $singular ),
			/* translators: %s: singular post type name. */
			'edit_item'          => sprintf( __( 'Edit %s', 'grahakavach-headless-core' ), $singular ),
			/* translators: %s: plural post type name. */
			'all_items'          => sprintf( __( 'All %s', 'grahakavach-headless-core' ), $plural ),
			/* translators: %s: plural post type name. */
			'search_items'       => sprintf( __( 'Search %s', 'grahakavach-headless-core' ), $plural ),
			/* translators: %s: plural post type name. */
			'not_found'          => sprintf( __( 'No %s found', 'grahakavach-headless-core' ), strtolower( $plural ) ),
		);
	}

	/**
	 * Shared arguments for the editorial post types.
	 *
	 * `public => false` with `show_ui => true` is deliberate: these are edited
	 * in wp-admin but have no front-end URL on the backend host, which is
	 * exactly right for a headless CMS.
	 *
	 * @param string $singular   Singular label.
	 * @param string $plural     Plural label.
	 * @param string $icon       Dashicon.
	 * @param int    $position   Menu position.
	 * @param array  $supports   Editor supports.
	 * @return array<string,mixed>
	 */
	private static function args( string $singular, string $plural, string $icon, int $position, array $supports = array( 'title' ) ): array {
		return array(
			'labels'              => self::labels( $singular, $plural ),
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => false,
			'show_in_rest'        => true,
			'menu_icon'           => $icon,
			'menu_position'       => $position,
			'supports'            => $supports,
			'has_archive'         => false,
			'rewrite'             => false,
			'can_export'          => true,
			'delete_with_user'    => false,
		);
	}

	public static function register(): void {
		register_post_type( self::FAQ, self::args( 'FAQ', 'FAQs', 'dashicons-editor-help', 26 ) );
		register_post_type( self::CERTIFICATION, self::args( 'Certification', 'Certifications', 'dashicons-awards', 27 ) );
		register_post_type( self::TESTIMONIAL, self::args( 'Testimonial', 'Testimonials', 'dashicons-format-quote', 28 ) );
		register_post_type( self::SAFETY_GUIDE, self::args( 'Safety Guide', 'Safety Guides', 'dashicons-shield', 29, array( 'title', 'page-attributes' ) ) );
		register_post_type( self::KIT_ITEM, self::args( 'Kit Item', 'Kit Items', 'dashicons-archive', 30, array( 'title', 'page-attributes' ) ) );
		register_post_type( self::INQUIRY, self::args( 'Inquiry', 'Inquiries', 'dashicons-email', 31, array( 'title', 'editor', 'custom-fields' ) ) );

		// The settings singleton. Hidden from the top-level menu; surfaced as
		// a single "Site Settings" entry that opens the one post directly.
		register_post_type(
			self::SETTINGS,
			array(
				'labels'              => self::labels( 'Site Settings', 'Site Settings' ),
				'public'              => false,
				'publicly_queryable'  => false,
				'exclude_from_search' => true,
				'show_ui'             => true,
				'show_in_menu'        => false,
				'show_in_rest'        => false,
				'supports'            => array( 'title' ),
				'has_archive'         => false,
				'rewrite'             => false,
				'capability_type'     => 'post',
			)
		);
	}

	/**
	 * The ID of the singleton settings post, creating it on first use.
	 */
	public static function settings_post_id(): int {
		$existing = get_posts(
			array(
				'post_type'        => self::SETTINGS,
				'post_status'      => array( 'publish', 'draft' ),
				'numberposts'      => 1,
				'fields'           => 'ids',
				'suppress_filters' => false,
			)
		);

		if ( ! empty( $existing ) ) {
			return (int) $existing[0];
		}

		$id = wp_insert_post(
			array(
				'post_type'   => self::SETTINGS,
				'post_title'  => 'Graha Kavach — Site Settings',
				'post_status' => 'publish',
			)
		);

		return is_wp_error( $id ) ? 0 : (int) $id;
	}

	/**
	 * Add a "Site Settings" menu entry that opens the singleton directly.
	 */
	public static function settings_menu(): void {
		$id = self::settings_post_id();

		if ( ! $id ) {
			return;
		}

		add_menu_page(
			__( 'Site Settings', 'grahakavach-headless-core' ),
			__( 'Site Settings', 'grahakavach-headless-core' ),
			'edit_posts',
			'post.php?post=' . $id . '&action=edit',
			'',
			'dashicons-admin-settings',
			25
		);
	}

	/**
	 * Prevent creating or deleting additional settings posts.
	 *
	 * @param string[] $caps    Required capabilities.
	 * @param string   $cap     Capability being checked.
	 * @param int      $user_id User ID.
	 * @param array    $args    Context args.
	 * @return string[]
	 */
	public static function lock_settings_singleton( $caps, $cap, $user_id, $args ): array {
		unset( $user_id );

		if ( ! is_array( $caps ) ) {
			return (array) $caps;
		}

		// Block creating a second settings post.
		if ( 'create_posts' === $cap && ! empty( $args[0] ) && self::SETTINGS === $args[0] ) {
			return array( 'do_not_allow' );
		}

		// Block deleting the settings post.
		if ( 'delete_post' === $cap && ! empty( $args[0] ) ) {
			$post = get_post( (int) $args[0] );
			if ( $post && self::SETTINGS === $post->post_type ) {
				return array( 'do_not_allow' );
			}
		}

		return $caps;
	}

	/**
	 * Find (or create) the page that a singleton field group attaches to.
	 *
	 * @param string $slug  Page slug.
	 * @param string $title Title used if the page must be created.
	 */
	public static function page_id_by_slug( string $slug, string $title ): int {
		$page = get_page_by_path( $slug, OBJECT, 'page' );

		if ( $page instanceof WP_Post ) {
			return (int) $page->ID;
		}

		$id = wp_insert_post(
			array(
				'post_type'   => 'page',
				'post_name'   => $slug,
				'post_title'  => $title,
				'post_status' => 'publish',
			)
		);

		return is_wp_error( $id ) ? 0 : (int) $id;
	}
}

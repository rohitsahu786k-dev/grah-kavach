<?php
/**
 * GraphQL surface for the CMS content model.
 *
 * Generated from GK_Model, so the schema and the ACF fields cannot drift apart.
 *
 * Why this is hand-built rather than left to WPGraphQL for ACF's automatic
 * exposure:
 *
 *   1. Structured lists must arrive as typed arrays, not raw pipe-delimited
 *      strings. The frontend should never parse CMS syntax.
 *   2. Images must arrive resolved (url, alt, dimensions), not as bare IDs.
 *   3. Exposure is opt-in per field, so a backend-only field cannot leak by
 *      someone ticking a checkbox in wp-admin.
 *
 * Root queries:
 *   grahaKavachSettings
 *   grahaKavachHomepage
 *   grahaKavachAbout
 *   grahaKavachProductContent(productId: Int, slug: String)
 *   grahaKavachFaqs / Certifications / Testimonials / SafetyGuides / KitItems
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the project's content GraphQL types and root fields.
 */
final class GK_Content_GraphQL {

	public static function init(): void {
		add_action( 'graphql_register_types', array( __CLASS__, 'register' ), 20 );
	}

	/**
	 * Resolve an attachment ID into a media payload.
	 *
	 * @param mixed $id Attachment ID.
	 * @return array<string,mixed>|null
	 */
	private static function media( $id ): ?array {
		$id = (int) $id;

		if ( $id <= 0 || 'attachment' !== get_post_type( $id ) ) {
			return null;
		}

		$src = wp_get_attachment_image_src( $id, 'full' );
		$url = $src ? $src[0] : wp_get_attachment_url( $id );

		if ( ! $url ) {
			return null;
		}

		return array(
			'id'     => $id,
			'url'    => $url,
			'alt'    => (string) get_post_meta( $id, '_wp_attachment_image_alt', true ),
			'width'  => $src ? (int) $src[1] : null,
			'height' => $src ? (int) $src[2] : null,
			'mime'   => (string) get_post_mime_type( $id ),
		);
	}

	/**
	 * Resolve a list of attachment IDs.
	 *
	 * @param mixed $ids Attachment IDs.
	 * @return array<int,array<string,mixed>>
	 */
	private static function media_list( $ids ): array {
		if ( ! is_array( $ids ) ) {
			return array();
		}

		$out = array();
		foreach ( $ids as $id ) {
			$item = self::media( $id );
			if ( null !== $item ) {
				$out[] = $item;
			}
		}

		return $out;
	}

	/**
	 * Register the shared scalar-ish object types used across the schema.
	 */
	private static function register_shared_types(): void {
		register_graphql_object_type(
			'GrahaKavachMedia',
			array(
				'description' => __( 'A resolved media item from the WordPress media library.', 'grahakavach-headless-core' ),
				'fields'      => array(
					'id'     => array( 'type' => 'Int' ),
					'url'    => array( 'type' => 'String' ),
					'alt'    => array( 'type' => 'String' ),
					'width'  => array( 'type' => 'Int' ),
					'height' => array( 'type' => 'Int' ),
					'mime'   => array( 'type' => 'String' ),
				),
			)
		);

		// One object type per structured-list shape used in the manifest.
		$shapes = array(
			'GrahaKavachTitleTextRow'   => array( 'title', 'text' ),
			'GrahaKavachLinkRow'        => array( 'label', 'url' ),
			'GrahaKavachNavRow'         => array( 'group', 'label', 'url' ),
			'GrahaKavachHoursRow'       => array( 'days', 'hours' ),
			'GrahaKavachTimelineRow'    => array( 'year', 'title', 'text' ),
			'GrahaKavachSpecRow'        => array( 'group', 'label', 'value' ),
			'GrahaKavachRoleRow'        => array( 'title', 'role', 'text' ),
			'GrahaKavachWarningRow'     => array( 'level', 'title', 'text' ),
			'GrahaKavachLabelValueRow'  => array( 'label', 'value' ),
		);

		foreach ( $shapes as $type => $columns ) {
			$fields = array();
			foreach ( $columns as $column ) {
				$fields[ $column ] = array( 'type' => 'String' );
			}
			register_graphql_object_type( $type, array( 'fields' => $fields ) );
		}
	}

	/**
	 * Build the GraphQL `fields` array for a manifest.
	 *
	 * @param array  $manifest    Manifest entries.
	 * @param string $ref_type    GraphQL type used for relationship targets.
	 * @return array<string,mixed>
	 */
	private static function fields_for( array $manifest, array $ref_types ): array {
		$fields = array();

		foreach ( $manifest as $entry ) {
			$gql  = $entry['gql'];
			$name = $entry['name'];

			switch ( $entry['type'] ) {

				case 'structured':
					$shape   = $entry['shape'];
					$gqltype = $entry['gqltype'];
					$fields[ $gql ] = array(
						'type'    => array( 'list_of' => $gqltype ),
						'resolve' => static function ( $source ) use ( $name, $shape ) {
							return GK_Structured::parse( (string) ( $source[ $name ] ?? '' ), $shape );
						},
					);
					break;

				case 'image':
				case 'file':
					$fields[ $gql ] = array(
						'type'    => 'GrahaKavachMedia',
						'resolve' => static function ( $source ) use ( $name ) {
							return self::media( $source[ $name ] ?? 0 );
						},
					);
					break;

				case 'gallery_rel':
					$fields[ $gql ] = array(
						'type'    => array( 'list_of' => 'GrahaKavachMedia' ),
						'resolve' => static function ( $source ) use ( $name ) {
							return self::media_list( $source[ $name ] ?? array() );
						},
					);
					break;

				case 'relationship':
					$target = $ref_types[ $entry['post_type'] ] ?? null;
					if ( null === $target ) {
						break;
					}
					$post_type = $entry['post_type'];
					$fields[ $gql ] = array(
						'type'    => array( 'list_of' => $target ),
						'resolve' => static function ( $source ) use ( $name, $post_type ) {
							return self::resolve_refs( $source[ $name ] ?? array(), $post_type );
						},
					);
					break;

				case 'true_false':
					$fields[ $gql ] = array(
						'type'    => 'Boolean',
						'resolve' => static function ( $source ) use ( $name ) {
							return (bool) ( $source[ $name ] ?? false );
						},
					);
					break;

				case 'number':
					$fields[ $gql ] = array(
						'type'    => 'Float',
						'resolve' => static function ( $source ) use ( $name ) {
							$v = $source[ $name ] ?? null;
							return ( null === $v || '' === $v ) ? null : (float) $v;
						},
					);
					break;

				default:
					$fields[ $gql ] = array(
						'type'    => 'String',
						'resolve' => static function ( $source ) use ( $name ) {
							return (string) ( $source[ $name ] ?? '' );
						},
					);
			}
		}

		return $fields;
	}

	/**
	 * Read every manifest field for a post into a flat array.
	 *
	 * @param int   $post_id  Post ID.
	 * @param array $manifest Manifest entries.
	 * @return array<string,mixed>
	 */
	private static function values( int $post_id, array $manifest ): array {
		$out = array();

		foreach ( $manifest as $entry ) {
			$name  = $entry['name'];
			$value = null;

			if ( function_exists( 'get_field' ) ) {
				$value = get_field( $name, $post_id );
			}

			// Fall back to raw post meta when ACF returns nothing.
			//
			// ACF resolves a value through its `_fieldname` => field key
			// reference meta. Content written outside the ACF admin UI — a
			// migration script, a WP-CLI import, a direct SQL insert — often
			// has the value but not that reference, and get_field() then
			// returns null even though the data is present. Reading the meta
			// directly makes the API report what is actually stored.
			if ( null === $value || '' === $value || array() === $value ) {
				$raw = get_post_meta( $post_id, $name, true );

				if ( '' !== $raw && null !== $raw ) {
					$value = maybe_unserialize( $raw );
				}
			}

			$out[ $name ] = $value;
		}

		return $out;
	}

	/**
	 * Resolve relationship IDs into payloads for the referenced post type.
	 *
	 * @param mixed  $ids       Related post IDs.
	 * @param string $post_type Expected post type.
	 * @return array<int,array<string,mixed>>
	 */
	private static function resolve_refs( $ids, string $post_type ): array {
		if ( ! is_array( $ids ) || empty( $ids ) ) {
			return array();
		}

		$manifest = self::manifest_for( $post_type );
		$out      = array();

		foreach ( $ids as $id ) {
			$id   = (int) $id;
			$post = get_post( $id );

			// Only return published posts of the expected type.
			if ( ! $post || $post->post_type !== $post_type || 'publish' !== $post->post_status ) {
				continue;
			}

			$out[] = array_merge(
				self::values( $id, $manifest ),
				array(
					'__id'    => $id,
					'__title' => get_the_title( $id ),
					'__slug'  => $post->post_name,
				)
			);
		}

		return $out;
	}

	/**
	 * The manifest for a given reusable post type.
	 *
	 * @param string $post_type Post type name.
	 * @return array<int,array<string,mixed>>
	 */
	private static function manifest_for( string $post_type ): array {
		switch ( $post_type ) {
			case GK_CPT::FAQ:
				return GK_Model::faq();
			case GK_CPT::CERTIFICATION:
				return GK_Model::certification();
			case GK_CPT::TESTIMONIAL:
				return GK_Model::testimonial();
			case GK_CPT::SAFETY_GUIDE:
				return GK_Model::safety_guide();
			case GK_CPT::KIT_ITEM:
				return GK_Model::kit_item();
			default:
				return array();
		}
	}

	/**
	 * Map of post type => GraphQL type name for relationship targets.
	 *
	 * @return array<string,string>
	 */
	private static function ref_types(): array {
		return array(
			GK_CPT::FAQ           => 'GrahaKavachFaq',
			GK_CPT::CERTIFICATION => 'GrahaKavachCertification',
			GK_CPT::TESTIMONIAL   => 'GrahaKavachTestimonial',
			GK_CPT::SAFETY_GUIDE  => 'GrahaKavachSafetyGuide',
			GK_CPT::KIT_ITEM      => 'GrahaKavachKitItem',
		);
	}

	/**
	 * Register an object type for a reusable post type.
	 *
	 * @param string $type_name GraphQL type name.
	 * @param array  $manifest  Manifest entries.
	 */
	private static function register_ref_type( string $type_name, array $manifest ): void {
		$fields = array_merge(
			array(
				'id'    => array(
					'type'    => 'Int',
					'resolve' => static function ( $s ) {
						return (int) ( $s['__id'] ?? 0 );
					},
				),
				'title' => array(
					'type'    => 'String',
					'resolve' => static function ( $s ) {
						return (string) ( $s['__title'] ?? '' );
					},
				),
				'slug'  => array(
					'type'    => 'String',
					'resolve' => static function ( $s ) {
						return (string) ( $s['__slug'] ?? '' );
					},
				),
			),
			self::fields_for( $manifest, self::ref_types() )
		);

		register_graphql_object_type( $type_name, array( 'fields' => $fields ) );
	}

	/**
	 * Register a root query returning a list of a reusable post type.
	 *
	 * @param string $field_name Root field name.
	 * @param string $type_name  GraphQL type name.
	 * @param string $post_type  Post type.
	 */
	private static function register_list_query( string $field_name, string $type_name, string $post_type ): void {
		register_graphql_field(
			'RootQuery',
			$field_name,
			array(
				'type'    => array( 'list_of' => $type_name ),
				'args'    => array(
					'limit' => array( 'type' => 'Int', 'description' => __( 'Maximum items to return. Default 100.', 'grahakavach-headless-core' ) ),
				),
				'resolve' => static function ( $root, $args ) use ( $post_type ) {
					$limit = isset( $args['limit'] ) ? max( 1, min( 200, (int) $args['limit'] ) ) : 100;

					$ids = get_posts(
						array(
							'post_type'        => $post_type,
							'post_status'      => 'publish',
							'numberposts'      => $limit,
							'fields'           => 'ids',
							'orderby'          => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
							'suppress_filters' => false,
						)
					);

					return self::resolve_refs( $ids, $post_type );
				},
			)
		);
	}

	public static function register(): void {
		if ( ! function_exists( 'register_graphql_object_type' ) ) {
			return;
		}

		self::register_shared_types();

		// Reusable content types.
		self::register_ref_type( 'GrahaKavachFaq', GK_Model::faq() );
		self::register_ref_type( 'GrahaKavachCertification', GK_Model::certification() );
		self::register_ref_type( 'GrahaKavachTestimonial', GK_Model::testimonial() );
		self::register_ref_type( 'GrahaKavachSafetyGuide', GK_Model::safety_guide() );
		self::register_ref_type( 'GrahaKavachKitItem', GK_Model::kit_item() );

		self::register_list_query( 'grahaKavachFaqs', 'GrahaKavachFaq', GK_CPT::FAQ );
		self::register_list_query( 'grahaKavachCertifications', 'GrahaKavachCertification', GK_CPT::CERTIFICATION );
		self::register_list_query( 'grahaKavachTestimonials', 'GrahaKavachTestimonial', GK_CPT::TESTIMONIAL );
		self::register_list_query( 'grahaKavachSafetyGuides', 'GrahaKavachSafetyGuide', GK_CPT::SAFETY_GUIDE );
		self::register_list_query( 'grahaKavachKitItems', 'GrahaKavachKitItem', GK_CPT::KIT_ITEM );

		$refs = self::ref_types();

		// ---- Global settings -------------------------------------------
		register_graphql_object_type(
			'GrahaKavachSiteSettings',
			array( 'fields' => self::fields_for( GK_Model::settings(), $refs ) )
		);

		register_graphql_field(
			'RootQuery',
			'grahaKavachSettings',
			array(
				'type'        => 'GrahaKavachSiteSettings',
				'description' => __( 'Global site settings for the Graha Kavach storefront.', 'grahakavach-headless-core' ),
				'resolve'     => static function () {
					$id = GK_CPT::settings_post_id();

					return $id ? self::values( $id, GK_Model::settings() ) : array();
				},
			)
		);

		// ---- Homepage ---------------------------------------------------
		register_graphql_object_type(
			'GrahaKavachHomepage',
			array( 'fields' => self::fields_for( GK_Model::homepage(), $refs ) )
		);

		register_graphql_field(
			'RootQuery',
			'grahaKavachHomepage',
			array(
				'type'        => 'GrahaKavachHomepage',
				'description' => __( 'Structured homepage content.', 'grahakavach-headless-core' ),
				'resolve'     => static function () {
					$id = GK_CPT::page_id_by_slug( 'home', 'Home' );

					return $id ? self::values( $id, GK_Model::homepage() ) : array();
				},
			)
		);

		// ---- About ------------------------------------------------------
		register_graphql_object_type(
			'GrahaKavachAboutPage',
			array( 'fields' => self::fields_for( GK_Model::about(), $refs ) )
		);

		register_graphql_field(
			'RootQuery',
			'grahaKavachAbout',
			array(
				'type'        => 'GrahaKavachAboutPage',
				'description' => __( 'Structured About page content.', 'grahakavach-headless-core' ),
				'resolve'     => static function () {
					$id = GK_CPT::page_id_by_slug( 'about-us', 'About Us' );

					return $id ? self::values( $id, GK_Model::about() ) : array();
				},
			)
		);

		// ---- Product supplemental content -------------------------------
		//
		// WooGraphQL is not installed, so there is no Product type to extend.
		// Supplemental content is therefore addressed by product ID or slug and
		// joined to the commerce payload (price, stock, SKU) that the frontend
		// reads from the WooCommerce REST API.
		register_graphql_object_type(
			'GrahaKavachProductContent',
			array( 'fields' => self::fields_for( GK_Model::product(), $refs ) )
		);

		register_graphql_field(
			'RootQuery',
			'grahaKavachProductContent',
			array(
				'type'        => 'GrahaKavachProductContent',
				'description' => __( 'Editorial content supplementing a WooCommerce product. Commerce data itself comes from the WooCommerce REST API.', 'grahakavach-headless-core' ),
				'args'        => array(
					'productId' => array( 'type' => 'Int' ),
					'slug'      => array( 'type' => 'String' ),
				),
				'resolve'     => static function ( $root, $args ) {
					$id = 0;

					if ( ! empty( $args['productId'] ) ) {
						$id = (int) $args['productId'];
					} elseif ( ! empty( $args['slug'] ) ) {
						$post = get_page_by_path( sanitize_title( $args['slug'] ), OBJECT, 'product' );
						$id   = $post instanceof WP_Post ? (int) $post->ID : 0;
					}

					if ( ! $id ) {
						return null;
					}

					$post = get_post( $id );
					if ( ! $post || 'product' !== $post->post_type || 'publish' !== $post->post_status ) {
						return null;
					}

					return self::values( $id, GK_Model::product() );
				},
			)
		);
	}
}

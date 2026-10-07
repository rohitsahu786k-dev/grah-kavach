<?php
/**
 * Plugin Name:       Graha Kavach Blog Content Importer
 * Description:       One-time tool: writes the full article text, excerpt, category and SEO description into the 15 existing Graha Kavach blog posts (matched by slug). Run it once from Tools > GK Blog Import, then deactivate and delete it.
 * Version:           1.0.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Graha Kavach
 * License:           GPL-2.0-or-later
 * Text Domain:       grahakavach-blog-content
 *
 * Only posts that already exist are updated; titles and slugs are never
 * changed, so every URL stays exactly as it is. Safe to run more than once.
 *
 * @package GrahaKavach\BlogContent
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class GKBC_Importer {

	private const SLUG = 'gk-blog-import';

	public static function init(): void {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_post_gkbc_import', array( __CLASS__, 'run' ) );
		add_action( 'admin_post_gkbc_trash_sample', array( __CLASS__, 'trash_sample' ) );
	}

	public static function menu(): void {
		add_management_page( 'GK Blog Import', 'GK Blog Import', 'edit_others_posts', self::SLUG, array( __CLASS__, 'render' ) );
	}

	/**
	 * @return array<string,array<string,string>>
	 */
	private static function meta(): array {
		$raw  = file_get_contents( __DIR__ . '/meta.json' ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		$data = is_string( $raw ) ? json_decode( $raw, true ) : null;

		return is_array( $data ) ? $data : array();
	}

	private static function find_post( string $slug ): ?WP_Post {
		$posts = get_posts(
			array(
				'name'           => $slug,
				'post_type'      => 'post',
				'post_status'    => array( 'publish', 'draft', 'pending', 'future', 'private' ),
				'posts_per_page' => 1,
			)
		);

		return $posts ? $posts[0] : null;
	}

	private static function guard(): void {
		if ( ! current_user_can( 'edit_others_posts' ) ) {
			wp_die( 'Not allowed.' );
		}
		check_admin_referer( 'gkbc_action' );
	}

	private static function back( string $message ): void {
		set_transient( 'gkbc_notice_' . get_current_user_id(), $message, 120 );
		wp_safe_redirect( admin_url( 'tools.php?page=' . self::SLUG ) );
		exit;
	}

	public static function run(): void {
		self::guard();

		$done    = array();
		$missing = array();

		foreach ( self::meta() as $slug => $info ) {
			$file = __DIR__ . '/content/' . $slug . '.html';
			$post = self::find_post( (string) $slug );

			if ( ! $post || ! is_readable( $file ) ) {
				$missing[] = $slug;
				continue;
			}

			$html = (string) file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions

			wp_update_post(
				wp_slash(
					array(
						'ID'           => $post->ID,
						'post_content' => $html,
						'post_excerpt' => $info['excerpt'],
					)
				)
			);

			$category = get_category_by_slug( $info['category'] );
			if ( $category ) {
				wp_set_post_categories( $post->ID, array( (int) $category->term_id ), false );
			}

			// Yoast SEO meta description (read by the storefront); harmless if Yoast is absent.
			update_post_meta( $post->ID, '_yoast_wpseo_metadesc', $info['description'] );

			$done[] = $slug;
		}

		$message = sprintf( 'Updated %d post(s).', count( $done ) );
		if ( $missing ) {
			$message .= ' Not found or file missing: ' . implode( ', ', $missing ) . '.';
		}
		self::back( $message );
	}

	public static function trash_sample(): void {
		self::guard();

		$post = self::find_post( 'hello-world' );
		if ( $post ) {
			wp_trash_post( $post->ID );
			self::back( 'Sample post "Hello world!" moved to Trash.' );
		}
		self::back( 'Sample post "Hello world!" was not found (already removed).' );
	}

	public static function render(): void {
		$notice = get_transient( 'gkbc_notice_' . get_current_user_id() );
		if ( $notice ) {
			delete_transient( 'gkbc_notice_' . get_current_user_id() );
		}
		?>
		<div class="wrap">
			<h1>Graha Kavach Blog Import</h1>
			<?php if ( $notice ) : ?>
				<div class="notice notice-success"><p><?php echo esc_html( (string) $notice ); ?></p></div>
			<?php endif; ?>

			<p>This writes the full article text, excerpt, category and SEO description into the existing blog posts below. Titles and URLs are not changed. You can run it again at any time; it simply overwrites the same fields.</p>

			<table class="widefat striped" style="max-width:900px">
				<thead><tr><th>Slug</th><th>Post found</th><th>Words now</th></tr></thead>
				<tbody>
				<?php foreach ( array_keys( self::meta() ) as $slug ) : ?>
					<?php $post = self::find_post( (string) $slug ); ?>
					<tr>
						<td><code><?php echo esc_html( (string) $slug ); ?></code></td>
						<td><?php echo $post ? 'Yes' : '<strong>No</strong>'; ?></td>
						<td><?php echo $post ? esc_html( (string) str_word_count( wp_strip_all_tags( $post->post_content ) ) ) : '-'; ?></td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="margin-top:16px">
				<input type="hidden" name="action" value="gkbc_import" />
				<?php wp_nonce_field( 'gkbc_action' ); ?>
				<?php submit_button( 'Write articles into these posts', 'primary', 'submit', false ); ?>
			</form>

			<h2>Sample post</h2>
			<p>WordPress's default "Hello world!" post should not be public. This moves it to Trash (you can restore it from there).</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="gkbc_trash_sample" />
				<?php wp_nonce_field( 'gkbc_action' ); ?>
				<?php submit_button( 'Move "Hello world!" to Trash', 'secondary', 'submit', false ); ?>
			</form>
		</div>
		<?php
	}
}

GKBC_Importer::init();

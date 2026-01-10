<?php
/**
 * Plugin Name:       My Scroll Block
 * Description:       Adds a Scroll Animation panel to supported core blocks.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       my-scroll-block
 *
 * @package           create-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the Reading Progress block.
 */
function my_scroll_block_register_blocks() {
	// Register the Reading Progress block
	register_block_type( __DIR__ . '/src/progress-block/block.json' );
}
add_action( 'init', 'my_scroll_block_register_blocks' );

/**
 * Registers and enqueues editor and frontend assets to extend existing blocks.
 */
function my_scroll_block_register_assets() {
	$dir = plugin_dir_path( __FILE__ );

	// Editor script/css.
	$editor_asset_path = $dir . 'build/index.asset.php';
	if ( file_exists( $editor_asset_path ) ) {
		$editor_asset = include $editor_asset_path;
		wp_register_script(
			'my-scroll-block-editor',
			plugins_url( 'build/index.js', __FILE__ ),
			isset( $editor_asset['dependencies'] ) ? $editor_asset['dependencies'] : array(),
			isset( $editor_asset['version'] ) ? $editor_asset['version'] : filemtime( $dir . 'build/index.js' ),
			true
		);
	}

	if ( file_exists( $dir . 'build/index.css' ) ) {
		wp_register_style(
			'my-scroll-block-editor',
			plugins_url( 'build/index.css', __FILE__ ),
			array( 'wp-edit-blocks' ),
			filemtime( $dir . 'build/index.css' )
		);

		// Ensure styles load inside the editor iframe for supported core blocks.
		$supported_blocks = array( 'core/image', 'core/paragraph', 'core/columns', 'core/group', 'core/heading' );
		foreach ( $supported_blocks as $block_name ) {
			wp_enqueue_block_style(
				$block_name,
				array(
					'handle' => 'my-scroll-block-editor',
					'src'    => plugins_url( 'build/index.css', __FILE__ ),
					'path'   => $dir . 'build/index.css',
				)
			);
		}
	}

	// Frontend shared style.
	if ( file_exists( $dir . 'build/style-index.css' ) ) {
		wp_register_style(
			'my-scroll-block-style',
			plugins_url( 'build/style-index.css', __FILE__ ),
			array(),
			filemtime( $dir . 'build/style-index.css' )
		);
	}

	// No frontend JS needed when using CSS scroll timelines only.
}
add_action( 'init', 'my_scroll_block_register_assets' );

// Enqueue in editor.
add_action( 'enqueue_block_editor_assets', function() {
	if ( wp_script_is( 'my-scroll-block-editor', 'registered' ) ) {
		wp_enqueue_script( 'my-scroll-block-editor' );
	}
	if ( wp_style_is( 'my-scroll-block-editor', 'registered' ) ) {
		wp_enqueue_style( 'my-scroll-block-editor' );
	}
	// No view script needed in editor.
} );

// Enqueue on frontend.
// Conditionally enqueue frontend assets when a block uses the animation attributes.
add_filter( 'render_block', function( $block_content, $block ) {
	if ( empty( $block['attrs'] ) || ! is_array( $block['attrs'] ) ) {
		return $block_content;
	}
	$attrs = $block['attrs'];

	$has_animation     = isset( $attrs['animationType'] ) && 'none' !== $attrs['animationType'];
	$parallax_enabled  = isset( $attrs['parallaxEnabled'] ) && $attrs['parallaxEnabled'];

	if ( $has_animation || $parallax_enabled ) {
		if ( wp_style_is( 'my-scroll-block-style', 'registered' ) ) {
			wp_enqueue_style( 'my-scroll-block-style' );
		}
		// No view script on frontend when relying on CSS scroll timelines.

		// Also ensure outer wrapper receives classes and attributes if missing (covers dynamic blocks).
		$needs_injection = is_string( $block_content ) && $block_content !== '';
		$missing_anim    = $has_animation && strpos( $block_content, 'scroll-anim-block' ) === false;
		$missing_parallax = $parallax_enabled && strpos( $block_content, 'data-parallax' ) === false;

		if ( $needs_injection && ( $missing_anim || $missing_parallax ) ) {
			$add_classes = '';
			$data_attrs  = '';
			$style_attr  = '';

			// Handle animation classes and data attributes
			if ( $has_animation && $missing_anim ) {
				$animation_type  = sanitize_key( (string) $attrs['animationType'] );
				$animation_range = isset( $attrs['animationRange'] ) ? sanitize_key( (string) $attrs['animationRange'] ) : 'default';

				$add_classes = sprintf( 'scroll-anim-block scroll-anim-%s', strtolower( str_replace( ' ', '-', $animation_type ) ) );

				// Build data attributes
				$data_attrs = ' data-scroll-anim="1" data-anim-range="' . esc_attr( $animation_range ) . '"';

				// Add custom range values if using custom range
				if ( $animation_range === 'custom' ) {
					if ( isset( $attrs['animationEntryStart'] ) ) {
						$data_attrs .= ' data-entry-start="' . absint( $attrs['animationEntryStart'] ) . '"';
					}
					if ( isset( $attrs['animationEntryEnd'] ) ) {
						$data_attrs .= ' data-entry-end="' . absint( $attrs['animationEntryEnd'] ) . '"';
					}
					// Add exit range for in-out animations
					if ( strpos( $animation_type, 'in-out' ) !== false ) {
						if ( isset( $attrs['animationExitStart'] ) ) {
							$data_attrs .= ' data-exit-start="' . absint( $attrs['animationExitStart'] ) . '"';
						}
						if ( isset( $attrs['animationExitEnd'] ) ) {
							$data_attrs .= ' data-exit-end="' . absint( $attrs['animationExitEnd'] ) . '"';
						}
					}
				}
			}

			// Handle parallax data attributes and styles
			if ( $parallax_enabled && $missing_parallax ) {
				$parallax_strength = isset( $attrs['parallaxStrength'] ) ? absint( $attrs['parallaxStrength'] ) : 50;
				$data_attrs       .= ' data-parallax="1" data-parallax-strength="' . $parallax_strength . '"';
				$style_attr        = '--parallax-strength: ' . $parallax_strength . 'px;';
			}

			// Inject into first element tag.
			if ( preg_match( '/^\s*<([a-zA-Z0-9:-]+)([^>]*)>/', $block_content, $m, PREG_OFFSET_CAPTURE ) ) {
				$full     = $m[0][0];
				$attrsStr = $m[2][0];
				$updated  = $attrsStr;

				// Add or merge classes
				if ( $add_classes ) {
					if ( preg_match( '/\sclass\s*=\s*"([^"]*)"/i', $attrsStr, $cm ) ) {
						$newClass = trim( $cm[1] . ' ' . $add_classes );
						$updated  = preg_replace( '/\sclass\s*=\s*"([^"]*)"/i', ' class="' . esc_attr( $newClass ) . '"', $updated, 1 );
					} else {
						$updated .= ' class="' . esc_attr( $add_classes ) . '"';
					}
				}

				// Add data attributes
				if ( $data_attrs && strpos( $updated, 'data-scroll-anim' ) === false && strpos( $updated, 'data-parallax' ) === false ) {
					$updated .= $data_attrs;
				}

				// Add or merge style attribute for parallax
				if ( $style_attr ) {
					if ( preg_match( '/\sstyle\s*=\s*"([^"]*)"/i', $attrsStr, $sm ) ) {
						$existing_style = rtrim( $sm[1], '; ' );
						$new_style      = $existing_style . '; ' . $style_attr;
						$updated        = preg_replace( '/\sstyle\s*=\s*"([^"]*)"/i', ' style="' . esc_attr( $new_style ) . '"', $updated, 1 );
					} else {
						$updated .= ' style="' . esc_attr( $style_attr ) . '"';
					}
				}

				$newOpen       = '<' . $m[1][0] . $updated . '>';
				$block_content = substr_replace( $block_content, $newOpen, $m[0][1], strlen( $full ) );
			}
		}
	}
	return $block_content;
}, 10, 2 );

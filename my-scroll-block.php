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

// Include the error logger
require_once plugin_dir_path( __FILE__ ) . 'error-logger.php';

/**
 * Registers the Reading Progress block.
 */
function my_scroll_block_register_blocks() {
	// Log initialization
	msb_log_info( 'Registering scroll blocks' );

	// Register the Reading Progress block
	$result = register_block_type( __DIR__ . '/src/progress-block/block.json' );

	if ( false === $result ) {
		msb_log_error_message( 'Failed to register progress block', array(
			'block_json' => __DIR__ . '/src/progress-block/block.json'
		) );
	} else {
		msb_log_debug( 'Progress block registered successfully' );
	}
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
		msb_log_debug( 'Editor assets loaded successfully' );
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

	// Log potential issues with block attributes
	if ( ! is_array( $block['attrs'] ) ) {
		msb_log_warning( 'Block attributes are not an array', array(
			'block_name' => isset( $block['blockName'] ) ? $block['blockName'] : 'unknown'
		) );
	}
	$attrs = $block['attrs'];
	if ( isset( $attrs['animationType'] ) && 'none' !== $attrs['animationType'] ) {
		if ( wp_style_is( 'my-scroll-block-style', 'registered' ) ) {
			wp_enqueue_style( 'my-scroll-block-style' );
		}
		// No view script on frontend when relying on CSS scroll timelines.

		// Also ensure outer wrapper receives classes and attributes if missing (covers dynamic blocks).
		if ( is_string( $block_content ) && $block_content !== '' && strpos( $block_content, 'scroll-anim-block' ) === false ) {
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

			// Inject into first element tag.
			if ( preg_match( '/^\s*<([a-zA-Z0-9:-]+)([^>]*)>/', $block_content, $m, PREG_OFFSET_CAPTURE ) ) {
				$full     = $m[0][0];
				$attrsStr = $m[2][0];
				$updated  = $attrsStr;

				if ( preg_match( '/\sclass\s*=\s*"([^"]*)"/i', $attrsStr, $cm ) ) {
					$newClass = trim( $cm[1] . ' ' . $add_classes );
					$updated  = preg_replace( '/\sclass\s*=\s*"([^"]*)"/i', ' class="' . esc_attr( $newClass ) . '"', $updated, 1 );
				} else {
					$updated .= ' class="' . esc_attr( $add_classes ) . '"';
				}

				if ( strpos( $updated, 'data-scroll-anim' ) === false ) {
					$updated .= $data_attrs;
				}

				$newOpen = '<' . $m[1][0] . $updated . '>';
				$block_content = substr_replace( $block_content, $newOpen, $m[0][1], strlen( $full ) );
			}
		}
	}
	return $block_content;
}, 10, 2 );

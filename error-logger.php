<?php
/**
 * Error Logger for WordPress
 *
 * Provides simple error logging functionality for WordPress sites.
 * Logs errors to WordPress debug.log and optionally to a custom log file.
 *
 * @package my-scroll-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Main error logger function
 *
 * @param string $message The error message to log
 * @param string $level The error level: 'error', 'warning', 'info', 'debug'
 * @param array $context Additional context data
 * @return bool True if logged successfully
 */
function msb_log_error( $message, $level = 'error', $context = array() ) {
	// Format the timestamp
	$timestamp = current_time( 'mysql' );

	// Build the log message
	$log_message = sprintf(
		'[%s] [%s] %s',
		$timestamp,
		strtoupper( $level ),
		$message
	);

	// Add context if provided
	if ( ! empty( $context ) ) {
		$log_message .= ' | Context: ' . wp_json_encode( $context );
	}

	// Add backtrace for errors
	if ( 'error' === $level ) {
		$backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 3 );
		if ( isset( $backtrace[1] ) ) {
			$caller = $backtrace[1];
			$log_message .= sprintf(
				' | Called from: %s:%d',
				isset( $caller['file'] ) ? basename( $caller['file'] ) : 'unknown',
				isset( $caller['line'] ) ? $caller['line'] : 0
			);
		}
	}

	// Log to WordPress debug.log if WP_DEBUG_LOG is enabled
	if ( defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
		error_log( '[My Scroll Block] ' . $log_message );
	}

	// Optionally log to custom file
	$custom_log_enabled = apply_filters( 'msb_custom_log_enabled', false );
	if ( $custom_log_enabled ) {
		msb_write_to_custom_log( $log_message );
	}

	// Trigger an action hook for custom logging handlers
	do_action( 'msb_after_log', $message, $level, $context );

	return true;
}

/**
 * Log an error message
 *
 * @param string $message The error message
 * @param array $context Additional context
 */
function msb_log_error_message( $message, $context = array() ) {
	msb_log_error( $message, 'error', $context );
}

/**
 * Log a warning message
 *
 * @param string $message The warning message
 * @param array $context Additional context
 */
function msb_log_warning( $message, $context = array() ) {
	msb_log_error( $message, 'warning', $context );
}

/**
 * Log an info message
 *
 * @param string $message The info message
 * @param array $context Additional context
 */
function msb_log_info( $message, $context = array() ) {
	msb_log_error( $message, 'info', $context );
}

/**
 * Log a debug message
 *
 * @param string $message The debug message
 * @param array $context Additional context
 */
function msb_log_debug( $message, $context = array() ) {
	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		msb_log_error( $message, 'debug', $context );
	}
}

/**
 * Write to custom log file
 *
 * @param string $message The message to write
 */
function msb_write_to_custom_log( $message ) {
	$upload_dir = wp_upload_dir();
	$log_dir = $upload_dir['basedir'] . '/my-scroll-block-logs';

	// Create log directory if it doesn't exist
	if ( ! file_exists( $log_dir ) ) {
		wp_mkdir_p( $log_dir );
		// Add index.php to prevent directory listing
		file_put_contents( $log_dir . '/index.php', '<?php // Silence is golden' );
	}

	$log_file = $log_dir . '/error-' . date( 'Y-m-d' ) . '.log';

	// Write to log file
	$fp = fopen( $log_file, 'a' );
	if ( $fp ) {
		fwrite( $fp, $message . PHP_EOL );
		fclose( $fp );
	}
}

/**
 * Log PHP errors and exceptions
 *
 * @param Exception|Error $exception The exception or error
 */
function msb_log_exception( $exception ) {
	$message = sprintf(
		'%s: %s in %s:%d',
		get_class( $exception ),
		$exception->getMessage(),
		$exception->getFile(),
		$exception->getLine()
	);

	$context = array(
		'trace' => $exception->getTraceAsString(),
	);

	msb_log_error( $message, 'error', $context );
}

/**
 * Example usage function - demonstrates how to use the logger
 * This function can be called to test the logging system
 */
function msb_test_error_logger() {
	// Only run if user has admin capabilities
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	// Test different log levels
	msb_log_debug( 'This is a debug message' );
	msb_log_info( 'Plugin initialized successfully' );
	msb_log_warning( 'Potential issue detected', array( 'block' => 'core/image' ) );
	msb_log_error_message( 'Something went wrong', array( 'error_code' => 500 ) );
}

/**
 * Add admin notice if logging is enabled
 */
function msb_log_admin_notice() {
	if ( defined( 'WP_DEBUG' ) && WP_DEBUG && defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
		$class = 'notice notice-info';
		$message = 'My Scroll Block: Error logging is enabled. Check wp-content/debug.log for logs.';
		printf( '<div class="%1$s"><p>%2$s</p></div>', esc_attr( $class ), esc_html( $message ) );
	}
}
// Uncomment to show admin notice about logging
// add_action( 'admin_notices', 'msb_log_admin_notice' );

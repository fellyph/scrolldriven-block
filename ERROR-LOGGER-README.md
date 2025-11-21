# WordPress Error Logger

A simple and comprehensive error logging system for the My Scroll Block WordPress plugin.

## Features

- **Multiple Log Levels**: Error, Warning, Info, and Debug
- **WordPress Integration**: Automatically logs to WordPress `debug.log` when `WP_DEBUG_LOG` is enabled
- **Custom Log Files**: Optional daily log files stored in `wp-content/uploads/my-scroll-block-logs/`
- **Context Support**: Add additional context data to log entries
- **Backtrace**: Automatic backtrace for error-level logs
- **Action Hooks**: Extend logging with custom handlers

## Setup

### Enable WordPress Debug Logging

Add these lines to your `wp-config.php`:

```php
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );
```

Logs will be written to `wp-content/debug.log`

### Enable Custom Log Files (Optional)

Add this filter to your theme's `functions.php` or another plugin:

```php
add_filter( 'msb_custom_log_enabled', '__return_true' );
```

Custom logs will be saved to: `wp-content/uploads/my-scroll-block-logs/error-YYYY-MM-DD.log`

## Usage

### Basic Logging

```php
// Log an error
msb_log_error_message( 'Something went wrong!' );

// Log a warning
msb_log_warning( 'This might be a problem' );

// Log an info message
msb_log_info( 'Plugin initialized successfully' );

// Log a debug message (only when WP_DEBUG is true)
msb_log_debug( 'Variable value: ' . $some_variable );
```

### Logging with Context

Add additional context data to your logs:

```php
msb_log_error_message( 'Failed to load block', array(
    'block_type' => 'core/image',
    'user_id' => get_current_user_id(),
    'post_id' => get_the_ID()
) );
```

### Logging Exceptions

```php
try {
    // Some risky operation
    some_function_that_might_fail();
} catch ( Exception $e ) {
    msb_log_exception( $e );
}
```

### Custom Logging Handler

Add your own logging handler using the action hook:

```php
add_action( 'msb_after_log', 'my_custom_logger', 10, 3 );

function my_custom_logger( $message, $level, $context ) {
    // Send to external service
    // Email critical errors
    // Store in database
    // etc.
}
```

## Log Format

Logs are formatted as:

```
[2025-11-21 13:45:30] [ERROR] Message here | Context: {"key":"value"} | Called from: file.php:123
```

## Log Levels

- **ERROR**: Critical errors that need immediate attention
- **WARNING**: Potential issues that might cause problems
- **INFO**: General information about plugin operations
- **DEBUG**: Detailed information for debugging (only logged when WP_DEBUG is true)

## Example Implementation

The error logger is already integrated into the plugin. Here are some examples from `my-scroll-block.php`:

```php
// Log block registration
msb_log_info( 'Registering scroll blocks' );

// Log registration failure
if ( false === $result ) {
    msb_log_error_message( 'Failed to register progress block', array(
        'block_json' => __DIR__ . '/src/progress-block/block.json'
    ) );
}

// Log debug information
msb_log_debug( 'Progress block registered successfully' );

// Log warnings
msb_log_warning( 'Block attributes are not an array', array(
    'block_name' => $block['blockName']
) );
```

## Testing

To test the error logger, you can call the test function:

```php
msb_test_error_logger();
```

This will generate sample log entries for all log levels.

## File Locations

- **WordPress Debug Log**: `wp-content/debug.log`
- **Custom Daily Logs**: `wp-content/uploads/my-scroll-block-logs/error-YYYY-MM-DD.log`
- **Logger Code**: `error-logger.php`

## Security

- Custom log directory includes `index.php` to prevent directory listing
- All user input is sanitized before logging
- Logs are stored outside the web root when using WordPress debug.log

## Performance

- Minimal overhead when logging is disabled
- Daily log rotation for custom logs
- No database queries

## Troubleshooting

### Logs Not Appearing

1. Check that `WP_DEBUG` and `WP_DEBUG_LOG` are enabled in `wp-config.php`
2. Verify that `wp-content` directory is writable
3. Check file permissions on the log directory

### Permission Errors

Make sure the web server has write permissions:

```bash
chmod 755 wp-content/uploads/my-scroll-block-logs/
```

## Advanced Usage

### Filtering Log Messages

```php
add_filter( 'msb_custom_log_enabled', function( $enabled ) {
    // Only enable custom logging in production
    return defined( 'WP_ENV' ) && WP_ENV === 'production';
} );
```

### Log Rotation

Custom logs automatically rotate daily (one file per day). To implement cleanup of old logs, add a scheduled task:

```php
add_action( 'init', function() {
    if ( ! wp_next_scheduled( 'msb_cleanup_old_logs' ) ) {
        wp_schedule_event( time(), 'weekly', 'msb_cleanup_old_logs' );
    }
} );

add_action( 'msb_cleanup_old_logs', function() {
    // Delete logs older than 30 days
    $upload_dir = wp_upload_dir();
    $log_dir = $upload_dir['basedir'] . '/my-scroll-block-logs';
    $files = glob( $log_dir . '/error-*.log' );

    foreach ( $files as $file ) {
        if ( filemtime( $file ) < strtotime( '-30 days' ) ) {
            unlink( $file );
        }
    }
} );
```

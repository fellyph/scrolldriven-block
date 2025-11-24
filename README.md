# My Scroll Block

A WordPress plugin that adds scroll-driven animation capabilities to core blocks using CSS scroll timelines. This plugin extends supported WordPress core blocks (Paragraph, Image, Heading, Columns, Group) with a Scroll Animation panel in the block editor.

## Features

- 🎨 **8 Animation Types**: Fade In, Slide In (Left/Right/Up/Down), Scale Up, and Rotate In
- 🎯 **Core Block Support**: Works with Paragraph, Image, Heading, Columns, and Group blocks
- 🚀 **CSS-Powered**: Uses native CSS scroll timelines for optimal performance
- ✨ **No JavaScript Required**: Pure CSS animations on the frontend
- 🔧 **Easy to Use**: Simple dropdown in the block editor settings panel
- ♿ **Accessible**: Respects `prefers-reduced-motion` for users who need reduced animations

## Supported Animation Types

- **None**: No animation (default)
- **Fade In**: Element fades in as you scroll
- **Slide In Left**: Element slides in from the left
- **Slide In Right**: Element slides in from the right
- **Slide In Up**: Element slides up from below
- **Slide In Down**: Element slides down from above
- **Scale Up**: Element scales up from smaller size
- **Rotate In**: Element rotates as it appears

## Requirements

- WordPress 6.8 or higher
- PHP 7.4 or higher
- Modern browser with CSS scroll timeline support

## Installation

### For Development

1. Clone the repository:

```bash
git clone <repository-url>
cd my-scroll-block
```

2. Install dependencies:

```bash
npm install
```

3. Build the plugin:

```bash
npm run build
```

4. Start development mode (with live reload):

```bash
npm start
```

### For Production

1. Build the plugin:

```bash
npm run build
```

2. Create a zip file:

```bash
npm run plugin-zip
```

3. Upload and activate the plugin in WordPress

## Development

### Available Scripts

- `npm start` - Start development mode with live reload
- `npm run build` - Build for production
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run lint:css` - Lint CSS files
- `npm run lint:js` - Lint JavaScript files
- `npm test` - Run Playwright tests
- `npm run test:headed` - Run tests with visible browser
- `npm run test:debug` - Run tests in debug mode
- `npm run test:report` - View test report
- `npm run typecheck` - Validate TypeScript types
- `npm run plugin-zip` - Create plugin zip file

## Testing

This project uses Playwright with TypeScript for end-to-end testing with WordPress Playground.

### Setup Tests

1. Install Playwright browsers:

```bash
npx playwright install --with-deps chromium
```

2. Run tests:

```bash
npm test
```

3. Check TypeScript types:

```bash
npm run typecheck
```

For more details, see [tests/README.md](tests/README.md)

### TypeScript Support

Tests are written in TypeScript for:

- ✅ Type safety and error prevention
- ✅ Better IDE autocomplete
- ✅ Self-documenting code
- ✅ Catch errors before runtime

See [TYPESCRIPT_MIGRATION.md](../TYPESCRIPT_MIGRATION.md) for migration details.

## How It Works

### In the Editor

1. Add or select a supported block (Paragraph, Image, Heading, etc.)
2. Open the block settings panel on the right
3. Find the "Scroll Animation" section
4. Select your desired animation type from the dropdown
5. A visual indicator appears on the block showing the animation is applied

### On the Frontend

When a block has a scroll animation:

- The plugin adds CSS classes: `scroll-anim-block` and `scroll-anim-{type}`
- A data attribute `data-scroll-anim="1"` is added
- CSS scroll timeline rules trigger the animation as you scroll
- No JavaScript is executed on the frontend

## Project Structure

```
my-scroll-block/
├── build/                  # Compiled assets (generated)
├── src/                    # Source files
│   ├── index.js           # Main editor script
│   ├── editor.css         # Editor styles
│   └── style.css          # Frontend styles
├── tests/                  # Playwright tests
│   ├── scroll-block.spec.js
│   ├── global-setup.js
│   └── global-teardown.js
├── my-scroll-block.php    # Main plugin file
├── playwright.config.js   # Playwright configuration
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## Browser Support

This plugin uses modern CSS features including:

- CSS Scroll Timelines
- View Timeline
- Animation Timeline

Check [Can I Use](https://caniuse.com/?search=scroll-timeline) for current browser support.

## Accessibility

This plugin respects the `prefers-reduced-motion` system preference. When a user has reduced motion enabled in their operating system settings, all scroll animations are automatically disabled.

For more details, see [Reduced Motion Support Documentation](docs/REDUCED-MOTION.md).

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Format code: `npm run format`
6. Submit a pull request

## Continuous Integration

The project uses GitHub Actions for CI:

- Runs on every push and pull request
- Tests with Chromium only
- Uploads test reports on failure

## License

GPL-2.0-or-later

## Credits

Built with:

- [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts)
- [Playwright](https://playwright.dev/)
- [WordPress Playground](https://github.com/WordPress/wordpress-playground)

## Support

For issues and questions:

- Check the [tests/README.md](tests/README.md) for testing documentation
- Review existing GitHub issues
- Create a new issue with detailed information

## Changelog

### 0.1.0

- Initial release
- Support for 8 animation types
- Block editor integration
- CSS scroll timeline animations
- Playwright test coverage

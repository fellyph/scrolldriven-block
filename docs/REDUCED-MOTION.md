# Accessibility: Reduced Motion Support

This plugin respects the user's operating system preference for reduced motion, providing an accessible experience for users who may experience discomfort from animations.

## What is `prefers-reduced-motion`?

The `prefers-reduced-motion` CSS media query detects if the user has requested that the system minimize the amount of non-essential motion it uses. This preference is typically set at the operating system level:

- **macOS**: System Settings > Accessibility > Display > Reduce motion
- **Windows**: Settings > Ease of Access > Display > Show animations
- **iOS/iPadOS**: Settings > Accessibility > Motion > Reduce Motion
- **Android**: Settings > Accessibility > Remove animations

## Implementation

When `prefers-reduced-motion: reduce` is detected, all scroll-driven animations provided by this plugin are completely disabled through CSS. This is achieved via a media query in `src/style.css`:

```css
@media (prefers-reduced-motion: reduce) {
  [data-scroll-anim],
  [data-parallax] {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    clip-path: none !important;
  }
}
```

## Affected Animations

When reduced motion is enabled, the following are disabled:

### Entry Animations

- Fade In
- Slide In (Left, Right, Up, Down)
- Scale Up
- Rotate In
- Blur In
- 3D Rotate In
- Circle Reveal
- Curtain Reveal

### In-and-Out Animations

- Fade In & Out
- Slide Up In & Out
- Scale In & Out
- Rotate In & Out
- 3D Rotate In & Out

### Parallax Effects

- All parallax scrolling effects

## How It Works

1. **CSS-Only Implementation**: The solution uses pure CSS, requiring no JavaScript. This ensures:
   - High performance
   - Reliability (works even if JavaScript is disabled)
   - Immediate response to system preference changes

2. **Complete Disabling**: When reduced motion is enabled, elements with animations:
   - Appear immediately with full opacity (no fading)
   - Display in their final position (no sliding or rotating)
   - Have no blur effects
   - Have no clipping animations
   - Have no parallax movement

3. **Content Remains Accessible**: All content is still visible and accessible; only the motion effects are removed.

## Testing Reduced Motion

To test the reduced motion feature:

1. **Enable reduced motion on your system:**
   - macOS: System Settings > Accessibility > Display > Check "Reduce motion"
   - Windows: Settings > Ease of Access > Display > Turn off "Show animations"

2. **Visit a page with scroll animations**
   - Elements with animations will appear immediately without any motion effects
   - Content remains fully visible and accessible

3. **Automated Testing:**
   - Tests are available in `tests/reduced-motion.spec.ts`
   - Run with: `npm test -- reduced-motion.spec.ts`

## Browser Compatibility

The `prefers-reduced-motion` media query is supported in:

- Chrome 74+
- Firefox 63+
- Safari 10.1+
- Edge 79+

For more information, see: https://caniuse.com/prefers-reduced-motion

## Why This Matters

Animations and motion effects can cause:

- Motion sickness
- Vestibular disorders
- Distraction for users with attention disorders
- General discomfort or annoyance

By respecting the `prefers-reduced-motion` preference, this plugin ensures that all users can have a comfortable experience browsing your site.

## References

- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
- [WCAG 2.1 Success Criterion 2.3.3: Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)

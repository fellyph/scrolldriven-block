# Product Requirements Document (PRD)  
**Feature:** Scroll-Driven Animation Effects for Gutenberg Blocks  
**Author:** [Fellyph Cintra]  
**Date:** [Aug 08th, 2025]  
**Version:** 1.0  

---

## 1. Overview  
The goal is to enable WordPress Gutenberg users to easily apply **scroll-driven animations** to selected block types (Images, Paragraphs, Columns, and Groups) directly from the block’s **Settings Panel**. Animations will trigger as the element scrolls into view, with user-configurable transition type, delay, and duration.  

This will allow content creators to add modern, engaging visual effects without requiring custom CSS or JavaScript knowledge.

---

## 2. Objectives  
- Provide an **intuitive UI** for selecting and configuring animation properties.  
- Support a set of **predefined animation types** inspired by CSS Scroll-Driven Animations (e.g., fade, slide, scale, rotate).  
- Allow customization of:
  - **Transition Type**
  - **Delay** (in ms)
- Ensure **accessibility and performance** best practices.  
- Maintain compatibility with **core Gutenberg block styles**.  

---

## 3. Scope  

### 3.1 Supported Blocks
- Core Image Block
- Core Paragraph Block
- Core Columns Block
- Core Group Block

### 3.2 Supported Animation Types (examples)
- Fade In
- Slide In (left, right, up, down)
- Scale Up / Scale Down
- Rotate In
- Combination (e.g., Fade + Slide)

---

## 4. User Stories  

1. **As a content creator**, I want to select an animation type for the core blocks, image, paragraph, column and group. So that it animates when it scrolls into view.  
2. **As a designer**, I want to configure the delay of the animation to match my site’s visual style.  
3. **As a site owner**, I want to enable animations without affecting performance or accessibility.  

---

## 5. Functional Requirements  

### 5.1 UI Requirements
- Add a **“Scroll Animation”** panel to the Gutenberg core block settings sidebar when a supported blocks, image, paragraph, column and group are selected.
- The panel contains:
  - **Animation Type** (Dropdown: “None”, “Fade In”, “Slide In Left”, “Slide In Right”, “Slide In Up”, “Slide In Down”, “Scale Up”, “Rotate In”, etc.)
  - **Delay** (Number input in milliseconds)

### 5.2 Technical Requirements
- Use CSS `@scroll-timeline` and `animation-timeline` if browser supports it, with JavaScript fallback for compatibility.
- Apply animation styles **only** when the block is in the viewport.
- Store animation settings in the block’s attributes.
- Add generated CSS classes and inline styles during block rendering (both editor and frontend).
- Ensure animations **do not block rendering** or cause layout shifts.

---

## 6. Non-Functional Requirements
- **Performance:** Minimize JavaScript payload; only load when animation is enabled for a block.
- **Accessibility:** Ensure animations respect `prefers-reduced-motion` media query.
- **Browser Support:** Modern browsers (Chrome, Edge, Firefox, Safari). Graceful degradation for unsupported browsers.

---

## 7. Example Attribute Schema  
```json
{
  "animationType": {
    "type": "string",
    "default": "none"
  },
  "animationDelay": {
    "type": "number",
    "default": 0
  }
}
```

## 8. Example CSS/JS Implementation Outline

### 8.1 CSS Example
```css

 @property --anim-displacement {
    syntax: '<length>';
    inherits: false;
    initial-value: 20px;
 }

 @property --anim-delay {
    syntax: '<time>';
    inherits: false;
    initial-value: 0ms;
 }

.scroll-anim-fade-in {
  animation: scrollFadeIn ease-out var(--anim-delay) both;
  animation-timeline: view();
  animation-range: entry 0% cover 70%;
}

@keyframes scrollSlideInLeft {
  from {
    opacity: 0;
    transform: translateX(calc(-1 * var(--anim-displacement)));
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 8.2 JavaScript Example (Fallback)

```js
// Example fallback with IntersectionObserver
const animatedBlocks = document.querySelectorAll('[data-scroll-anim]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
    }
  });
});
animatedBlocks.forEach(block => observer.observe(block));
```

### 9. Acceptance Criteria

The user can select an animation type and delay in the sidebar for supported blocks.

Animation plays once when the block enters the viewport.

Animation respects prefers-reduced-motion.

No console errors in the editor or frontend.
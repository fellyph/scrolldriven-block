/**
 * Frontend behavior: IntersectionObserver fallback for scroll-driven animations.
 */
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  var animatedNodes = Array.prototype.slice.call(
    document.querySelectorAll("[data-scroll-anim]")
  );

  if (animatedNodes.length === 0) {
    return;
  }

  // If user prefers reduced motion, skip animations and show content.
  if (prefersReducedMotion) {
    animatedNodes.forEach(function (node) {
      node.classList.add("is-animated");
    });
    return;
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            el.classList.add("is-animated");
            observer.unobserve(el);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.1,
      }
    );

    animatedNodes.forEach(function (node) {
      observer.observe(node);
    });
  } else {
    // No observer support: show immediately to avoid hidden content.
    animatedNodes.forEach(function (node) {
      node.classList.add("is-animated");
    });
  }
})();

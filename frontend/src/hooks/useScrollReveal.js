import { useEffect } from 'react';

/**
 * useScrollReveal
 * Observes every element with class "reveal" inside the container
 * and adds "revealed" when it enters the viewport.
 *
 * Usage: call once in App.jsx — it covers the whole page.
 */
export default function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Unobserve after reveal so it only animates once
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -48px 0px',
      }
    );

    // Observe all .reveal elements currently in the DOM
    const observe = () => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
        observer.observe(el);
      });
    };

    observe();

    // Re-run after route changes (slight delay so new DOM is rendered)
    const timeout = setInterval(observe, 400);
    return () => {
      observer.disconnect();
      clearInterval(timeout);
    };
  }, []);
}

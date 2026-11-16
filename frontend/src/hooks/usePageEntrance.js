import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * usePageEntrance
 * Coordinated GSAP entrance hook for subtle staggered vertical reveals.
 * Features:
 * - Scoped lifecycle via gsap.context with full revert cleanup
 * - Prevents duplicate animation runs during component re-renders
 * - clearProps: 'transform' on complete to avoid style conflicts with Framer Motion
 * - Mutation-aware for pages that mount in initial loading states
 * - Fully respects prefers-reduced-motion
 */
export const usePageEntrance = (dependencyArray = []) => {
  const containerRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || !containerRef.current) return;

    const container = containerRef.current;
    let ctx = null;

    const triggerAnimation = () => {
      if (!container) return false;
      const targets = container.querySelectorAll('.gsap-reveal');
      if (!targets || targets.length === 0) return false;

      ctx = gsap.context(() => {
        gsap.fromTo(
          targets,
          { y: 8 },
          {
            y: 0,
            duration: 0.35,
            stagger: 0.04,
            ease: 'power2.out',
            clearProps: 'transform',
          }
        );
      }, container);

      return true;
    };

    // If already animated in this lifecycle, do not re-trigger
    if (hasAnimatedRef.current) {
      return () => {
        if (ctx) ctx.revert();
      };
    }

    const animated = triggerAnimation();
    if (animated) {
      hasAnimatedRef.current = true;
    } else {
      // If targets were not yet present (e.g., page mounted in loading state),
      // observe DOM until targets appear, animate once, then disconnect.
      const observer = new MutationObserver(() => {
        if (!hasAnimatedRef.current && triggerAnimation()) {
          hasAnimatedRef.current = true;
          observer.disconnect();
        }
      });
      observer.observe(container, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        if (ctx) ctx.revert();
      };
    }

    return () => {
      if (ctx) ctx.revert();
    };
  }, dependencyArray);

  return containerRef;
};

export default usePageEntrance;

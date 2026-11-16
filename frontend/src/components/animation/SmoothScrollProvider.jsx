import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScrollProvider
 * Implements Lenis inertial smooth scrolling across the viewport.
 * Automatically respects prefers-reduced-motion and isolates nested scrollable areas
 * (tables, modals, dropdown menus) via data-lenis-prevent and selector boundaries.
 */
export const SmoothScrollProvider = ({ children }) => {
  const lenisRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  });

  // Track system reduced-motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  useEffect(() => {
    // If user prefers reduced motion, do not initialize smooth scrolling
    if (reducedMotion) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      prevent: (node) => {
        // Prevent Lenis hijacking on nested scrollable elements, tables, and dialog modals
        if (!node) return false;
        return (
          node.hasAttribute('data-lenis-prevent') ||
          node.closest?.('[data-lenis-prevent]') !== null ||
          node.tagName === 'TABLE' ||
          node.closest?.('table') !== null ||
          node.closest?.('[role="dialog"]') !== null ||
          node.closest?.('.scrollable-nested') !== null ||
          (node.classList && node.classList.contains('scrollable-nested'))
        );
      },
    });

    lenisRef.current = lenis;

    let animationFrameId;
    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  return <>{children}</>;
};

export default SmoothScrollProvider;

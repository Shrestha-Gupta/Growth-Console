import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS; // ~33.33ms

/**
 * AuthVisual
 * Purposeful Three.js royal centerpiece for the authentication split layout.
 * Renders a slow-rotating geometric polyhedron in antique gold over warm charcoal.
 * Optimized for performance: 30 FPS cap, mobile bypass, reduced-motion single-render,
 * and comprehensive WebGL context disposal.
 */
export const AuthVisual = () => {
  const mountRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);

  // Monitor viewport size to disable WebGL on mobile devices (< 1024px)
  useEffect(() => {
    const handleViewportChange = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleViewportChange, { passive: true });
    return () => window.removeEventListener('resize', handleViewportChange);
  }, []);

  useEffect(() => {
    // If viewport is mobile/tablet, do not initialize WebGL canvas
    if (isMobile) return;

    const container = mountRef.current;
    if (!container) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 600;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1C1B1A'); // Warm Charcoal

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.8;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    // 3. Geometry & Materials (Antique Gold Wireframe & Core)
    const geometry = new THREE.IcosahedronGeometry(1.4, 1);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xC5A059, // Antique Gold
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMat);
    scene.add(wireframeMesh);

    // Inner subtle core
    const innerGeometry = new THREE.IcosahedronGeometry(1.36, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x2E2A22, // Deep burnished bronze tone
      transparent: true,
      opacity: 0.4,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMat);
    scene.add(innerMesh);

    // Geometric ring / celestial orbit
    const ringGeometry = new THREE.RingGeometry(2.1, 2.13, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xDFD0B5, // Pale Champagne
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    scene.add(ringMesh);

    // Parallax mouse interaction (active only when reduced motion is false)
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 0.5;
      mouseY = y * 0.5;
    };

    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Animation Loop with 30 FPS Cap
    let animationFrameId;
    let lastRenderTime = 0;
    let clock = new THREE.Clock();

    const renderSingleFrame = () => {
      renderer.render(scene, camera);
    };

    const animate = (timestamp) => {
      animationFrameId = requestAnimationFrame(animate);

      // Enforce 30 FPS cap to reduce GPU/CPU consumption
      const elapsed = timestamp - lastRenderTime;
      if (elapsed < FRAME_INTERVAL) return;
      lastRenderTime = timestamp - (elapsed % FRAME_INTERVAL);

      const elapsedTime = clock.getElapsedTime();
      wireframeMesh.rotation.y = elapsedTime * 0.18;
      wireframeMesh.rotation.x = elapsedTime * 0.12;
      innerMesh.rotation.y = elapsedTime * 0.18;
      innerMesh.rotation.x = elapsedTime * 0.12;
      ringMesh.rotation.z = elapsedTime * 0.08;

      // Smooth mouse tilt
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    // If reduced motion is preferred, render one static frame and avoid starting animation loop
    if (prefersReducedMotion) {
      renderSingleFrame();
    } else {
      animationFrameId = requestAnimationFrame(animate);
    }

    // Dynamic listener for reduced motion system toggle
    const handleMotionChange = (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        renderSingleFrame();
      } else {
        lastRenderTime = performance.now();
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (prefersReducedMotion) renderSingleFrame();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Cleanup & WebGL Disposal
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      geometry.dispose();
      innerGeometry.dispose();
      ringGeometry.dispose();
      wireframeMat.dispose();
      innerMat.dispose();
      ringMat.dispose();

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [isMobile]);

  if (isMobile) {
    return null;
  }

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
};

export default AuthVisual;

"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ImpactEngine3DProps {
  currentStage?: number;
  onStageChange?: (stage: number) => void;
  className?: string;
  height?: string | number;
}

export const STAGES = [
  {
    name: "IDEA",
    num: "01",
    subtitle: "Raw Concept & Need",
    desc: "Dispersed market signals, manual bottlenecks, and visionary goals.",
    color: "#6366F1",
  },
  {
    name: "INTELLIGENCE",
    num: "02",
    subtitle: "AI Architecture",
    desc: "Neural reasoning models, custom embeddings, and algorithmic decisioning.",
    color: "#3B38F5",
  },
  {
    name: "AUTOMATION",
    num: "03",
    subtitle: "Autonomous Workflows",
    desc: "Self-orchestrating event loops, tool execution, and zero-drag pipelines.",
    color: "#0D9488",
  },
  {
    name: "PRODUCT",
    num: "04",
    subtitle: "Engineered Platform",
    desc: "Production Next.js interfaces, secure APIs, and multi-tenant architectures.",
    color: "#4F46E5",
  },
  {
    name: "IMPACT",
    num: "05",
    subtitle: "Measurable Value",
    desc: "Accelerated revenue, 24/7 uptime, lower overhead, and competitive moat.",
    color: "#F59E0B",
  },
];

export const ImpactEngine3D: React.FC<ImpactEngine3DProps> = ({
  currentStage = 0,
  onStageChange,
  className = "",
  height,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(currentStage);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Sync prop changes
  useEffect(() => {
    setActiveStage(currentStage);
  }, [currentStage]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const getDimensions = () => {
      const w = container.clientWidth || 360;
      let h = container.clientHeight;
      if (!h || h === 0) {
        if (typeof height === "number") h = height;
        else if (typeof height === "string") h = parseInt(height, 10);
        else h = w < 480 ? 280 : w < 768 ? 340 : 440;
      }
      return { w, h };
    };

    const { w: initialW, h: initialH } = getDimensions();

    const camera = new THREE.PerspectiveCamera(45, initialW / initialH, 0.1, 1000);

    // Responsive camera Z distance so rings and satellites never clip on narrow phones
    const getCameraZ = (width: number) => {
      if (width < 360) return 10.2;
      if (width < 420) return 9.6;
      if (width < 640) return 8.8;
      if (width < 1024) return 7.8;
      return 7.2;
    };

    camera.position.set(0, 0, getCameraZ(initialW));

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(initialW, initialH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x6366f1, 1.4);
    fillLight.position.set(-5, -3, -2);
    scene.add(fillLight);

    const goldPointLight = new THREE.PointLight(0xf59e0b, 2.8, 14);
    goldPointLight.position.set(2, -2, 3);
    scene.add(goldPointLight);

    const indigoPointLight = new THREE.PointLight(0x3b38f5, 3.2, 16);
    indigoPointLight.position.set(-2, 3, 2);
    scene.add(indigoPointLight);

    // --- Main Sculpture Group ---
    const engineGroup = new THREE.Group();
    scene.add(engineGroup);

    // 1. Central Core: Dynamic Icosahedron Prism (Idea & Intelligence Core)
    const coreGeometry = new THREE.IcosahedronGeometry(1.35, 1);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x3b38f5,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.4,
      metalness: 0.25,
      roughness: 0.15,
      transmission: 0.65, // Translucent frosted glass look
      thickness: 1.2,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    engineGroup.add(coreMesh);

    // Wireframe Cage for the Core
    const wireGeometry = new THREE.IcosahedronGeometry(1.38, 1);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    engineGroup.add(wireMesh);

    // 2. Inner Glowing Energy Sphere (The "Impact Spark")
    const innerGeometry = new THREE.SphereGeometry(0.55, 32, 32);
    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.8,
      roughness: 0.1,
      metalness: 0.8,
    });
    const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
    engineGroup.add(innerSphere);

    // 3. Orbital Automation Rings (Toruses representing pipelines & workflows)
    const ring1Geo = new THREE.TorusGeometry(2.1, 0.04, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.85,
      roughness: 0.2,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    engineGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.45, 0.035, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      metalness: 0.9,
      roughness: 0.15,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 4;
    engineGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(2.8, 0.03, 16, 100);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.1,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 2.5;
    engineGroup.add(ring3);

    // 4. Satellite Modules (Floating rounded nodes representing Products & Tools)
    const satelliteGroup = new THREE.Group();
    engineGroup.add(satelliteGroup);

    const satellites: THREE.Mesh[] = [];
    const satCount = 6;
    const satGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);

    for (let i = 0; i < satCount; i++) {
      const angle = (i / satCount) * Math.PI * 2;
      const radius = 2.1;
      const satMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x3b38f5 : 0xf59e0b,
        metalness: 0.8,
        roughness: 0.2,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 0.5,
        Math.sin(angle) * radius
      );
      satMesh.rotation.x = Math.random() * Math.PI;
      satMesh.rotation.y = Math.random() * Math.PI;
      satelliteGroup.add(satMesh);
      satellites.push(satMesh);
    }

    // 5. Ambient Cloud Particles (Data stream / ideas converging)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = 2.5 + Math.random() * 2.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x6366f1,
      size: 0.05,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    engineGroup.add(particles);

    // --- Interactive Pointer & Touch Tracking ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Desktop Mouse Move
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.55;
      targetY = y * 0.45;
      setHasInteracted(true);
    };

    container.addEventListener("mousemove", handleMouseMove);

    // Mobile Touch Handling (Drag to rotate 360°)
    let isTouching = false;
    let lastTouchX = 0;
    let lastTouchY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isTouching = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        setHasInteracted(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouchX;
      const deltaY = touch.clientY - lastTouchY;
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;

      // Rotate target proportionally to touch swipe
      targetX += deltaX * 0.008;
      targetY += deltaY * 0.006;
      targetY = Math.max(-0.6, Math.min(0.6, targetY));
    };

    const handleTouchEnd = () => {
      isTouching = false;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    // --- Responsive Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const { w, h } = getDimensions();
      camera.aspect = w / h;
      camera.position.z = getCameraZ(w);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Also observe container size with ResizeObserver for responsive layout shifts
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }

    // --- Intersection Observer (Pause WebGL when offscreen to save mobile battery) ---
    let isVisible = true;
    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(container);
    }

    // --- Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Skip render calculations if off-screen to preserve battery & CPU
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse/touch damping
      mouseX += (targetX - mouseX) * 0.06;
      mouseY += (targetY - mouseY) * 0.06;

      // Group rotation (continuous idle spin + user drag/tilt)
      engineGroup.rotation.y = elapsedTime * 0.22 + mouseX;
      engineGroup.rotation.x = mouseY + Math.sin(elapsedTime * 0.4) * 0.05;

      // Core pulsing
      const pulse = Math.sin(elapsedTime * 2.0) * 0.06 + 1.0;
      innerSphere.scale.set(pulse, pulse, pulse);

      // Rings differential rotations
      ring1.rotation.z = elapsedTime * 0.35;
      ring2.rotation.x = elapsedTime * -0.28;
      ring3.rotation.y = elapsedTime * 0.42;

      // Satellites orbiting
      satellites.forEach((sat, idx) => {
        sat.rotation.x += 0.015;
        sat.rotation.y += 0.02;
        sat.position.y += Math.sin(elapsedTime * 2 + idx) * 0.002;
      });

      // Stage-specific visual modulations
      if (activeStage === 0) {
        // Idea: softer, floating particles
        particleMat.opacity = 0.85;
        coreMaterial.color.setHex(0x6366f1);
        innerMaterial.emissiveIntensity = 1.2;
      } else if (activeStage === 1) {
        // Intelligence: intense indigo neural core
        coreMaterial.color.setHex(0x3b38f5);
        coreMaterial.emissiveIntensity = 0.8;
        innerMaterial.emissiveIntensity = 2.0;
      } else if (activeStage === 2) {
        // Automation: Teal ring flow
        ring2Mat.color.setHex(0x14b8a6);
        ring1.rotation.z += 0.01;
        ring2.rotation.x -= 0.01;
      } else if (activeStage === 3) {
        // Product: high-finish metallic & glass
        coreMaterial.metalness = 0.5;
        coreMaterial.roughness = 0.1;
      } else if (activeStage === 4) {
        // Impact: radiant warm gold & indigo burst
        coreMaterial.emissive.setHex(0xf59e0b);
        coreMaterial.emissiveIntensity = 0.7;
        innerMaterial.emissiveIntensity = 3.2;
        goldPointLight.intensity = 4.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);

      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      coreGeometry.dispose();
      coreMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      satGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [activeStage, height]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/95 to-brand-surface/80 border border-brand-border/90 shadow-xl sm:shadow-2xl backdrop-blur-md overflow-hidden ${className}`}
    >
      {/* Top Header Badge (Responsive on Mobile) */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-5 right-3 sm:right-5 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-brand-accent animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider text-brand-dark">
            THE IMPACT ENGINE™
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/90 border border-brand-border text-[9px] sm:text-[10px] font-mono font-bold text-brand-muted shadow-xs">
          <span>WebGL 3D</span>
          <span className="text-brand-accent font-bold">• 60 FPS</span>
        </div>
      </div>

      {/* 3D WebGL Canvas Mount Container (Responsive Height) */}
      <div
        ref={mountRef}
        style={height ? { height } : undefined}
        className="w-full relative cursor-grab active:cursor-grabbing flex items-center justify-center h-[280px] xs:h-[320px] sm:h-[370px] md:h-[410px] lg:h-[440px] touch-none"
      >
        {/* Mobile Swipe Hint Badge (Fades once touched) */}
        {!hasInteracted && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none sm:hidden flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-[9px] text-white font-mono shadow-xs animate-bounce">
            <span>👆 Swipe to rotate 3D</span>
          </div>
        )}
      </div>

      {/* Interactive Transformation Lifecycle Stage Bar (Mobile Responsive Grid) */}
      <div className="relative z-20 w-full px-2.5 sm:px-4 pb-3 sm:pb-4 pt-2 bg-white/95 backdrop-blur-md border-t border-brand-border/70">
        <div className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-brand-subtle mb-1.5 sm:mb-2 text-center">
          Interactive Transformation Lifecycle
        </div>

        {/* 5 Stages Pills (Tight mobile spacing, zero overflow) */}
        <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
          {STAGES.map((s, idx) => {
            const isActive = activeStage === idx;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => {
                  setActiveStage(idx);
                  onStageChange?.(idx);
                }}
                className={`py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? "bg-brand-accent text-white shadow-md font-extrabold scale-[1.02] sm:scale-[1.03]"
                    : "bg-brand-surface hover:bg-brand-surfaceAlt text-brand-charcoal hover:text-brand-dark"
                }`}
              >
                <span className="text-[8px] sm:text-[9px] font-mono tracking-tighter opacity-80">
                  {s.num}
                </span>
                <span className="text-[9px] xs:text-[10px] sm:text-[11px] tracking-tight font-black leading-tight truncate w-full text-center">
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Details Banner (Clean stack on mobile) */}
        <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 rounded-xl bg-brand-surface border border-brand-border/80 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 sm:gap-3">
          <div className="text-left flex-1 min-w-0">
            <div className="text-xs font-black text-brand-dark flex items-center gap-1.5">
              <span className="text-brand-accent font-mono">
                {STAGES[activeStage].num}.
              </span>
              <span className="truncate">{STAGES[activeStage].subtitle}</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-brand-muted leading-snug mt-0.5 line-clamp-2 xs:line-clamp-1">
              {STAGES[activeStage].desc}
            </p>
          </div>
          <div className="flex-shrink-0 self-end xs:self-center">
            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-brand-accent px-2 py-0.5 sm:py-1 rounded bg-brand-accentSoft">
              Stage {activeStage + 1} of 5
            </span>
          </div>
        </div>
      </div>

      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-40" />
    </div>
  );
};

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
  height = "480px",
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(currentStage);

  // Sync prop changes
  useEffect(() => {
    setActiveStage(currentStage);
  }, [currentStage]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || 500;
    const canvasHeight = typeof height === "number" ? height : parseInt(height, 10) || 480;

    const camera = new THREE.PerspectiveCamera(45, width / canvasHeight, 0.1, 1000);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, canvasHeight);
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
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = 2.6 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x6366f1,
      size: 0.055,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    engineGroup.add(particles);

    // --- Mouse Tracking with Smooth Damping ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.45;
      targetY = y * 0.45;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // --- Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Group rotation (responds to mouse + idle continuous spin)
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
      container.removeEventListener("mousemove", handleMouseMove);

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
      className={`relative flex flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-white/95 to-brand-surface/80 border border-brand-border/90 shadow-2xl backdrop-blur-md overflow-hidden ${className}`}
    >
      {/* Top Header Badge */}
      <div className="absolute top-4 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse" />
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-brand-dark">
            THE IMPACT ENGINE™
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-brand-border text-[10px] font-mono font-bold text-brand-muted shadow-xs">
          <span>WebGL 3D Core</span>
          <span className="text-brand-accent font-bold">• 60 FPS</span>
        </div>
      </div>

      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={mountRef}
        style={{ height }}
        className="w-full relative cursor-grab active:cursor-grabbing flex items-center justify-center"
      />

      {/* Interactive Transformation Lifecycle Stage Bar */}
      <div className="relative z-20 w-full px-4 pb-4 pt-2 bg-white/90 backdrop-blur-md border-t border-brand-border/70">
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-subtle mb-2 text-center">
          Interactive Transformation Lifecycle
        </div>

        {/* 5 Stages Pills */}
        <div className="grid grid-cols-5 gap-1.5">
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
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? "bg-brand-accent text-white shadow-md font-extrabold scale-[1.03]"
                    : "bg-brand-surface hover:bg-brand-surfaceAlt text-brand-charcoal hover:text-brand-dark"
                }`}
              >
                <span className="text-[9px] font-mono tracking-tighter opacity-80">
                  {s.num}
                </span>
                <span className="text-[11px] tracking-tight font-black leading-tight">
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Details Banner */}
        <div className="mt-3 p-3 rounded-xl bg-brand-surface border border-brand-border/80 flex items-center justify-between gap-3">
          <div className="text-left">
            <div className="text-xs font-black text-brand-dark flex items-center gap-2">
              <span className="text-brand-accent font-mono">
                {STAGES[activeStage].num}.
              </span>
              <span>{STAGES[activeStage].subtitle}</span>
            </div>
            <p className="text-[11px] text-brand-muted leading-snug mt-0.5 line-clamp-1">
              {STAGES[activeStage].desc}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <span className="text-[10px] font-mono font-bold text-brand-accent px-2 py-1 rounded bg-brand-accentSoft">
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

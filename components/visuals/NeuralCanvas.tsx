'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  baseRadius: number;
  color: string;
  pulsePhase: number;
}

export const NeuralCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Color palette matching IMPACT's bright system
    const colors = [
      'rgba(59, 56, 245, 0.75)',   // Electric Indigo
      'rgba(99, 102, 241, 0.65)',  // Indigo Soft
      'rgba(245, 158, 11, 0.65)',  // Warm Amber Gold
      'rgba(20, 184, 166, 0.65)',  // Teal Intelligence
      'rgba(14, 165, 233, 0.65)',  // Cyan Data
    ];

    const particleCount = Math.min(Math.floor((width * height) / 14000), 75);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * height * 1.2,
        z: Math.random() * 600 + 200,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        vz: (Math.random() - 0.5) * 0.35,
        baseRadius: Math.random() * 2 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let isHovering = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left - width / 2;
      targetMouseY = e.clientY - rect.top - height / 2;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const fov = 400; // 3D perspective field of view
    let tick = 0;

    const render = () => {
      tick += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation for camera pan
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const halfW = width / 2;
      const halfH = height / 2;

      // Project each particle to 2D
      const projected: { x: number; y: number; scale: number; p: Particle; alpha: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle in 3D
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Boundary bounce / wrap
        if (p.x < -width * 0.7) p.x = width * 0.7;
        if (p.x > width * 0.7) p.x = -width * 0.7;
        if (p.y < -height * 0.7) p.y = height * 0.7;
        if (p.y > height * 0.7) p.y = -height * 0.7;
        if (p.z < 150) p.z = 800;
        if (p.z > 800) p.z = 150;

        // Subtle mouse pull if hovering
        if (isHovering) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist2D = Math.sqrt(dx * dx + dy * dy);
          if (dist2D < 260) {
            p.x += (dx / dist2D) * 0.35;
            p.y += (dy / dist2D) * 0.35;
          }
        }

        // Perspective projection formula
        const scale = fov / (fov + p.z);
        const projX = p.x * scale + halfW;
        const projY = p.y * scale + halfH;
        const alpha = Math.max(0.12, Math.min(0.85, 1 - p.z / 850));

        projected.push({ x: projX, y: projY, scale, p, alpha });
      }

      // Draw 3D Neural Connections
      const connectionDist = 130;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const lineAlpha = (1 - dist / connectionDist) * Math.min(a.alpha, b.alpha) * 0.45;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(59, 56, 245, ${lineAlpha})`;
            ctx.lineWidth = 1 * Math.min(a.scale, b.scale);
            ctx.stroke();

            // Occasionally draw a flowing data pulse packet between connected nodes
            if ((i + j + Math.floor(tick * 3)) % 14 === 0) {
              const progress = (Math.sin(tick * 2 + i) + 1) / 2;
              const packetX = a.x + (b.x - a.x) * progress;
              const packetY = a.y + (b.y - a.y) * progress;
              ctx.beginPath();
              ctx.arc(packetX, packetY, 1.8 * a.scale, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(245, 158, 11, 0.85)'; // glowing amber packet
              ctx.fill();
            }
          }
        }
      }

      // Draw 3D Nodes
      for (let i = 0; i < projected.length; i++) {
        const item = projected[i];
        const pulse = (Math.sin(tick * 3 + item.p.pulsePhase) + 1) / 2;
        const radius = item.p.baseRadius * item.scale * (0.85 + pulse * 0.3);

        // Ambient glow halo
        ctx.beginPath();
        ctx.arc(item.x, item.y, radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = item.p.color.replace(/[\d\.]+\)$/, (item.alpha * 0.25).toFixed(2) + ')');
        ctx.fill();

        // Core bright node
        ctx.beginPath();
        ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = item.p.color;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.88 }}
    />
  );
};

"use client";

import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isActive: boolean;
  state: "idle" | "connecting" | "listening" | "thinking" | "speaking" | "interrupted" | "ended" | "error";
  audioLevel?: number; // 0.0 to 1.0
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  state,
  audioLevel = 0.2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Color scheme based on voice state
      let strokeStyle = "rgba(16, 185, 129, 0.8)"; // emerald for listening
      let glowColor = "rgba(16, 185, 129, 0.4)";
      let speed = 0.06;
      let amplitudeMultiplier = Math.max(0.15, audioLevel);

      if (state === "thinking") {
        strokeStyle = "rgba(245, 158, 11, 0.8)"; // amber
        glowColor = "rgba(245, 158, 11, 0.4)";
        speed = 0.08;
      } else if (state === "speaking") {
        strokeStyle = "rgba(99, 102, 241, 0.9)"; // indigo/purple
        glowColor = "rgba(99, 102, 241, 0.5)";
        speed = 0.1;
        amplitudeMultiplier = Math.max(0.3, audioLevel * 1.5);
      } else if (state === "interrupted") {
        strokeStyle = "rgba(239, 68, 68, 0.8)"; // red
        glowColor = "rgba(239, 68, 68, 0.4)";
        speed = 0.15;
      } else if (!isActive || state === "ended") {
        strokeStyle = "rgba(156, 163, 175, 0.3)";
        glowColor = "transparent";
        speed = 0.01;
        amplitudeMultiplier = 0.05;
      }

      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = glowColor;
      ctx.lineWidth = 3;
      ctx.strokeStyle = strokeStyle;
      ctx.lineCap = "round";

      // Draw 3 layered harmonic waves
      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        const waveOffset = wave * 0.8;
        const waveAmp = (height * 0.35 * amplitudeMultiplier) / (wave + 1);

        for (let x = 0; x < width; x += 4) {
          const progress = x / width;
          // Sine window to pinch ends at edges
          const windowFunc = Math.sin(progress * Math.PI);
          const y =
            centerY +
            Math.sin(progress * 8 + phase + waveOffset) *
              waveAmp *
              windowFunc;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      ctx.restore();

      phase += speed;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, state, audioLevel]);

  return (
    <div className="relative w-full h-32 flex items-center justify-center bg-black/40 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-md">
      <canvas
        ref={canvasRef}
        width={480}
        height={128}
        className="w-full h-full object-cover"
      />
      {/* State label overlay */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] uppercase tracking-widest font-semibold text-gray-300">
        {state === "listening" && "Listening to you..."}
        {state === "thinking" && "AI is thinking..."}
        {state === "speaking" && "IMPACT AI Speaking..."}
        {state === "interrupted" && "Interruption Detected"}
        {state === "connecting" && "Establishing Live Connection..."}
        {state === "idle" && "Ready"}
        {state === "ended" && "Call Ended"}
      </div>
    </div>
  );
};

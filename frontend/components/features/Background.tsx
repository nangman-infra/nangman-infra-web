"use client";

import { useEffect, useRef, useState } from "react";

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSafari, setIsSafari] = useState(false);

  // Detect Safari browser (including iOS Safari and iPad Safari)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const detectSafari = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      // Detect Safari: Safari exists but Chrome/Chromium doesn't, or iOS/iPadOS
      const isSafariBrowser = 
        (/safari/.test(userAgent) && !/chrome/.test(userAgent) && !/chromium/.test(userAgent)) ||
        /iphone|ipad|ipod/.test(userAgent);
      
      setIsSafari(isSafariBrowser);
    };
    
    // Use requestAnimationFrame to defer state update
    requestAnimationFrame(detectSafari);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId: number;
    let time = 0;

    // Harmonious color palette - warm and cool tones blend naturally
    const COLORS = [
      { r: 139, g: 92, b: 246 },   // Soft Purple
      { r: 59, g: 130, b: 246 },   // Soft Blue
      { r: 251, g: 191, b: 36 },   // Warm Amber
      { r: 236, g: 72, b: 153 },   // Soft Pink
      { r: 34, g: 197, b: 94 },    // Soft Green
    ];

    interface WaveRibbon {
      points: Array<{ x: number; y: number }>;
      color: { r: number; g: number; b: number };
      opacity: number;
      speed: number;
      phase: number;
      amplitude: number;
      frequency: number;
    }

    const ribbons: WaveRibbon[] = [];
    const RIBBON_COUNT = 5;
    const POINTS_PER_RIBBON = 50;

    const initRibbons = () => {
      ribbons.length = 0;
      
      for (let i = 0; i < RIBBON_COUNT; i++) {
        const points: Array<{ x: number; y: number }> = [];
        const baseY = (height / (RIBBON_COUNT + 1)) * (i + 1);
        
        for (let j = 0; j <= POINTS_PER_RIBBON; j++) {
          const x = (width / POINTS_PER_RIBBON) * j;
          points.push({ x, y: baseY });
        }
        
        ribbons.push({
          points,
          color: COLORS[i % COLORS.length],
          opacity: 0.25 + Math.random() * 0.15,
          speed: 0.8 + Math.random() * 0.4, // Balanced speed
          phase: Math.random() * Math.PI * 2,
          amplitude: 100 + Math.random() * 150,
          frequency: 0.008 + Math.random() * 0.012,
        });
      }
    };

    const resize = () => {
      width = window.innerWidth || 1920;
      height = window.innerHeight || 1080;
      canvas.width = width;
      canvas.height = height;
      if (width > 0 && height > 0) {
        initRibbons();
      }
    };

    const draw = () => {
      if (!ctx) return;
      
      time += 0.02; // Balanced time increment

      // Deep black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Soft blur for smooth, video-like effect
      // Safari doesn't support ctx.filter properly, so we'll use CSS filter instead
      if (!isSafari) {
        ctx.filter = "blur(80px)";
      }
      ctx.globalCompositeOperation = "screen";

      ribbons.forEach((ribbon, ribbonIndex) => {
        // Update wave points for smooth, flowing motion
        ribbon.points.forEach((point) => {
          const baseY = (height / (RIBBON_COUNT + 1)) * (ribbonIndex + 1);
          const waveOffset = Math.sin(
            point.x * ribbon.frequency + 
            time * ribbon.speed + 
            ribbon.phase
          ) * ribbon.amplitude;
          
          // Add secondary wave for more organic feel
          const secondaryWave = Math.sin(
            point.x * ribbon.frequency * 1.5 + 
            time * ribbon.speed * 0.7 + 
            ribbon.phase
          ) * (ribbon.amplitude * 0.3);
          
          point.y = baseY + waveOffset + secondaryWave;
        });

        // Draw flowing ribbon with gradient
        ctx.beginPath();
        ctx.moveTo(ribbon.points[0].x, ribbon.points[0].y);

        // Create smooth curve through points
        for (let i = 1; i < ribbon.points.length; i++) {
          const prev = ribbon.points[i - 1];
          const curr = ribbon.points[i];
          const next = ribbon.points[Math.min(i + 1, ribbon.points.length - 1)];
          
          const cp1x = (prev.x + curr.x) / 2;
          const cp1y = (prev.y + curr.y) / 2;
          const cp2x = (curr.x + next.x) / 2;
          const cp2y = (curr.y + next.y) / 2;
          
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
        }

        // Create gradient along the ribbon
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        const opacityVariation = Math.sin(time * ribbon.speed + ribbon.phase) * 0.2 + 0.8; // Balanced variation
        const currentOpacity = ribbon.opacity * opacityVariation;
        
        gradient.addColorStop(0, `rgba(${ribbon.color.r}, ${ribbon.color.g}, ${ribbon.color.b}, ${currentOpacity * 0.5})`);
        gradient.addColorStop(0.5, `rgba(${ribbon.color.r}, ${ribbon.color.g}, ${ribbon.color.b}, ${currentOpacity})`);
        gradient.addColorStop(1, `rgba(${ribbon.color.r}, ${ribbon.color.g}, ${ribbon.color.b}, ${currentOpacity * 0.5})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 500; // Thick ribbon for smooth glow
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        
        // Add fill for more visibility
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      if (!isSafari) {
        ctx.filter = "none";
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSafari]);

  return (
    <>
      {/* Base gradient for depth */}
      <div className="absolute inset-0 z-0 bg-linear-to-b from-black via-[#050505] to-black" />
      
      {/* Canvas for flowing ribbons */}
      {/* Apply CSS blur for Safari since ctx.filter doesn't work */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-1 w-full h-full pointer-events-none"
        style={isSafari ? { filter: "blur(80px)" } : undefined}
      />
      
      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 z-2 pointer-events-none opacity-[0.1] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          filter: 'contrast(130%) brightness(100%)',
        }}
      />
      
      {/* Soft radial glow overlay */}
      <div 
        className="absolute inset-0 z-2 pointer-events-none opacity-40 animate-radial-pulse"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 70%)',
        }}
      />
      
      {/* Gentle vignette */}
      <div className="absolute inset-0 z-3 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
    </>
  );
}

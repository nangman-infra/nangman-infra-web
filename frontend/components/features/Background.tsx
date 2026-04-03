"use client";

import { useEffect, useRef, useState } from "react";

interface WavePoint {
  x: number;
  y: number;
}

interface RibbonColor {
  r: number;
  g: number;
  b: number;
}

interface WaveRibbon {
  points: WavePoint[];
  color: RibbonColor;
  opacity: number;
  speed: number;
  phase: number;
  amplitude: number;
  frequency: number;
}

const RIBBON_COLORS: RibbonColor[] = [
  { r: 139, g: 92, b: 246 },
  { r: 59, g: 130, b: 246 },
  { r: 251, g: 191, b: 36 },
  { r: 236, g: 72, b: 153 },
  { r: 34, g: 197, b: 94 },
];
const RIBBON_COUNT = 5;
const POINTS_PER_RIBBON = 50;
const UINT32_MAX = 0xffffffff;

function getRandomUnit(): number {
  const cryptoObject = globalThis.crypto;
  if (!cryptoObject?.getRandomValues) {
    return 0.5;
  }

  const values = new Uint32Array(1);
  cryptoObject.getRandomValues(values);
  return values[0] / UINT32_MAX;
}

function getRandomInRange(min: number, max: number): number {
  return min + getRandomUnit() * (max - min);
}

function detectSafariBrowser(): boolean {
  const userAgent = globalThis.navigator.userAgent.toLowerCase();
  return (
    (/safari/.test(userAgent) &&
      !/chrome/.test(userAgent) &&
      !/chromium/.test(userAgent)) ||
    /iphone|ipad|ipod/.test(userAgent)
  );
}

function createRibbons(width: number, height: number): WaveRibbon[] {
  return Array.from({ length: RIBBON_COUNT }, (_, ribbonIndex) => {
    const baseY = (height / (RIBBON_COUNT + 1)) * (ribbonIndex + 1);
    const points = Array.from(
      { length: POINTS_PER_RIBBON + 1 },
      (_, pointIndex) => ({
        x: (width / POINTS_PER_RIBBON) * pointIndex,
        y: baseY,
      }),
    );

    return {
      points,
      color: RIBBON_COLORS[ribbonIndex % RIBBON_COLORS.length],
      opacity: getRandomInRange(0.25, 0.4),
      speed: getRandomInRange(0.8, 1.2),
      phase: getRandomInRange(0, Math.PI * 2),
      amplitude: getRandomInRange(100, 250),
      frequency: getRandomInRange(0.008, 0.02),
    };
  });
}

function updateRibbonPoints(
  ribbon: WaveRibbon,
  ribbonIndex: number,
  height: number,
  time: number,
): void {
  const baseY = (height / (RIBBON_COUNT + 1)) * (ribbonIndex + 1);

  for (const point of ribbon.points) {
    const waveOffset = Math.sin(
      point.x * ribbon.frequency + time * ribbon.speed + ribbon.phase,
    ) * ribbon.amplitude;
    const secondaryWave = Math.sin(
      point.x * ribbon.frequency * 1.5 + time * ribbon.speed * 0.7 + ribbon.phase,
    ) * (ribbon.amplitude * 0.3);

    point.y = baseY + waveOffset + secondaryWave;
  }
}

function drawRibbon(
  ctx: CanvasRenderingContext2D,
  ribbon: WaveRibbon,
  width: number,
  height: number,
  time: number,
): void {
  ctx.beginPath();
  ctx.moveTo(ribbon.points[0].x, ribbon.points[0].y);

  for (let index = 1; index < ribbon.points.length; index += 1) {
    const previous = ribbon.points[index - 1];
    const current = ribbon.points[index];
    const next = ribbon.points[Math.min(index + 1, ribbon.points.length - 1)];

    const controlPoint1X = (previous.x + current.x) / 2;
    const controlPoint1Y = (previous.y + current.y) / 2;
    const controlPoint2X = (current.x + next.x) / 2;
    const controlPoint2Y = (current.y + next.y) / 2;

    ctx.bezierCurveTo(
      controlPoint1X,
      controlPoint1Y,
      controlPoint2X,
      controlPoint2Y,
      current.x,
      current.y,
    );
  }

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const opacityVariation = Math.sin(time * ribbon.speed + ribbon.phase) * 0.2 + 0.8;
  const currentOpacity = ribbon.opacity * opacityVariation;

  gradient.addColorStop(
    0,
    `rgba(${ribbon.color.r}, ${ribbon.color.g}, ${ribbon.color.b}, ${currentOpacity * 0.5})`,
  );
  gradient.addColorStop(
    0.5,
    `rgba(${ribbon.color.r}, ${ribbon.color.g}, ${ribbon.color.b}, ${currentOpacity})`,
  );
  gradient.addColorStop(
    1,
    `rgba(${ribbon.color.r}, ${ribbon.color.g}, ${ribbon.color.b}, ${currentOpacity * 0.5})`,
  );

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 500;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.fillStyle = gradient;
  ctx.fill();
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    if (globalThis.window === undefined) {
      return;
    }

    const frameId = globalThis.requestAnimationFrame(() => {
      setIsSafari(detectSafariBrowser());
    });

    return () => {
      globalThis.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let width = 0;
    let height = 0;
    let animationFrameId = 0;
    let time = 0;
    let ribbons: WaveRibbon[] = [];

    const resize = () => {
      width = globalThis.innerWidth || 1920;
      height = globalThis.innerHeight || 1080;
      canvas.width = width;
      canvas.height = height;
      ribbons = width > 0 && height > 0 ? createRibbons(width, height) : [];
    };

    const draw = () => {
      time += 0.02;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      if (!isSafari) {
        ctx.filter = "blur(80px)";
      }
      ctx.globalCompositeOperation = "screen";

      ribbons.forEach((ribbon, ribbonIndex) => {
        updateRibbonPoints(ribbon, ribbonIndex, height, time);
        drawRibbon(ctx, ribbon, width, height, time);
      });

      ctx.globalCompositeOperation = "source-over";
      if (!isSafari) {
        ctx.filter = "none";
      }

      animationFrameId = globalThis.requestAnimationFrame(draw);
    };

    resize();
    globalThis.addEventListener("resize", resize);
    animationFrameId = globalThis.requestAnimationFrame(draw);

    return () => {
      globalThis.removeEventListener("resize", resize);
      globalThis.cancelAnimationFrame(animationFrameId);
    };
  }, [isSafari]);

  return (
    <>
      <div className="absolute inset-0 z-0 bg-linear-to-b from-black via-[#050505] to-black" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-1 w-full h-full pointer-events-none"
        style={isSafari ? { filter: "blur(80px)" } : undefined}
      />
      <div
        className="absolute inset-0 z-2 pointer-events-none opacity-[0.1] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          filter: "contrast(130%) brightness(100%)",
        }}
      />
      <div
        className="absolute inset-0 z-2 pointer-events-none opacity-40 animate-radial-pulse"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 z-3 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
    </>
  );
}

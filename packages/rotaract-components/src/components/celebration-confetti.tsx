"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type CelebrationConfettiProps = {
  active: boolean;
  onComplete: () => void;
};

type ParticleShape = "rect" | "circle" | "ribbon";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  tilt: number;
  tiltSpeed: number;
  shape: ParticleShape;
  drift: number;
};

const COLORS = [
  "#FF2D7A",
  "#E81B6A",
  "#FBBF24",
  "#34D399",
  "#60A5FA",
  "#A78BFA",
  "#FB923C",
  "#F472B6",
  "#F9FAFB",
];

const GRAVITY = 0.14;
const DRAG = 0.992;
const DURATION_MS = 3200;
const FADE_MS = 500;

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function createParticle(
  x: number,
  y: number,
  angle: number,
  speed: number
): Particle {
  const shape = pick<ParticleShape>(["rect", "rect", "rect", "ribbon", "circle"]);
  const size = random(6, 12);

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    width: shape === "ribbon" ? size * random(1.8, 2.8) : size,
    height: shape === "circle" ? size : size * random(0.35, 0.7),
    color: pick(COLORS),
    rotation: random(0, Math.PI * 2),
    rotationSpeed: random(-0.18, 0.18),
    tilt: random(0, Math.PI * 2),
    tiltSpeed: random(0.08, 0.18),
    shape,
    drift: random(-0.35, 0.35),
  };
}

function spawnCannons(width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  const count = 70;
  const origins = [
    { x: 24, y: height * 0.72, base: -Math.PI / 3.1 },
    { x: width - 24, y: height * 0.72, base: -Math.PI + Math.PI / 3.1 },
  ];

  for (const origin of origins) {
    for (let i = 0; i < count; i += 1) {
      particles.push(
        createParticle(
          origin.x + random(-8, 8),
          origin.y + random(-8, 8),
          origin.base + random(-0.42, 0.42),
          random(11, 21)
        )
      );
    }
  }

  return particles;
}

function spawnRain(width: number): Particle[] {
  const particles: Particle[] = [];
  const count = 28;

  for (let i = 0; i < count; i += 1) {
    particles.push(
      createParticle(
        random(0, width),
        random(-80, -12),
        random(Math.PI * 0.35, Math.PI * 0.65),
        random(2, 7)
      )
    );
  }

  return particles;
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle) {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);
  ctx.scale(1, Math.cos(particle.tilt));
  ctx.fillStyle = particle.color;

  if (particle.shape === "circle") {
    ctx.beginPath();
    ctx.arc(0, 0, particle.width / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(
      -particle.width / 2,
      -particle.height / 2,
      particle.width,
      particle.height
    );
  }

  ctx.restore();
}

export function CelebrationConfetti({
  active,
  onComplete,
}: CelebrationConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) return;

    const canvas: any = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onCompleteRef.current();
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      onCompleteRef.current();
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;
    let stopped = false;
    let lastRainAt = 0;
    let extraBurst = false;
    const startedAt = performance.now();
    const particles: Particle[] = spawnCannons(width, height);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    function tick(now: number) {
      if (stopped) return;

      const elapsed = now - startedAt;
      context.clearRect(0, 0, width, height);

      if (!extraBurst && elapsed > 160) {
        extraBurst = true;
        particles.push(...spawnCannons(width, height));
      }

      if (elapsed < 800 && now - lastRainAt > 90) {
        lastRainAt = now;
        particles.push(...spawnRain(width));
      }

      const fade =
        elapsed > DURATION_MS
          ? Math.max(0, 1 - (elapsed - DURATION_MS) / FADE_MS)
          : 1;

      context.globalAlpha = fade;

      for (const particle of particles) {
        particle.vy += GRAVITY;
        particle.vx += particle.drift * 0.04;
        particle.vx *= DRAG;
        particle.vy *= DRAG;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        particle.tilt += particle.tiltSpeed;
        drawParticle(context, particle);
      }

      if (elapsed >= DURATION_MS + FADE_MS) {
        context.clearRect(0, 0, width, height);
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(frame);
        onCompleteRef.current();
        return;
      }

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  if (!active || typeof document === "undefined") return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[200] h-dvh w-dvw"
      aria-hidden
    />,
    document.body
  );
}

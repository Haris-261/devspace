'use client';

import { useEffect, useRef } from 'react';

type ParticlesProps = { className?: string;[key: string]: unknown };

export default function Particles({ className = '' }: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = reduced ? 400 : innerWidth < 700 ? 800 : 1200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < positions.length; i++)positions[i] = (Math.random() - .5) * 100;

    const sprite = document.createElement('canvas');
    sprite.width = 32;
    sprite.height = 32;
    const sctx = sprite.getContext('2d');
    if (sctx) {
      const g = sctx.createRadialGradient(16, 16, 0, 16, 16, 14);
      g.addColorStop(0, 'rgba(255,255,255,.85)');
      g.addColorStop(.45, 'rgba(255,255,255,.28)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.fillStyle = g;
      sctx.beginPath();
      sctx.arc(16, 16, 14, 0, Math.PI * 2);
      sctx.fill();
    }

    let width = 1, height = 1, dpr = 1, raf = 0;
    let rotX = 0, rotY = 0, mouseX = 0, mouseY = 0, halfX = innerWidth / 2, halfY = innerHeight / 2;
    const fov = 75 * Math.PI / 180;
    const cameraZ = 20;
    const starSize = .1;

    const resize = () => {
      width = innerWidth;
      height = innerHeight;
      halfX = width / 2;
      halfY = height / 2;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const move = (event: PointerEvent) => {
      mouseX = (event.clientX - halfX) * .00006;
      mouseY = (event.clientY - halfY) * .00006;
    };
    const leave = () => { mouseX = 0; mouseY = 0 };

    let isRunning = false;
    const draw = () => {
      const loaded = !document.body.classList.contains('is-loading');
      if (!reduced) {
        rotY += .00004 + mouseX * .28;
        rotX += .00002 + mouseY * .28;
      }
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const focal = height / 2 / Math.tan(fov / 2);

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = loaded ? .5 : .28;

      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        if (loaded && !reduced) {
          positions[ix + 1] += .018;
          if (positions[ix + 1] > 50) positions[ix + 1] = -50;
        }
        const x = positions[ix], y = positions[ix + 1], z = positions[ix + 2];
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        const depth = cameraZ - z2;
        if (depth <= .2) continue;
        const px = halfX + (x1 * focal) / depth;
        const py = halfY - (y1 * focal) / depth;
        const size = Math.max(.22, (starSize * focal) / depth);
        if (px < -size || px > width + size || py < -size || py > height + size) continue;
        ctx.drawImage(sprite, px - size, py - size, size * 2, size * 2);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const loop = () => {
      if (!isRunning) return;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!isRunning && !document.hidden) {
        isRunning = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const stop = () => {
      if (isRunning) {
        isRunning = false;
        cancelAnimationFrame(raf);
      }
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    addEventListener('resize', resize);
    addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      stop();
      removeEventListener('resize', resize);
      removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div ref={containerRef} className={`particles-container ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="particles-canvas" id="bg-canvas" />
    </div>
  );
}

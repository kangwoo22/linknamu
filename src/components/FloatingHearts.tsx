"use client";

import { useEffect, useRef } from "react";

const HEART_COUNT = 100;

const PINKS = ["#fbcfe8", "#f9a8d4", "#f472b6", "#ec4899", "#fb7185", "#ff8fab"];

// 하트 모양 2종 + 테두리만 있는 하트: 뾰족한 하트, 둥근 하트
const HEART_PATHS = [
  "M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.2 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.6 0 5.8 3.8 4.3 7.3C19.5 16.4 12 21 12 21z",
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
];

// 화면 채우기 비율: 높을수록 하트가 크고 빽빽함 (둥둥 움직일 여유를 남기려면 0.6 이하 권장)
const FILL_RATIO = 0.3;
const GAP = 4; // 하트 사이 최소 간격(px)

// 둥둥 떠다니기
const BOB_AMOUNT = 0.3; // 하트 크기 대비 흔들리는 폭
const BOB_SPEED = 0.6;

// 커서 회피
const REPEL_RADIUS = 230; // 이 거리(px) 안으로 커서가 오면 하트가 피함
const REPEL_FORCE = 3; // 밀어내는 힘
const SWIRL = 0.35; // 옆으로 휘돌아 나가는 정도 (물결 느낌)
const SPRING = 0.02; // 제자리로 돌아오려는 힘
const DAMPING = 0.9; // 낮을수록 빨리 멈추고, 높을수록 오래 출렁임

// 서버와 브라우저에서 같은 결과가 나오도록 고정 시드 난수 사용 (hydration 불일치 방지)
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261008);
const between = (min: number, max: number) => min + rand() * (max - min);
const pick = <T,>(items: T[]) => items[Math.floor(rand() * items.length)];

const hearts = Array.from({ length: HEART_COUNT }, (_, i) => ({
  id: i,
  path: pick(HEART_PATHS),
  outline: rand() < 0.25,
  color: pick(PINKS),
  sizeFactor: between(0.7, 1.25), // 크기 제각각
  aspect: between(0.8, 1.25), // 가로세로 비율을 달리해 통통/날씬한 하트
  alpha: between(0.35, 0.8),
  phase: between(0, Math.PI * 2),
  freqX: between(0.6, 1.2),
  freqY: between(0.8, 1.5),
  rot: between(-30, 30),
  spin: between(5, 20),
}));

type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  r: number; // 충돌 반지름
  w: number;
  h: number;
};

// 화면 크기에 맞춰 하트 크기와 위치를 정하고, 서로 밀어내며 빈틈 없이 고르게 퍼뜨림
function layout(width: number, height: number): Body[] {
  const meanFactorSq =
    hearts.reduce((sum, h) => sum + h.sizeFactor ** 2, 0) / hearts.length;
  const baseR = Math.sqrt(
    (width * height * FILL_RATIO) / (hearts.length * Math.PI * meanFactorSq),
  );

  const cols = Math.max(1, Math.round(Math.sqrt((hearts.length * width) / height)));
  const rows = Math.ceil(hearts.length / cols);
  const cellW = width / cols;
  const cellH = height / rows;
  const jitter = mulberry32(7);

  const bodies: Body[] = hearts.map((heart, i) => {
    const r = baseR * heart.sizeFactor;
    const x = ((i % cols) + 0.2 + jitter() * 0.6) * cellW;
    const y = (Math.floor(i / cols) + 0.2 + jitter() * 0.6) * cellH;
    const w = heart.aspect >= 1 ? r * 2 : r * 2 * heart.aspect;
    const h = heart.aspect >= 1 ? (r * 2) / heart.aspect : r * 2;
    return { x, y, vx: 0, vy: 0, homeX: x, homeY: y, r, w, h };
  });

  for (let iter = 0; iter < 300; iter++) {
    separate(bodies, GAP + baseR * BOB_AMOUNT);
    for (const b of bodies) {
      b.x = Math.min(width - b.r * 0.6, Math.max(b.r * 0.6, b.x));
      b.y = Math.min(height - b.r * 0.6, Math.max(b.r * 0.6, b.y));
    }
  }
  for (const b of bodies) {
    b.homeX = b.x;
    b.homeY = b.y;
  }
  return bodies;
}

// 겹친 하트 쌍을 서로 반씩 밀어냄
function separate(bodies: Body[], gap: number) {
  for (let i = 0; i < bodies.length; i++) {
    const a = bodies[i];
    for (let j = i + 1; j < bodies.length; j++) {
      const b = bodies[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const min = a.r + b.r + gap;
      const distSq = dx * dx + dy * dy;
      if (distSq >= min * min) continue;
      const dist = Math.sqrt(distSq) || 0.01;
      const push = (min - dist) / 2;
      const nx = dx / dist;
      const ny = dy / dist;
      a.x -= nx * push;
      a.y -= ny * push;
      b.x += nx * push;
      b.y += ny * push;
    }
  }
}

export default function FloatingHearts() {
  const containerRef = useRef<HTMLDivElement>(null);
  const elsRef = useRef<(SVGSVGElement | null)[]>([]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, active: false };
    let bodies: Body[] = [];
    let frame = 0;

    const draw = (t: number) => {
      bodies.forEach((b, i) => {
        const el = elsRef.current[i];
        if (!el) return;
        const heart = hearts[i];
        const angle = heart.rot + Math.sin(t * BOB_SPEED * heart.freqX + heart.phase) * heart.spin;
        el.setAttribute("width", String(b.w));
        el.setAttribute("height", String(b.h));
        el.style.transform = `translate3d(${b.x - b.w / 2}px, ${b.y - b.h / 2}px, 0) rotate(${angle}deg)`;
      });
    };

    let lastW = 0;
    let lastH = 0;
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // 모바일 주소창이 접히며 생기는 작은 높이 변화에는 다시 배치하지 않음
      if (w === lastW && Math.abs(h - lastH) < 120) return;
      lastW = w;
      lastH = h;
      bodies = layout(w, h);
      draw(0);
      if (containerRef.current) containerRef.current.style.opacity = "1";
    };

    const tick = (now: number) => {
      const t = now / 1000;
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const heart = hearts[i];
        const amp = b.r * BOB_AMOUNT;
        const targetX = b.homeX + Math.sin(t * BOB_SPEED * heart.freqX + heart.phase) * amp;
        const targetY = b.homeY + Math.cos(t * BOB_SPEED * heart.freqY + heart.phase) * amp;

        b.vx += (targetX - b.x) * SPRING;
        b.vy += (targetY - b.y) * SPRING;

        if (pointer.active) {
          const dx = b.x - pointer.x;
          const dy = b.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < REPEL_RADIUS + b.r) {
            const f = (1 - dist / (REPEL_RADIUS + b.r)) ** 2 * REPEL_FORCE;
            const nx = dx / dist;
            const ny = dy / dist;
            b.vx += (nx - ny * SWIRL) * f;
            b.vy += (ny + nx * SWIRL) * f;
          }
        }

        b.vx *= DAMPING;
        b.vy *= DAMPING;
        b.x += b.vx;
        b.y += b.vy;
      }
      // 움직인 뒤에도 겹치지 않도록 두 번 보정 (밀린 하트가 이웃을 밀어 물결처럼 퍼짐)
      separate(bodies, GAP);
      separate(bodies, GAP);

      draw(t);
      frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) onLeave();
    };
    // 터치는 손가락을 떼면 커서가 사라진 것으로 처리
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") onLeave();
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduceMotion) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onMove, { passive: true });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onLeave);
      document.addEventListener("pointerout", onOut);
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onLeave);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden opacity-0 transition-opacity duration-700"
    >
      {hearts.map((heart, i) => (
        <svg
          key={heart.id}
          ref={(el) => {
            elsRef.current[i] = el;
          }}
          viewBox="0 0 24 24"
          preserveAspectRatio="none"
          width={0}
          height={0}
          className="absolute top-0 left-0 will-change-transform"
          style={{ opacity: heart.alpha }}
        >
          <path
            d={heart.path}
            fill={heart.outline ? "none" : heart.color}
            stroke={heart.outline ? heart.color : "none"}
            strokeWidth={heart.outline ? 2 : 0}
          />
        </svg>
      ))}
    </div>
  );
}

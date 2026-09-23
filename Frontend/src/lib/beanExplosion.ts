const DEFAULT_BEAN_COUNT = 20;
const GRAVITY = 1400;
const MIN_SPEED = 450;
const MAX_SPEED = 1400;
const RESTITUTION = 0.65;
const SPIN_MIN = 40;
const SPIN_MAX = 100;
const CULL_MARGIN = 60;
const BEAN_ASPECT = 393.38 / 521.32;
const BASE_BEAN_HEIGHT = 48;
const SPRAY_ANGLE = 180;
const EXTRA_FORCE_ANGLE = 120;
const EXTRA_FORCE_MULTIPLIER = 1.3;
const SIZE_MULTIPLIERS = {
  small: 0.5,
  medium: 1,
  large: 1.5,
} as const;

export type BeanSize = keyof typeof SIZE_MULTIPLIERS;

interface ExplodeBeansOptions {
  count?: number;
  size?: BeanSize;
}

interface Bean {
  el: HTMLImageElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  width: number;
  height: number;
}

let container: HTMLDivElement | null = null;
const beans: Array<Bean> = [];
let rafId: number | null = null;
let lastTime = 0;

function getContainer(): HTMLDivElement {
  if (!container) {
    container = document.createElement('div');
    container.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:9999;';
    document.body.appendChild(container);
  }
  return container;
}

function removeContainer(): void {
  container?.remove();
  container = null;
}

function normalizeAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function createBean(
  root: HTMLDivElement,
  originX: number,
  originY: number,
  sizeMultiplier: number,
): Bean {
  const height = (BASE_BEAN_HEIGHT + Math.random() * 10) * sizeMultiplier;
  const width = height * BEAN_ASPECT;
  const halfSpray = (SPRAY_ANGLE * Math.PI) / 180 / 2;
  const angle = -Math.PI / 2 - halfSpray + Math.random() * halfSpray * 2;
  let speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
  const delta = normalizeAngle(angle - -Math.PI / 2);
  if (Math.abs(delta) <= (EXTRA_FORCE_ANGLE * Math.PI) / 180 / 2) {
    speed *= EXTRA_FORCE_MULTIPLIER;
  }
  const el = document.createElement('img');

  el.src = '/assets/bean.svg';
  el.draggable = false;
  el.style.cssText = `position:absolute;left:0;top:0;width:${width}px;height:${height}px;pointer-events:none;will-change:transform;`;

  const bean: Bean = {
    el,
    x: originX - width / 2 + (Math.random() - 0.5) * 16,
    y: originY - height / 2 + (Math.random() - 0.5) * 16,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: Math.random() * 360,
    spin:
      (Math.random() < 0.5 ? -1 : 1) *
      (SPIN_MIN + Math.random() * (SPIN_MAX - SPIN_MIN)),
    width,
    height,
  };

  el.style.transform = `translate3d(${bean.x}px, ${bean.y}px, 0) rotate(${bean.rotation}deg)`;
  root.appendChild(el);
  return bean;
}

function tick(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, 0.048);
  lastTime = now;
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  for (let i = beans.length - 1; i >= 0; i--) {
    const bean = beans[i];
    bean.vy += GRAVITY * dt;
    bean.x += bean.vx * dt;
    bean.y += bean.vy * dt;
    bean.rotation += bean.spin * dt;

    if (bean.x <= 0) {
      bean.x = 0;
      bean.vx = Math.abs(bean.vx) * RESTITUTION;
    } else if (bean.x + bean.width >= viewW) {
      bean.x = viewW - bean.width;
      bean.vx = -Math.abs(bean.vx) * RESTITUTION;
    }

    if (bean.y > viewH + CULL_MARGIN) {
      bean.el.remove();
      beans.splice(i, 1);
      continue;
    }

    bean.el.style.transform = `translate3d(${bean.x}px, ${bean.y}px, 0) rotate(${bean.rotation}deg)`;
  }

  if (beans.length === 0) {
    rafId = null;
    removeContainer();
    return;
  }

  rafId = requestAnimationFrame(tick);
}

export function explodeBeans(
  element: Element,
  options?: ExplodeBeansOptions,
): void {
  if (typeof document === 'undefined') return;

  const count = options?.count ?? DEFAULT_BEAN_COUNT;
  const sizeMultiplier = SIZE_MULTIPLIERS[options?.size ?? 'medium'];
  const rect = element.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  const root = getContainer();
  for (let i = 0; i < count; i++) {
    beans.push(createBean(root, originX, originY, sizeMultiplier));
  }

  if (rafId === null) {
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }
}

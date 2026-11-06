"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle, Vec2 } from "ogl";

const vertexShader = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec2 uResolution;
  varying vec2 vUv;

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 point = (vUv - uPointer) * vec2(aspect, 1.0);
    float distanceFromPointer = length(point);
    float radius = 0.025 + mod(uTime * 0.12, 0.38);
    float ring = exp(-abs(distanceFromPointer - radius) * 90.0);
    float fade = exp(-distanceFromPointer * 2.4);
    float alpha = ring * fade * 0.22;

    gl_FragColor = vec4(0.56, 0.91, 0.81, alpha);
  }
`;

export function WaterRipple() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canAnimate =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canAnimate) return;

    const renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2),
    });
    const { gl } = renderer;
    gl.clearColor(0, 0, 0, 0);
    canvas.appendChild(gl.canvas);

    const pointer = new Vec2(0.5, 0.5);
    const resolution = new Vec2(1, 1);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: pointer },
        uResolution: { value: resolution },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      resolution.set(width, height);
      renderer.setSize(width, height);
      renderer.render({ scene: mesh });
    });
    resizeObserver.observe(canvas);

    let frame = 0;
    let animationFrame = 0;
    let lastTime = 0;
    let lastPointerActivity = 0;

    const render = (time: number) => {
      const elapsed = lastTime ? (time - lastTime) / 1000 : 0;
      lastTime = time;
      frame += elapsed;
      program.uniforms.uTime.value = frame;
      renderer.render({ scene: mesh });
      if (time - lastPointerActivity < 1200) {
        animationFrame = window.requestAnimationFrame(render);
      } else {
        animationFrame = 0;
      }
    };

    renderer.render({ scene: mesh });
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = canvas.getBoundingClientRect();
      pointer.set(
        (event.clientX - bounds.left) / bounds.width,
        1 - (event.clientY - bounds.top) / bounds.height,
      );
      lastPointerActivity = performance.now();
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      gl.canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div aria-hidden="true" className="water-ripple" ref={canvasRef} />;
}

"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Mesh, Program, Renderer, Texture, Triangle, Vec2, Vec3 } from "ogl";

const RIPPLE_CONFIG = {
  radius: 0.88, // Maximum wave radius, measured against hero height.
  startRadius: 0.035,
  expansionSpeed: 0.29,
  strength: 1.35, // Overall image refraction strength.
  fadeSpeed: 0.52, // Lower values keep waves visible longer.
  fadeDuration: 3.1,
  waveFrequency: 82,
  trailIntensity: 0.42, // Base strength of each mouse-trail wave.
  speedIntensity: 0.68, // Extra trail strength at high pointer speed.
  speedReference: 900,
  trailIntervalMs: 125,
  trailMinDistance: 12,
  clickIntensity: 2,
  ambientIntensity: 0.34,
  ambientIdleDelayMs: 1700,
  ambientIntervalMs: 4300,
  highlightStrength: 1.45, // Brightness of each ring's leading edge.
  highlightOpacity: 0.32,
  distortionAmount: 0.06,
  ringWidth: 0.013,
  ringSlots: 12,
  photoTint: 0.74,
  photoBlend: 0.52,
  navyOverlay: 0.24,
  causticsStrength: 0.2,
  maxDpr: 1.5,
  frameIntervalMs: 1000 / 30,
  colors: {
    navy: "#061e2b",
    teal: "#0c4e55",
    highlight: "#a9f4e3",
  },
} as const;

const vertexShader = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const rippleUniformDeclarations = Array.from(
  { length: RIPPLE_CONFIG.ringSlots },
  (_, index) => `
    uniform vec2 uRippleCenter${index};
    uniform float uRippleAge${index};
    uniform float uRippleStrength${index};
  `,
).join("\n");

const rippleUniformEvaluations = Array.from(
  { length: RIPPLE_CONFIG.ringSlots },
  (_, index) => `
    vec3 ripple${index} = getRipple(
      vUv,
      uRippleCenter${index},
      uRippleAge${index},
      uRippleStrength${index},
      aspect
    );
    distortion += ripple${index}.xy;
    highlights += ripple${index}.z;
  `,
).join("\n");

const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uImageResolution;
  uniform sampler2D uTexture;
  uniform float uHasImage;
  uniform float uRadius;
  uniform float uStartRadius;
  uniform float uExpansionSpeed;
  uniform float uFadeSpeed;
  uniform float uStrength;
  uniform float uRingWidth;
  uniform float uWaveFrequency;
  uniform float uHighlightStrength;
  uniform float uHighlightOpacity;
  uniform float uDistortionAmount;
  uniform float uPhotoTint;
  uniform float uPhotoBlend;
  uniform float uNavyOverlay;
  uniform float uCausticsStrength;
  uniform vec3 uNavy;
  uniform vec3 uTeal;
  uniform vec3 uHighlight;
  varying vec2 vUv;
  ${rippleUniformDeclarations}

  vec3 getRipple(
    vec2 uv,
    vec2 center,
    float age,
    float strength,
    float aspect
  ) {
    if (age < 0.0 || strength <= 0.0) return vec3(0.0);

    vec2 point = (uv - center) * vec2(aspect, 1.0);
    float distanceFromCenter = length(point);
    float radius = min(uStartRadius + age * uExpansionSpeed, uRadius);
    float phase = distanceFromCenter - radius;
    float envelope = exp(-age * uFadeSpeed);
    float ring = exp(-pow(phase / uRingWidth, 2.0)) * envelope;
    float leadingEdge = exp(
      -pow((phase - uRingWidth * 0.5) / (uRingWidth * 0.72), 2.0)
    ) * envelope;
    float wave = sin(phase * uWaveFrequency);
    vec2 direction = point / max(distanceFromCenter, 0.0001);
    vec2 offset = direction * wave * ring * strength * uStrength
      * uDistortionAmount;

    return vec3(offset, leadingEdge * strength);
  }

  vec2 coverUv(vec2 uv, float viewAspect, float imageAspect) {
    if (imageAspect > viewAspect) {
      uv.x = (uv.x - 0.5) * (viewAspect / imageAspect) + 0.5;
    } else {
      uv.y = (uv.y - 0.5) * (imageAspect / viewAspect) + 0.5;
    }
    return uv;
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 distortion = vec2(0.0);
    float highlights = 0.0;
    ${rippleUniformEvaluations}

    vec2 warpedUv = clamp(
      vUv + vec2(distortion.x / aspect, distortion.y),
      vec2(0.001),
      vec2(0.999)
    );
    float imageAspect = uImageResolution.x / max(uImageResolution.y, 1.0);
    vec2 imageUv = coverUv(warpedUv, aspect, imageAspect);
    vec3 gradient = mix(uNavy, uTeal, smoothstep(0.02, 0.96, warpedUv.y));
    float caustics = pow(
      max(
        0.0,
        sin(warpedUv.y * 35.0 + warpedUv.x * 8.0
          + sin(warpedUv.x * 12.0 + uTime * 0.025) * 2.0)
      ),
      14.0
    );
    gradient += uTeal * caustics * uCausticsStrength;

    vec3 photo = texture2D(uTexture, imageUv).rgb;
    photo = mix(photo, uNavy, uPhotoTint);
    vec3 color = mix(gradient, photo, uHasImage * uPhotoBlend);
    color = mix(color, uNavy, uNavyOverlay);
    color += uHighlight * highlights * uHighlightStrength * uHighlightOpacity;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface RippleStyle extends CSSProperties {
  "--ripple-navy": string;
  "--ripple-teal": string;
  "--ripple-highlight": string;
}

interface Ripple {
  center: Vec2;
  createdAt: number;
  strength: number;
}

function colorVector(hex: string): Vec3 {
  const value = Number.parseInt(hex.slice(1), 16);
  return new Vec3(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  );
}

const rippleStyle: RippleStyle = {
  "--ripple-navy": RIPPLE_CONFIG.colors.navy,
  "--ripple-teal": RIPPLE_CONFIG.colors.teal,
  "--ripple-highlight": RIPPLE_CONFIG.colors.highlight,
};

export function WaterRipple() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const hero = canvas.parentElement;
    if (!hero) return;
    const heroElement: HTMLElement = hero;
    const photo = heroElement.querySelector<HTMLImageElement>(".hero-photo");

    const renderer = new Renderer({
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, RIPPLE_CONFIG.maxDpr),
    });
    const { gl } = renderer;
    gl.clearColor(0, 0, 0, 1);
    canvas.appendChild(gl.canvas);

    const imageResolution = new Vec2(1, 1);
    const texture = new Texture(gl, {
      flipY: true,
      magFilter: gl.LINEAR,
      minFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    });
    const uniforms: Record<string, { value: number | Vec2 | Vec3 | Texture }> = {
      uTime: { value: 0 },
      uResolution: { value: new Vec2(1, 1) },
      uImageResolution: { value: imageResolution },
      uTexture: { value: texture },
      uHasImage: { value: 0 },
      uRadius: { value: RIPPLE_CONFIG.radius },
      uStartRadius: { value: RIPPLE_CONFIG.startRadius },
      uExpansionSpeed: { value: RIPPLE_CONFIG.expansionSpeed },
      uFadeSpeed: { value: RIPPLE_CONFIG.fadeSpeed },
      uStrength: { value: RIPPLE_CONFIG.strength },
      uRingWidth: { value: RIPPLE_CONFIG.ringWidth },
      uWaveFrequency: { value: RIPPLE_CONFIG.waveFrequency },
      uHighlightStrength: { value: RIPPLE_CONFIG.highlightStrength },
      uHighlightOpacity: { value: RIPPLE_CONFIG.highlightOpacity },
      uDistortionAmount: { value: RIPPLE_CONFIG.distortionAmount },
      uPhotoTint: { value: RIPPLE_CONFIG.photoTint },
      uPhotoBlend: { value: RIPPLE_CONFIG.photoBlend },
      uNavyOverlay: { value: RIPPLE_CONFIG.navyOverlay },
      uCausticsStrength: { value: RIPPLE_CONFIG.causticsStrength },
      uNavy: { value: colorVector(RIPPLE_CONFIG.colors.navy) },
      uTeal: { value: colorVector(RIPPLE_CONFIG.colors.teal) },
      uHighlight: { value: colorVector(RIPPLE_CONFIG.colors.highlight) },
    };
    const ripples: Ripple[] = Array.from(
      { length: RIPPLE_CONFIG.ringSlots },
      (_, index) => {
        uniforms[`uRippleCenter${index}`] = { value: new Vec2(0.5, 0.5) };
        uniforms[`uRippleAge${index}`] = { value: -1 };
        uniforms[`uRippleStrength${index}`] = { value: 0 };
        return {
          center: new Vec2(0.5, 0.5),
          createdAt: -Infinity,
          strength: 0,
        };
      },
    );
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      transparent: false,
      uniforms,
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const resolution = program.uniforms.uResolution.value as Vec2;

    let rippleIndex = 0;
    let frameRequest = 0;
    let frameTimer = 0;
    let lastPointerActivity = performance.now();
    let lastTrailPosition: Vec2 | null = null;
    let lastTrailTime = 0;
    let nextAmbientAt = lastPointerActivity + RIPPLE_CONFIG.ambientIdleDelayMs;
    let isVisible = false;

    const isActive = () =>
      isVisible && document.visibilityState === "visible";

    const scheduleFrame = () => {
      if (frameRequest || frameTimer || !isActive()) return;
      frameTimer = window.setTimeout(() => {
        frameTimer = 0;
        frameRequest = window.requestAnimationFrame(render);
      }, RIPPLE_CONFIG.frameIntervalMs);
    };

    const pauseFrames = () => {
      if (frameTimer) {
        window.clearTimeout(frameTimer);
        frameTimer = 0;
      }
      if (frameRequest) {
        window.cancelAnimationFrame(frameRequest);
        frameRequest = 0;
      }
    };

    const addRipple = (x: number, y: number, strength: number, time: number) => {
      const ripple = ripples[rippleIndex];
      ripple.center.set(x, y);
      ripple.createdAt = time;
      ripple.strength = strength;
      rippleIndex = (rippleIndex + 1) % ripples.length;
      scheduleFrame();
    };

    function render(time: number) {
      frameRequest = 0;
      if (!isActive()) return;

      if (
        time - lastPointerActivity >= RIPPLE_CONFIG.ambientIdleDelayMs &&
        time >= nextAmbientAt
      ) {
        addRipple(
          0.16 + Math.random() * 0.68,
          0.16 + Math.random() * 0.68,
          RIPPLE_CONFIG.ambientIntensity,
          time,
        );
        nextAmbientAt = time + RIPPLE_CONFIG.ambientIntervalMs;
      }

      program.uniforms.uTime.value = time / 1000;
      ripples.forEach((ripple, index) => {
        const age = (time - ripple.createdAt) / 1000;
        const active = age >= 0 && age <= RIPPLE_CONFIG.fadeDuration;
        program.uniforms[`uRippleCenter${index}`].value = ripple.center;
        program.uniforms[`uRippleAge${index}`].value = active ? age : -1;
        program.uniforms[`uRippleStrength${index}`].value = active
          ? ripple.strength
          : 0;
      });

      renderer.render({ scene: mesh });
      scheduleFrame();
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      resolution.set(width, height);
      renderer.setSize(width, height);
      scheduleFrame();
    });
    resizeObserver.observe(canvas);

    const onImageLoad = () => {
      if (!photo?.naturalWidth || !photo.naturalHeight) return;
      texture.image = photo;
      texture.needsUpdate = true;
      imageResolution.set(photo.naturalWidth, photo.naturalHeight);
      program.uniforms.uHasImage.value = 1;
      scheduleFrame();
    };
    const onImageError = () => {
      console.error("The hero image could not be loaded for the water ripple.");
    };
    photo?.addEventListener("load", onImageLoad);
    photo?.addEventListener("error", onImageError);
    if (photo?.complete && photo.naturalWidth) onImageLoad();

    const pointInHero = (event: PointerEvent) => {
      const bounds = heroElement.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        return null;
      }
      return new Vec2(
        (event.clientX - bounds.left) / bounds.width,
        1 - (event.clientY - bounds.top) / bounds.height,
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const point = pointInHero(event);
      if (!point) {
        lastTrailPosition = null;
        return;
      }

      const now = performance.now();
      const distance = lastTrailPosition
        ? Math.hypot(
            (point.x - lastTrailPosition.x) * heroElement.clientWidth,
            (point.y - lastTrailPosition.y) * heroElement.clientHeight,
          )
        : Infinity;
      const elapsed = Math.max(now - lastTrailTime, 1);
      const speed = distance / elapsed * 1000;
      lastPointerActivity = now;
      nextAmbientAt = now + RIPPLE_CONFIG.ambientIdleDelayMs;

      if (
        distance >= RIPPLE_CONFIG.trailMinDistance &&
        now - lastTrailTime >= RIPPLE_CONFIG.trailIntervalMs
      ) {
        const speedBoost =
          Math.min(speed / RIPPLE_CONFIG.speedReference, 1) *
          RIPPLE_CONFIG.speedIntensity;
        addRipple(
          point.x,
          point.y,
          RIPPLE_CONFIG.trailIntensity + speedBoost,
          now,
        );
        lastTrailPosition = point;
        lastTrailTime = now;
      } else if (!lastTrailPosition) {
        lastTrailPosition = point;
        lastTrailTime = now;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const point = pointInHero(event);
      if (!point) return;
      const now = performance.now();
      lastPointerActivity = now;
      nextAmbientAt = now + RIPPLE_CONFIG.ambientIdleDelayMs;
      lastTrailPosition = point;
      lastTrailTime = now;
      addRipple(point.x, point.y, RIPPLE_CONFIG.clickIntensity, now);
    };

    const onVisibilityChange = () => {
      if (isActive()) scheduleFrame();
      else pauseFrames();
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = Boolean(entry?.isIntersecting);
      if (isActive()) scheduleFrame();
      else pauseFrames();
    });
    intersectionObserver.observe(heroElement);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    scheduleFrame();

    return () => {
      pauseFrames();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      photo?.removeEventListener("load", onImageLoad);
      photo?.removeEventListener("error", onImageError);
      gl.canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="water-ripple"
      ref={canvasRef}
      style={rippleStyle}
    />
  );
}

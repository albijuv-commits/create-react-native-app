"use client";

import { Hand } from "lucide-react";
import type { StaticImageData } from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { TiltIllustration } from "@/components/ui/tilt-illustration";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

type Euler3 = readonly [number, number, number];

export interface ModelViewerProps {
  /** GLB in /public/models (compressione meshopt, texture WebP) */
  src: string;
  /** L'illustrazione mostrata finché il modello non è pronto, e al suo posto se il 3D non è disponibile */
  poster: StaticImageData;
  /** Descrizione per i lettori di schermo */
  label: string;
  /** Rotazione iniziale del modello, in radianti, per mostrarne il lato giusto */
  initialRotation?: Euler3;
  /** Quanto si può inclinare in verticale (radianti) */
  maxTilt?: number;
  sizes: string;
  priority?: boolean;
  /** Negli spazi piccoli il suggerimento «Trascina per ruotare» diventa solo un'icona */
  hint?: "label" | "icon";
  className?: string;
}

/**
 * Un oggetto 3D da girare con il dito: si carica quando entra nello schermo e il browser è libero,
 * poi prende il posto dell'illustrazione. Gira solo mentre la persona lo trascina (con un po'
 * d'inerzia, tolta con meno movimento) o con le frecce della tastiera; da fermo non si muove.
 */
export function ModelViewer({ src, poster, label, initialRotation = [0, 0, 0], maxTilt = 0.6, sizes, priority, hint = "label", className }: ModelViewerProps) {
  const reduced = usePrefersReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [touched, setTouched] = useState(false);
  const reducedRef = useRef(reduced);
  const nudge = useRef<((dx: number, dy: number) => void) | null>(null);
  const [rx, ry, rz] = initialRotation;

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    const el = box.current;
    const host = canvasHost.current;
    if (!el || !host) return;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    const start = async () => {
      const save = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      if (save) return;
      const [THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/loaders/GLTFLoader.js"),
        import("three/examples/jsm/libs/meshopt_decoder.module.js"),
        import("three/examples/jsm/environments/RoomEnvironment.js"),
      ]);
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      // «Neutral» rispetta i colori della palette meglio di ACES
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTexture;
      scene.environmentIntensity = 0.75;
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(-2, 3, 4);
      scene.add(key, new THREE.HemisphereLight(0xfff8f2, 0x3b2c85, 0.5));

      const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
      const pivot = new THREE.Group();
      scene.add(pivot);

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      let gltf: Awaited<ReturnType<typeof loader.loadAsync>>;
      try {
        gltf = await loader.loadAsync(src);
      } catch {
        renderer.dispose();
        pmrem.dispose();
        return;
      }
      if (disposed) {
        renderer.dispose();
        pmrem.dispose();
        return;
      }
      const model = gltf.scene;
      model.rotation.set(rx, ry, rz);
      // Centro e dimensione: il modello sta in una sfera di raggio 1
      const bounds = new THREE.Box3().setFromObject(model);
      const sphere = bounds.getBoundingSphere(new THREE.Sphere());
      model.position.sub(sphere.center);
      const holder = new THREE.Group();
      holder.add(model);
      holder.scale.setScalar(1 / sphere.radius);
      pivot.add(holder);
      camera.position.set(0, 0, 1 / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) + 0.05);

      host.appendChild(renderer.domElement);

      let frame = 0;
      const render = () => {
        frame = 0;
        renderer.render(scene, camera);
      };
      const request = () => {
        if (!frame) frame = requestAnimationFrame(render);
      };
      const resize = () => {
        const { width, height } = host.getBoundingClientRect();
        if (width < 1 || height < 1) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        request();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();

      // Trascinamento con inerzia
      let yaw = 0;
      let pitch = 0;
      let vYaw = 0;
      let vPitch = 0;
      let spin = 0;
      const apply = () => {
        pivot.rotation.set(pitch, yaw, 0);
        request();
      };
      const coast = () => {
        vYaw *= 0.93;
        vPitch *= 0.88;
        yaw += vYaw;
        pitch = THREE.MathUtils.clamp(pitch + vPitch, -maxTilt, maxTilt);
        apply();
        spin = Math.abs(vYaw) > 0.0006 || Math.abs(vPitch) > 0.0006 ? requestAnimationFrame(coast) : 0;
      };
      nudge.current = (dx, dy) => {
        yaw += dx;
        pitch = THREE.MathUtils.clamp(pitch + dy, -maxTilt, maxTilt);
        apply();
      };

      let drag: { id: number; x: number; y: number; t: number } | null = null;
      const onDown = (e: PointerEvent) => {
        if (drag) return;
        cancelAnimationFrame(spin);
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
        host.setPointerCapture(e.pointerId);
        setTouched(true);
      };
      const onMove = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const now = performance.now();
        const dx = (e.clientX - drag.x) * 0.012;
        const dy = (e.clientY - drag.y) * 0.008;
        const dt = Math.max(1, now - drag.t);
        vYaw = (dx / dt) * 16;
        vPitch = (dy / dt) * 16;
        yaw += dx;
        pitch = THREE.MathUtils.clamp(pitch + dy, -maxTilt, maxTilt);
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: now };
        apply();
      };
      const onUp = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        drag = null;
        if (!reducedRef.current) spin = requestAnimationFrame(coast);
      };
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerup", onUp);
      host.addEventListener("pointercancel", onUp);

      apply();
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(frame);
        cancelAnimationFrame(spin);
        ro.disconnect();
        host.removeEventListener("pointerdown", onDown);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerup", onUp);
        host.removeEventListener("pointercancel", onUp);
        nudge.current = null;
        scene.traverse((o) => {
          const mesh = o as InstanceType<typeof THREE.Mesh>;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of materials) {
            for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
            m.dispose();
          }
        });
        envTexture.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    // Si carica solo quando l'oggetto è visibile e il browser ha un momento libero
    let idleId = 0;
    let timeoutId = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const go = () => void start();
        if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(go, { timeout: 2500 });
        else timeoutId = window.setTimeout(go, 300);
      },
      { rootMargin: "120px" },
    );
    io.observe(el);

    return () => {
      disposed = true;
      io.disconnect();
      if (idleId && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      window.clearTimeout(timeoutId);
      cleanup?.();
    };
  }, [src, rx, ry, rz, maxTilt]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = 0.25;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step / 2], ArrowDown: [0, step / 2] };
    const move = moves[e.key];
    if (!move || !nudge.current) return;
    e.preventDefault();
    setTouched(true);
    nudge.current(move[0], move[1]);
  };

  return (
    <div
      ref={box}
      role="img"
      aria-label={ready ? `${label}. Trascina o usa le frecce per ruotarlo.` : label}
      tabIndex={ready ? 0 : -1}
      onKeyDown={onKey}
      className={cn("relative aspect-square rounded-full outline-none focus-visible:ring-4 focus-visible:ring-focus/60", className)}
    >
      <div className={cn("absolute inset-0 transition-opacity duration-500", ready ? "pointer-events-none opacity-0" : "opacity-100")}>
        <TiltIllustration src={poster} sizes={sizes} priority={priority} className="h-full w-full" />
      </div>
      <div ref={canvasHost} className={cn("absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing", !ready && "pointer-events-none")} />
      {ready && !touched &&
        (hint === "label" ? (
          <span className="pointer-events-none absolute bottom-1 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-small font-bold text-primary shadow-sm">
            <Hand aria-hidden className="size-4" />
            Trascina per ruotare
          </span>
        ) : (
          <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-surface text-primary shadow-sm">
            <Hand className="size-4" />
          </span>
        ))}
    </div>
  );
}

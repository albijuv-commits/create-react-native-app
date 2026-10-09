"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { bodyZoneLabel, type BodyView, type BodyZoneId } from "@data/vocab/body";
import { MANNEQUIN_ZONE_GLSL, mannequinZone, ZONE_INDEX, zoneMask } from "./mannequin-zones";

/**
 * Mappa del corpo in 3D: un manichino che si ruota trascinando e si tocca per scegliere le zone.
 * Parte con un manichino geometrico leggero e, appena arriva, lo sostituisce con quello scolpito
 * (public/models/manichino.glb), colorato zona per zona. Disegna solo quando serve
 * (trascinamento, inerzia, cambi di stato), così non consuma batteria quando è fermo.
 * Se WebGL non c'è, avvisa e la pagina usa la mappa 2D.
 */

const SCULPTED_MODEL = "/models/manichino.glb";

const COLOR = {
  body: new THREE.Color("#e6dcf2"),
  face: new THREE.Color("#c9bce6"),
  hover: new THREE.Color("#d6c8f2"),
  selected: new THREE.Color("#e98aa8"),
  selectedGlow: new THREE.Color("#5a1030"),
};

/** Profilo del busto (raggio, altezza), ruotato attorno all'asse verticale */
const TORSO: [number, number][] = [
  [0.15, 0.86],
  [0.168, 0.9],
  [0.17, 0.95],
  [0.16, 1.0],
  [0.148, 1.05],
  [0.15, 1.1],
  [0.16, 1.16],
  [0.176, 1.24],
  [0.188, 1.32],
  [0.19, 1.37],
  [0.178, 1.41],
  [0.14, 1.44],
  [0.075, 1.465],
];

function torsoSlice(y0: number, y1: number): THREE.Vector2[] {
  const at = (y: number) => {
    for (let i = 0; i < TORSO.length - 1; i++) {
      const [r0, a] = TORSO[i]!;
      const [r1, b] = TORSO[i + 1]!;
      if (y >= a && y <= b) return r0 + ((r1 - r0) * (y - a)) / (b - a);
    }
    return TORSO[TORSO.length - 1]![0];
  };
  const inner = TORSO.filter(([, y]) => y > y0 && y < y1);
  return [[at(y0), y0] as [number, number], ...inner, [at(y1), y1] as [number, number]].map(([r, y]) => new THREE.Vector2(r, y));
}

const FRONT = -Math.PI / 2;
const BACK = Math.PI / 2;

interface Mannequin {
  group: THREE.Group;
  zoneMeshes: Map<BodyZoneId, THREE.Mesh[]>;
  pickables: THREE.Mesh[];
}

function buildMannequin(): Mannequin {
  const group = new THREE.Group();
  const zoneMeshes = new Map<BodyZoneId, THREE.Mesh[]>();
  const pickables: THREE.Mesh[] = [];

  const add = (geometry: THREE.BufferGeometry, zone: BodyZoneId | null, setup?: (m: THREE.Mesh) => void, face = false) => {
    const material = new THREE.MeshStandardMaterial({
      color: (face ? COLOR.face : COLOR.body).clone(),
      roughness: 0.78,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { zone, face };
    setup?.(mesh);
    group.add(mesh);
    if (zone) {
      zoneMeshes.set(zone, [...(zoneMeshes.get(zone) ?? []), mesh]);
      pickables.push(mesh);
    }
    return mesh;
  };

  // Busto: davanti e dietro sono zone diverse
  const torso = (y0: number, y1: number, front: boolean, zone: BodyZoneId) =>
    add(new THREE.LatheGeometry(torsoSlice(y0, y1), 28, front ? FRONT : BACK, Math.PI), zone, (m) => m.scale.set(1, 1, 0.62));
  torso(1.18, 1.465, true, "petto");
  torso(1.08, 1.18, true, "stomaco");
  torso(0.98, 1.08, true, "pancia");
  torso(0.86, 0.98, true, "basso-ventre");
  torso(1.18, 1.465, false, "schiena-alta");
  torso(0.86, 1.18, false, "schiena-bassa");
  add(new THREE.SphereGeometry(0.15, 24, 12), null, (m) => {
    m.position.set(0, 0.875, 0);
    m.scale.set(1, 0.35, 0.62);
  });

  // Collo e nuca
  const neck = (front: boolean, zone: BodyZoneId) =>
    add(new THREE.CylinderGeometry(0.052, 0.058, 0.1, 24, 1, true, front ? FRONT : BACK, Math.PI), zone, (m) => m.position.set(0, 1.49, 0));
  neck(true, "collo");
  neck(false, "nuca");

  // Testa e viso
  add(new THREE.SphereGeometry(0.105, 32, 24), "testa", (m) => {
    m.position.set(0, 1.635, 0);
    m.scale.set(1, 1.18, 1.05);
  });
  for (const x of [-0.036, 0.036]) {
    add(new THREE.SphereGeometry(0.014, 16, 12), "occhi", (m) => m.position.set(x, 1.655, 0.097), true);
    add(new THREE.SphereGeometry(0.024, 16, 12), "orecchie", (m) => {
      m.position.set(x > 0 ? 0.106 : -0.106, 1.635, 0);
      m.scale.set(0.5, 1, 0.8);
    }, true);
  }
  add(new THREE.ConeGeometry(0.015, 0.038, 14), "naso", (m) => {
    m.position.set(0, 1.622, 0.112);
    m.rotation.x = Math.PI / 2;
  }, true);
  add(new THREE.CapsuleGeometry(0.009, 0.032, 4, 10), "bocca", (m) => {
    m.position.set(0, 1.585, 0.1);
    m.rotation.z = Math.PI / 2;
  }, true);

  // Spalle, braccia, mani
  for (const side of [-1, 1]) {
    add(new THREE.SphereGeometry(0.07, 20, 16), "spalle", (m) => {
      m.position.set(side * 0.2, 1.395, 0);
      m.scale.set(1, 1, 0.8);
    });
    add(new THREE.CapsuleGeometry(0.048, 0.5, 6, 16), "braccia", (m) => {
      m.position.set(side * 0.2525, 1.12, 0);
      m.rotation.z = side * 0.105;
    });
    add(new THREE.SphereGeometry(0.05, 18, 14), "mani", (m) => {
      m.position.set(side * 0.29, 0.79, 0.01);
      m.scale.set(0.55, 1.25, 0.4);
    });
    add(new THREE.CapsuleGeometry(0.068, 0.66, 6, 16), "gambe", (m) => {
      m.position.set(side * 0.1, 0.475, 0);
      m.rotation.z = side * 0.015;
    });
    add(new THREE.SphereGeometry(0.055, 18, 14), "piedi", (m) => {
      m.position.set(side * 0.105, 0.05, 0.05);
      m.scale.set(0.95, 0.6, 1.9);
    });
  }
  return { group, zoneMeshes, pickables };
}

/** Le due inquadrature: corpo intero o testa da vicino */
const SHOTS = {
  body: { position: new THREE.Vector3(0, 0.86, 3.95), target: new THREE.Vector3(0, 0.76, 0) },
  head: { position: new THREE.Vector3(0, 1.6, 1.15), target: new THREE.Vector3(0, 1.6, 0) },
};

export interface BodyMap3DProps {
  selected: readonly BodyZoneId[];
  onToggle: (zone: BodyZoneId) => void;
  /** Ogni incremento chiede mezzo giro (fronte ↔ retro) */
  turn: number;
  zoomHead: boolean;
  reduced: boolean;
  onViewChange: (view: BodyView) => void;
  onUnsupported: () => void;
}

export default function BodyMap3D({ selected, onToggle, turn, zoomHead, reduced, onViewChange, onUnsupported }: BodyMap3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<{
    setSelected: (zones: readonly BodyZoneId[]) => void;
    halfTurn: () => void;
    zoom: (head: boolean) => void;
  } | null>(null);
  const callbacks = useRef({ onToggle, onViewChange, reduced });
  const [flash, setFlash] = useState<{ x: number; y: number; text: string; key: number } | null>(null);

  useEffect(() => {
    callbacks.current = { onToggle, onViewChange, reduced };
  }, [onToggle, onViewChange, reduced]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      onUnsupported();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.style.touchAction = "none";
    canvas.style.display = "block";
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 20);
    camera.position.copy(SHOTS.body.position);
    const target = SHOTS.body.target.clone();
    camera.lookAt(target);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x9f93d6, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 3, 4);
    const rim = new THREE.DirectionalLight(0xf6b3cb, 0.7);
    rim.position.set(-2.5, 2, -3);
    scene.add(key, rim);

    const { group, zoneMeshes, pickables: proceduralPickables } = buildMannequin();
    scene.add(group);

    let selectedSet = new Set<BodyZoneId>();
    let hovered: BodyZoneId | null = null;
    // Manichino scolpito: una sola mesh; lo shader calcola la zona di ogni pixel
    let sculpted: { mesh: THREE.Mesh; uniforms: { uSelected: { value: number }; uHover: { value: number } } } | null = null;
    let pickables: THREE.Object3D[] = proceduralPickables;
    const paint = () => {
      if (sculpted) {
        sculpted.uniforms.uSelected.value = zoneMask([...selectedSet]);
        sculpted.uniforms.uHover.value = hovered ? ZONE_INDEX[hovered] : -1;
        return;
      }
      for (const [zone, meshes] of zoneMeshes) {
        for (const m of meshes) {
          const material = m.material as THREE.MeshStandardMaterial;
          const isSelected = selectedSet.has(zone);
          const base = m.userData.face ? COLOR.face : COLOR.body;
          material.color.copy(isSelected ? COLOR.selected : zone === hovered ? COLOR.hover : base);
          material.emissive.copy(isSelected ? COLOR.selectedGlow : new THREE.Color(0x000000));
          material.emissiveIntensity = isSelected ? 0.25 : 0;
        }
      }
    };

    // Disegno a richiesta
    let frame = 0;
    let animating = false;
    const render = () => renderer.render(scene, camera);
    const requestRender = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    let yaw = 0;
    let velocity = 0;
    let turnFrom = 0;
    let turnTo = 0;
    let turnStart = -1;
    let zoomFrom = { p: camera.position.clone(), t: target.clone() };
    let zoomTo = zoomFrom;
    let zoomStart = -1;
    let lastView: BodyView = "fronte";
    const ease = (x: number) => 1 - Math.pow(1 - x, 4);

    function tick(now: number) {
      frame = 0;
      animating = false;
      if (turnStart >= 0) {
        const k = callbacks.current.reduced ? 1 : Math.min(1, (now - turnStart) / 450);
        yaw = turnFrom + (turnTo - turnFrom) * ease(k);
        if (k < 1) animating = true;
        else turnStart = -1;
      } else if (Math.abs(velocity) > 0.0005 && !dragging) {
        yaw += velocity;
        velocity *= 0.9;
        animating = true;
      }
      if (zoomStart >= 0) {
        const k = callbacks.current.reduced ? 1 : Math.min(1, (now - zoomStart) / 500);
        camera.position.lerpVectors(zoomFrom.p, zoomTo.p, ease(k));
        target.lerpVectors(zoomFrom.t, zoomTo.t, ease(k));
        camera.lookAt(target);
        if (k < 1) animating = true;
        else zoomStart = -1;
      }
      group.rotation.y = yaw;
      const view: BodyView = Math.cos(yaw) >= 0 ? "fronte" : "retro";
      if (view !== lastView) {
        lastView = view;
        callbacks.current.onViewChange(view);
      }
      render();
      if (animating || dragging) requestRender();
    }

    // Dimensioni
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      requestRender();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    // Tocco e trascinamento
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let dragging = false;
    let downX = 0;
    let downY = 0;
    let lastX = 0;
    let lastT = 0;
    let downAt = 0;

    const pick = (clientX: number, clientY: number): BodyZoneId | null => {
      const rect = canvas.getBoundingClientRect();
      pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pickables, false)[0];
      if (!hit) return null;
      if (sculpted && hit.object === sculpted.mesh) {
        // Il punto toccato, nel sistema del manichino (piedi a terra, sguardo verso +z)
        const local = sculptedRoot.worldToLocal(hit.point.clone());
        return mannequinZone(local.x, local.y, local.z);
      }
      return (hit.object.userData.zone as BodyZoneId | undefined) ?? null;
    };

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      dragging = true;
      turnStart = -1;
      velocity = 0;
      downX = lastX = e.clientX;
      downY = e.clientY;
      downAt = lastT = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      if (dragging) {
        const width = canvas.getBoundingClientRect().width || 300;
        const dx = e.clientX - lastX;
        const now = performance.now();
        const delta = (dx / width) * Math.PI * 1.3;
        yaw += delta;
        velocity = callbacks.current.reduced ? 0 : delta / Math.max(1, (now - lastT) / 16);
        lastX = e.clientX;
        lastT = now;
        requestRender();
      } else if (e.pointerType === "mouse") {
        const zone = pick(e.clientX, e.clientY);
        canvas.style.cursor = zone ? "pointer" : "grab";
        if (zone !== hovered) {
          hovered = zone;
          paint();
          requestRender();
        }
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved < 8 && performance.now() - downAt < 500) {
        velocity = 0;
        const zone = pick(e.clientX, e.clientY);
        if (zone) {
          const rect = host.getBoundingClientRect();
          const willSelect = !selectedSet.has(zone);
          setFlash({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: `${bodyZoneLabel(zone)}: ${willSelect ? "aggiunta" : "tolta"}`, key: performance.now() });
          callbacks.current.onToggle(zone);
        }
      }
      requestRender();
    };
    const onLeave = () => {
      if (hovered) {
        hovered = null;
        paint();
        requestRender();
      }
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    api.current = {
      setSelected: (zones) => {
        selectedSet = new Set(zones);
        paint();
        requestRender();
      },
      halfTurn: () => {
        const base = Math.round(yaw / Math.PI) * Math.PI;
        turnFrom = yaw;
        turnTo = base + Math.PI;
        turnStart = performance.now();
        velocity = 0;
        requestRender();
      },
      zoom: (head) => {
        zoomFrom = { p: camera.position.clone(), t: target.clone() };
        zoomTo = head ? { p: SHOTS.head.position, t: SHOTS.head.target } : { p: SHOTS.body.position, t: SHOTS.body.target };
        zoomStart = performance.now();
        requestRender();
      },
    };
    paint();
    requestRender();

    // Il manichino scolpito arriva dopo: finché non c'è resta quello geometrico
    const sculptedRoot = new THREE.Group();
    let disposed = false;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader
      .loadAsync(SCULPTED_MODEL)
      .then((gltf) => {
        if (disposed) return;
        let mesh: THREE.Mesh | null = null;
        gltf.scene.traverse((o) => {
          if (!mesh && o instanceof THREE.Mesh) mesh = o;
        });
        const found = mesh as THREE.Mesh | null;
        if (!found) return;
        gltf.scene.updateMatrixWorld(true);
        // Le posizioni sono quantizzate: la matrice del nodo le riporta alle misure del manichino
        const uniforms = {
          uToModel: { value: found.matrixWorld.clone() },
          uSelected: { value: 0 },
          uHover: { value: -1 },
          uSelectedColor: { value: COLOR.selected.clone() },
          uHoverColor: { value: COLOR.hover.clone() },
        };
        const material = new THREE.MeshStandardMaterial({ color: COLOR.body.clone(), roughness: 0.62, metalness: 0 });
        material.onBeforeCompile = (shader) => {
          Object.assign(shader.uniforms, uniforms);
          shader.vertexShader = shader.vertexShader
            .replace("#include <common>", "#include <common>\nuniform mat4 uToModel;\nvarying vec3 vModel;")
            .replace("#include <begin_vertex>", "#include <begin_vertex>\nvModel = (uToModel * vec4(position, 1.0)).xyz;");
          shader.fragmentShader = shader.fragmentShader
            .replace(
              "#include <common>",
              `#include <common>\nuniform int uSelected;\nuniform int uHover;\nuniform vec3 uSelectedColor;\nuniform vec3 uHoverColor;\nvarying vec3 vModel;\n${MANNEQUIN_ZONE_GLSL}`,
            )
            .replace(
              "#include <color_fragment>",
              `#include <color_fragment>
              int zone = mannequinZone(vModel);
              bool isSelected = ((uSelected >> zone) & 1) == 1;
              if (isSelected) diffuseColor.rgb = uSelectedColor;
              else if (zone == uHover) diffuseColor.rgb = uHoverColor;`,
            )
            .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\nif (isSelected) totalEmissiveRadiance += uSelectedColor * 0.12;");
        };
        found.material = material;
        sculptedRoot.add(gltf.scene);
        group.add(sculptedRoot);
        for (const child of group.children) if (child !== sculptedRoot) child.visible = false;
        sculpted = { mesh: found, uniforms };
        pickables = [found];
        paint();
        requestRender();
      })
      .catch(() => {
        // Resta il manichino geometrico
      });

    return () => {
      disposed = true;
      api.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      group.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const materials = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of materials) (m as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      canvas.remove();
    };
  }, [onUnsupported]);

  useEffect(() => {
    api.current?.setSelected(selected);
  }, [selected]);

  const firstTurn = useRef(turn);
  useEffect(() => {
    if (turn !== firstTurn.current) api.current?.halfTurn();
  }, [turn]);

  const firstZoom = useRef(zoomHead);
  useEffect(() => {
    if (zoomHead !== firstZoom.current || zoomHead) api.current?.zoom(zoomHead);
  }, [zoomHead]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 1400);
    return () => clearTimeout(timer);
  }, [flash]);

  return (
    <div ref={hostRef} className="relative h-full w-full cursor-grab active:cursor-grabbing" aria-hidden>
      {flash && (
        <span
          key={flash.key}
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[140%] whitespace-nowrap rounded-full bg-ink px-3 py-1 text-small font-bold text-bg shadow-md"
          style={{ left: flash.x, top: flash.y }}
        >
          {flash.text}
        </span>
      )}
    </div>
  );
}

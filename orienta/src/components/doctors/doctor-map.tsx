"use client";

import "leaflet/dist/leaflet.css";
import type { DivIcon, LayerGroup, Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";
import type { Doctor } from "@/lib/doctors/schema";
import { escapeHtml } from "@/lib/escape-html";
import type { Origin } from "./location-picker";

type Leaflet = typeof import("leaflet");

/* Tile di OpenStreetMap secondo le regole d'uso: indirizzo unico, attribuzione visibile, nessun download anticipato */
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

/** I nomi arrivano da OpenStreetMap: nel codice HTML dei segnaposto passano sempre da escapeHtml */
function pinIcon(L: Leaflet, n: number, name: string, selected: boolean): DivIcon {
  return L.divIcon({
    className: "orienta-pin",
    html: `<span class="orienta-pin__body${selected ? " is-selected" : ""}"><span aria-hidden="true" class="orienta-pin__label">${n}</span><span class="sr-only">${n}. ${escapeHtml(name)}</span></span>`,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
  });
}

/**
 * La mappa dei risultati con Leaflet, caricata solo quando la persona sceglie la vista mappa.
 * I segnaposto hanno lo stesso numero della lista; toccandone uno si vedono i contatti sotto.
 */
export function DoctorMap({
  origin,
  doctors,
  selectedId,
  onSelect,
  reduced,
}: {
  origin: Origin;
  doctors: readonly Doctor[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  reduced: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const leaflet = useRef<Leaflet | null>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const markers = useRef(new Map<string, { marker: Marker; n: number; name: string }>());
  const select = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    select.current = onSelect;
  }, [onSelect]);

  // La mappa nasce una volta sola e si smonta con il componente
  useEffect(() => {
    let cancelled = false;
    const registry = markers.current;
    import("leaflet")
      .then((mod) => {
        const L: Leaflet = (mod as { default?: Leaflet }).default ?? mod;
        if (cancelled || !container.current) return;
        leaflet.current = L;
        const m = L.map(container.current, {
          zoomAnimation: !reduced,
          fadeAnimation: !reduced,
          markerZoomAnimation: !reduced,
          scrollWheelZoom: false,
        });
        m.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>');
        L.tileLayer(TILE_URL, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(m);
        layer.current = L.layerGroup().addTo(m);
        map.current = m;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      layer.current = null;
      registry.clear();
    };
  }, [reduced]);

  // Segnaposto: la persona (senza numero) e i risultati, poi si inquadrano tutti
  useEffect(() => {
    const L = leaflet.current;
    const m = map.current;
    const group = layer.current;
    if (!ready || !L || !m || !group) return;
    group.clearLayers();
    markers.current.clear();
    group.addLayer(
      L.marker([origin.lat, origin.lon], {
        icon: L.divIcon({ className: "orienta-me", html: '<span class="orienta-me__dot"></span>', iconSize: [22, 22], iconAnchor: [11, 11] }),
        interactive: false,
        keyboard: false,
        zIndexOffset: -100,
      }),
    );
    doctors.forEach((d, i) => {
      const marker = L.marker([d.lat, d.lon], { icon: pinIcon(L, i + 1, d.name, false), title: d.name, riseOnHover: true });
      marker.on("click", () => select.current(d.id));
      group.addLayer(marker);
      markers.current.set(d.id, { marker, n: i + 1, name: d.name });
    });
    const bounds = L.latLngBounds([[origin.lat, origin.lon], ...doctors.map((d): [number, number] => [d.lat, d.lon])]);
    m.fitBounds(bounds, { padding: [36, 36], maxZoom: 16, animate: false });
  }, [ready, origin, doctors]);

  // Il segnaposto scelto cambia colore e, se serve, la mappa lo porta in vista
  useEffect(() => {
    const L = leaflet.current;
    const m = map.current;
    if (!ready || !L || !m) return;
    for (const [id, { marker, n, name }] of markers.current) {
      const selected = id === selectedId;
      marker.setIcon(pinIcon(L, n, name, selected));
      marker.setZIndexOffset(selected ? 1000 : 0);
      if (selected && !m.getBounds().pad(-0.1).contains(marker.getLatLng())) m.panTo(marker.getLatLng(), { animate: !reduced });
    }
  }, [ready, selectedId, reduced]);

  if (failed) {
    return <p className="rounded-3xl bg-surface-2 p-4 text-small">Non riusciamo a caricare la mappa. I risultati sono nella vista lista.</p>;
  }

  return (
    <div
      ref={container}
      role="region"
      aria-label="Mappa dei risultati. Usa le frecce per spostarla e i tasti più e meno per lo zoom."
      className="orienta-map h-[min(60vh,26rem)] w-full overflow-hidden rounded-3xl border border-line bg-surface-2"
    />
  );
}

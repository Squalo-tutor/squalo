"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Pin = { id: string; lat: number; lng: number; price: number };

type MapViewProps = {
  pins: Pin[];
  center: [number, number];
  zoom?: number;
  onSelect: (id: string) => void;
  flyTo?: { center: [number, number]; zoom: number } | null;
};

export default function MapView({ pins, center, zoom = 5, onSelect, flyTo }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = pins.map((pin) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:#06B6D4;color:white;font-weight:700;font-size:12px;padding:4px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(10,32,39,0.35);white-space:nowrap;border:2px solid white;">€${pin.price}</div>`,
        iconSize: undefined,
        iconAnchor: [22, 14],
      });
      const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(map);
      marker.on("click", () => onSelect(pin.id));
      return marker;
    });
  }, [pins, onSelect]);

  useEffect(() => {
    if (flyTo && mapRef.current) {
      mapRef.current.flyTo(flyTo.center, flyTo.zoom);
    }
  }, [flyTo]);

  // `isolate` crea un contesto di impilamento: i livelli interni di Leaflet
  // restano contenuti e non coprono i bottoni flottanti (es. lo squaletto chat).
  return <div ref={containerRef} className="isolate h-full w-full" />;
}

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
        html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-4px);">
          <div style="background:linear-gradient(180deg,#22D3EE,#0891b2);color:white;font-weight:800;font-size:12px;padding:5px 11px;border-radius:999px;box-shadow:0 6px 14px rgba(8,145,178,0.45);white-space:nowrap;border:2px solid white;">€${pin.price}</div>
          <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #0891b2;margin-top:-1px;filter:drop-shadow(0 2px 1px rgba(8,145,178,0.3));"></div>
        </div>`,
        iconSize: undefined,
        iconAnchor: [24, 30],
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

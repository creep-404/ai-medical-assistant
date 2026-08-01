'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPlace {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  distance_km?: number;
  is_registered?: boolean;
}

interface NearbyMapProps {
  center: { lat: number; lng: number };
  places: MapPlace[];
  selectedId?: string | null;
  onSelect?: (place: MapPlace) => void;
}

const TYPE_COLORS: Record<string, string> = {
  hospital: '#dc2626',
  clinic: '#d97706',
  doctor: '#059669',
  dentist: '#7c3aed',
  pharmacy: '#2563eb',
};

function markerIcon(place: MapPlace) {
  const color = place.is_registered
    ? '#2563eb'
    : TYPE_COLORS[place.type] || '#2563eb';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 24 42">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z" fill="${color}"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`;
  return L.divIcon({
    className: 'nearby-marker',
    html: svg,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
  });
}

export default function NearbyMap({ center, places, selectedId, onSelect }: NearbyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: 13,
      scrollWheelZoom: false,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);

    const userIcon = L.divIcon({
      className: 'nearby-marker',
      html: `
        <div style="width:18px;height:18px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(37,99,235,.3);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    L.marker([center.lat, center.lng], { icon: userIcon }).addTo(map).bindPopup('<b>Your location</b>');

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    places.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], { icon: markerIcon(place) }).addTo(layer);
      const distance = place.distance_km != null ? ` &bull; ${place.distance_km} km` : '';
      marker.bindPopup(
        `<strong>${place.name}</strong>${distance}<br/><span style="text-transform:capitalize">${place.type}</span>`
      );
      marker.on('click', () => {
        onSelect?.(place);
        map.setView([place.lat, place.lng], Math.max(map.getZoom(), 15));
      });
    });

    if (places.length > 0) {
      const bounds = L.latLngBounds([[center.lat, center.lng], ...places.map((p) => [p.lat, p.lng] as [number, number])]);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    } else {
      map.setView([center.lat, center.lng], 13);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, center.lat, center.lng]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersRef.current;
    if (!map || !layer || !selectedId) return;
    const place = places.find((p) => p.id === selectedId);
    if (place) map.setView([place.lat, place.lng], Math.max(map.getZoom(), 15));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return <div ref={containerRef} className="w-full h-full rounded-2xl" style={{ minHeight: 420 }} />;
}

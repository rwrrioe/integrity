import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPoint } from './MapView';

// Fix Leaflet default icon issue with CDN URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  points: MapPoint[];
  onPointClick: (point: MapPoint) => void;
  showHeatmap: boolean;
  showClusters: boolean;
}

export function LeafletMap({ points, onPointClick, showHeatmap, showClusters }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const kazakhstanBoundaryRef = useRef<L.Polygon | null>(null);
  const cssLoadedRef = useRef(false);

  // Load Leaflet CSS dynamically
  useEffect(() => {
    if (!cssLoadedRef.current) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css';
      document.head.appendChild(link);
      cssLoadedRef.current = true;
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on Kazakhstan
    const map = L.map(mapContainerRef.current).setView([48.0, 68.0], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Add Kazakhstan boundary (simplified outline)
    const kazakhstanCoords: [number, number][] = [
      [55.4, 50.3],
      [54.8, 61.0],
      [52.5, 69.0],
      [50.8, 73.5],
      [49.6, 82.5],
      [47.3, 87.3],
      [45.5, 87.0],
      [44.8, 85.0],
      [43.5, 80.5],
      [42.2, 75.0],
      [42.3, 70.0],
      [43.0, 65.0],
      [45.0, 58.0],
      [47.5, 52.0],
      [51.0, 51.0],
      [55.4, 50.3],
    ];

    const kazakhstanBoundary = L.polygon(kazakhstanCoords, {
      color: '#3b82f6',
      weight: 0,
      fillOpacity: 0,
      fillColor: '#3b82f6',
    }).addTo(map);

    kazakhstanBoundaryRef.current = kazakhstanBoundary;

    // Initialize markers layer
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when points change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    points.forEach((point) => {
      const color = 
        point.severity === 'critical' ? '#dc2626' :
        point.severity === 'high' ? '#f97316' :
        point.severity === 'medium' ? '#eab308' :
        '#22c55e';

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 12px;
          height: 12px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([point.lat, point.lng], { icon })
        .bindPopup(`
          <div style="min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${point.name}</div>
            <div style="font-size: 12px; color: #64748b;">
              <div>Pipeline: ${point.pipeline}</div>
              <div>Severity: <span style="color: ${color}; font-weight: bold;">${point.severity.toUpperCase()}</span></div>
              <div>Method: ${point.method}</div>
              <div>Date: ${point.date}</div>
            </div>
          </div>
        `)
        .on('click', () => {
          onPointClick(point);
        });

      marker.addTo(markersLayer);
    });
  }, [points, onPointClick]);

  return (
    <div ref={mapContainerRef} className="w-full h-full" />
  );
}

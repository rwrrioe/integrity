import { useState, useEffect } from 'react';
import { LatLngExpression } from 'leaflet';
import { LeafletMap } from './LeafletMap';
import { MapControls } from './MapControls';
import { LayerPanel } from './LayerPanel';
import { RegionSummaryPanel } from './RegionSummaryPanel';
import { AIAnalyticsPanel } from '../ai/AIAnalyticsPanel';
import { mockPipelines, mockObjects } from '../data/mockData';
import { api, endpoints } from '../../../services/api'; 

export function MainMapView() {
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [clusterEnabled, setClusterEnabled] = useState(true);
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [selectedDefect, setSelectedDefect] = useState<any>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [mapPoints, setMapPoints] = useState<any[]>([]); 

  useEffect(() => {
    const fetchHeatmap = async () => {
        try {
            const res = await api.get(endpoints.heatmap);
            if (res.data && res.data.heatmap) {
              
                const mapped = res.data.heatmap.map((p: any) => ({
                    id: p.id,
                    lat: p.lat,
                    lng: p.lon, 
                    severity: mapClassToSeverity(p.class),
                    type: 'Defect', 
                    method: 'Unknown',
                    date: new Date().toISOString().split('T')[0]
                }));
                setMapPoints(mapped);
            }
        } catch (e) {
            console.error("Failed to fetch heatmap", e);
        }
    };
    fetchHeatmap();
  }, []);

  const mapClassToSeverity = (cls: number) => {
      if (cls === 5) return 'critical';
      if (cls === 4) return 'high';
      if (cls === 6) return 'medium';
      return 'low';
  }

  // Layers visibility
  const [layers, setLayers] = useState({
    kazBoundary: true,
    defects: true,
    pipelines: true,
    objects: true,
    heatmap: false,
  });

  
  const kazakhstanCenter: LatLngExpression = [48.0196, 66.9237];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#64748b';
    }
  };

  const handleMarkerClick = (defect: any) => {
    setSelectedDefect(defect);
    setAiPanelOpen(true);
  };

  const toggleLayer = (layerName: string) => {
    setLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const markers = layers.defects
    ? mapPoints.map((defect) => ({
        position: [defect.lat, defect.lng] as [number, number],
        popup: `
          <div class="p-2">
            <p class="text-slate-900 mb-1">Defect #${defect.id}</p>
            <p class="text-slate-600">Severity: <span style="color: ${getSeverityColor(defect.severity)}">${defect.severity}</span></p>
          </div>
        `,
        onClick: () => handleMarkerClick(defect),
      }))
    : [];

  const circles = [
    ...(layers.kazBoundary
      ? [
          {
            center: kazakhstanCenter as [number, number],
            radius: 500000,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0,
            weight: 0,
          },
        ]
      : []),
    ...(layers.objects
      ? mockObjects.map((obj) => ({
          center: obj.coordinates as [number, number],
          radius: 5000,
          color: '#8b5cf6',
          fillColor: '#8b5cf6',
          fillOpacity: 0.4,
          weight: 2,
        }))
      : []),
  ];

  const polylines = layers.pipelines
    ? mockPipelines.map((pipeline) => ({
        positions: pipeline.coordinates as [number, number][],
        color: pipeline.status === 'active' ? '#22c55e' : '#ef4444',
        weight: 3,
        opacity: 0.8,
      }))
    : [];

  return (
    <div className="relative w-full h-full">
      <LeafletMap
        center={kazakhstanCenter as [number, number]}
        zoom={6}
        className="w-full h-full"
        markers={markers}
        circles={circles}
        polylines={polylines}
      />

      <MapControls
        heatmapEnabled={heatmapEnabled}
        clusterEnabled={clusterEnabled}
        onToggleHeatmap={() => {
          setHeatmapEnabled(!heatmapEnabled);
          toggleLayer('heatmap');
        }}
        onToggleCluster={() => setClusterEnabled(!clusterEnabled)}
        onToggleLayers={() => setLayerPanelOpen(!layerPanelOpen)}
      />

      {layerPanelOpen && (
        <LayerPanel
          layers={layers}
          onToggleLayer={toggleLayer}
          onClose={() => setLayerPanelOpen(false)}
        />
      )}

      {selectedRegion && (
        <RegionSummaryPanel
          region={selectedRegion}
          onClose={() => setSelectedRegion(null)}
        />
      )}

      {aiPanelOpen && selectedDefect && (
        <AIAnalyticsPanel
          defect={selectedDefect}
          onClose={() => {
            setAiPanelOpen(false);
            setSelectedDefect(null);
          }}
        />
      )}
    </div>
  );
}
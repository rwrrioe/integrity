import React, { useState } from 'react';
import { LeafletMap } from './LeafletMap';
import { PointDetailPanel } from './PointDetailPanel';
import { MapControls } from './MapControls';
import { Layers, Filter, ZoomIn, ZoomOut } from 'lucide-react';

export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  method: 'MFL' | 'UT' | 'Visual' | 'ACFM';
  date: string;
  pipeline: string;
  param1: number;
  param2: number;
  param3: number;
}

// Mock data for Kazakhstan pipelines
const generateMockPoints = (): MapPoint[] => {
  const points: MapPoint[] = [];
  const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
  const methods: Array<'MFL' | 'UT' | 'Visual' | 'ACFM'> = ['MFL', 'UT', 'Visual', 'ACFM'];
  const pipelines = ['MT-01', 'MT-02', 'MT-03'];

  // Generate points along Kazakhstan pipelines (approximate coordinates)
  for (let i = 0; i < 150; i++) {
    const lat = 48 + Math.random() * 4; // Southern Kazakhstan
    const lng = 65 + Math.random() * 15;
    
    points.push({
      id: `point-${i}`,
      name: `Object ${i + 1}`,
      lat,
      lng,
      severity: severities[Math.floor(Math.random() * severities.length)],
      method: methods[Math.floor(Math.random() * methods.length)],
      date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      pipeline: pipelines[Math.floor(Math.random() * pipelines.length)],
      param1: Math.random() * 100,
      param2: Math.random() * 50,
      param3: Math.random() * 200,
    });
  }

  return points;
};

export function MapView() {
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    method: 'all',
    severity: 'all',
    pipeline: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const [mockPoints] = useState(() => generateMockPoints());

  const filteredPoints = mockPoints.filter(point => {
    if (filters.method !== 'all' && point.method !== filters.method) return false;
    if (filters.severity !== 'all' && point.severity !== filters.severity) return false;
    if (filters.pipeline !== 'all' && point.pipeline !== filters.pipeline) return false;
    if (filters.dateFrom && point.date < filters.dateFrom) return false;
    if (filters.dateTo && point.date > filters.dateTo) return false;
    return true;
  });

  return (
    <div className="relative h-full">
      {/* Map */}
      <LeafletMap
        points={filteredPoints}
        onPointClick={setSelectedPoint}
        showHeatmap={showHeatmap}
        showClusters={showClusters}
      />

      {/* Map Controls - Top Right */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
            showHeatmap ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-red-600"></div>
          Heatmap
        </button>

        <button
          onClick={() => setShowClusters(!showClusters)}
          className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
            showClusters ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
          }`}
        >
          <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
            <div className="bg-current rounded-sm"></div>
            <div className="bg-current rounded-sm"></div>
            <div className="bg-current rounded-sm"></div>
            <div className="bg-current rounded-sm"></div>
          </div>
          Clusters
        </button>

        <button
          onClick={() => setShowLayers(!showLayers)}
          className="w-full px-4 py-2 bg-white rounded-lg shadow-lg flex items-center gap-2 hover:bg-slate-50"
        >
          <Layers className="w-5 h-5" />
          Layers
        </button>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-4 py-2 bg-white rounded-lg shadow-lg flex items-center gap-2 hover:bg-slate-50"
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Layers Panel */}
      {showLayers && (
        <div className="absolute top-4 right-56 z-[1000] w-64 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-slate-900 mb-3">Map Layers</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-slate-700">Kazakhstan Boundary</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-slate-700">Pipeline Routes</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-slate-700">Inspection Points</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-slate-700">Satellite View</span>
            </label>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-4 right-56 z-[1000] w-80 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-slate-900 mb-3">Filters</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 mb-1">Method</label>
              <select
                value={filters.method}
                onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Methods</option>
                <option value="MFL">MFL</option>
                <option value="UT">UT</option>
                <option value="Visual">Visual</option>
                <option value="ACFM">ACFM</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Pipeline</label>
              <select
                value={filters.pipeline}
                onChange={(e) => setFilters({ ...filters, pipeline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Pipelines</option>
                <option value="MT-01">MT-01</option>
                <option value="MT-02">MT-02</option>
                <option value="MT-03">MT-03</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              onClick={() => setFilters({ method: 'all', severity: 'all', pipeline: 'all', dateFrom: '', dateTo: '' })}
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Point Detail Panel */}
      {selectedPoint && (
        <PointDetailPanel
          point={selectedPoint}
          onClose={() => setSelectedPoint(null)}
        />
      )}

      {/* Stats Bar - Bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-lg p-4 flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <div className="text-slate-600">Total Points</div>
              <div className="text-slate-900">{filteredPoints.length}</div>
            </div>
            <div>
              <div className="text-slate-600">Critical</div>
              <div className="text-red-600">{filteredPoints.filter(p => p.severity === 'critical').length}</div>
            </div>
            <div>
              <div className="text-slate-600">High</div>
              <div className="text-orange-600">{filteredPoints.filter(p => p.severity === 'high').length}</div>
            </div>
            <div>
              <div className="text-slate-600">Medium</div>
              <div className="text-yellow-600">{filteredPoints.filter(p => p.severity === 'medium').length}</div>
            </div>
            <div>
              <div className="text-slate-600">Low</div>
              <div className="text-green-600">{filteredPoints.filter(p => p.severity === 'low').length}</div>
            </div>
          </div>
          <div className="text-slate-600">
            Active Filters: {Object.values(filters).filter(v => v && v !== 'all').length}
          </div>
        </div>
      </div>
    </div>
  );
}

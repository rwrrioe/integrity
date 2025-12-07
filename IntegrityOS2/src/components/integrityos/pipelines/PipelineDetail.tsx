import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import L from 'leaflet';

export function PipelineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'objects' | 'defects' | 'tasks'>('overview');

  const pipelineData = {
    id,
    name: `Main Transport ${id?.split('-')[1]}`,
    length: '450 km',
    objects: 412,
    defects: 45,
    status: 'active',
    lastInspection: '2024-11-28',
    riskScore: 7.5,
  };

  // Task status data
  const taskStatusData = [
    { name: 'Created', value: 5, color: '#3b82f6' },
    { name: 'In Progress', value: 8, color: '#eab308' },
    { name: 'Resolved', value: 12, color: '#22c55e' },
  ];

  const objects = Array.from({ length: 10 }, (_, i) => ({
    id: `obj-${i + 1}`,
    name: `Object ${i + 1}`,
    location: `KM ${(Math.random() * 450).toFixed(1)}`,
    severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
    lastInspection: '2024-11-28',
  }));

  const defects = Array.from({ length: 8 }, (_, i) => ({
    id: `def-${i + 1}`,
    type: ['Corrosion', 'Metal Loss', 'Crack', 'Dent'][Math.floor(Math.random() * 4)],
    severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
    location: `KM ${(Math.random() * 450).toFixed(1)}`,
    depth: `${(Math.random() * 60 + 20).toFixed(0)}%`,
  }));

  // Initialize mini-map
  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([48.5, 68.0], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Draw pipeline route (mock coordinates)
    const pipelineRoute: [number, number][] = [
      [48.0, 65.5],
      [48.3, 67.0],
      [48.8, 69.0],
      [49.2, 71.0],
      [49.5, 73.0],
    ];

    L.polyline(pipelineRoute, { color: '#3b82f6', weight: 3 }).addTo(map);

    // Add some markers
    pipelineRoute.forEach((coord, idx) => {
      if (idx % 2 === 0) {
        L.circleMarker(coord, {
          radius: 6,
          fillColor: '#ef4444',
          color: '#fff',
          weight: 2,
          fillOpacity: 0.8,
        }).addTo(map);
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="h-full overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/pipelines')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Pipelines
          </button>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-slate-900 mb-2">{pipelineData.name}</h1>
                <div className="flex items-center gap-4 text-slate-600">
                  <span>ID: {pipelineData.id}</span>
                  <span>Length: {pipelineData.length}</span>
                  <span>Last Inspection: {pipelineData.lastInspection}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
                  {pipelineData.status.toUpperCase()}
                </span>
                <div className="flex items-center gap-1 text-orange-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{pipelineData.riskScore}/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-slate-600 mb-1">Total Objects</div>
            <div className="text-slate-900">{pipelineData.objects}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-slate-600 mb-1">Total Defects</div>
            <div className="text-orange-600">{pipelineData.defects}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-slate-600 mb-1">Critical Issues</div>
            <div className="text-red-600">8</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-slate-600 mb-1">Risk Score</div>
            <div className="text-orange-600">{pipelineData.riskScore}/10</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Mini Map */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-slate-900 mb-4">Pipeline Route</h2>
            <div ref={mapRef} className="w-full h-96 rounded-lg overflow-hidden"></div>
          </div>

          {/* Task Status Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-slate-900 mb-4">Task Status</h2>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {taskStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-slate-200 px-6">
            <div className="flex gap-6">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'objects', label: 'Objects' },
                { key: 'defects', label: 'Defects' },
                { key: 'tasks', label: 'Tasks' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-slate-900 mb-4">Pipeline Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-slate-600">Diameter</div>
                    <div className="text-slate-900">1020 mm</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-slate-600">Material</div>
                    <div className="text-slate-900">Steel X65</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-slate-600">Commissioned</div>
                    <div className="text-slate-900">1998</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-slate-600">Operating Pressure</div>
                    <div className="text-slate-900">75 bar</div>
                  </div>
                </div>
              </div>
            )}

            {/* Objects Tab */}
            {activeTab === 'objects' && (
              <div>
                <h3 className="text-slate-900 mb-4">Objects Along Pipeline</h3>
                <div className="space-y-2">
                  {objects.map((obj) => (
                    <div key={obj.id} className="p-3 border border-slate-200 rounded-lg hover:border-blue-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-slate-900">{obj.name}</div>
                          <div className="text-slate-600">{obj.location}</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          obj.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          obj.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          obj.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {obj.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Defects Tab */}
            {activeTab === 'defects' && (
              <div>
                <h3 className="text-slate-900 mb-4">Defects Summary</h3>
                <div className="space-y-2">
                  {defects.map((defect) => (
                    <div key={defect.id} className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span className="text-slate-900">{defect.type}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          defect.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          defect.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          defect.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {defect.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-slate-600">
                        <span>Location: {defect.location}</span>
                        <span>Depth: {defect.depth}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div>
                <h3 className="text-slate-900 mb-4">Pipeline Tasks</h3>
                <p className="text-slate-600">Task management for this pipeline.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
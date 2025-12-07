import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Activity, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import L from 'leaflet';

export function ObjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'defects' | 'history' | 'ai'>('overview');

  // Mock data
  const objectData = {
    id,
    name: `Object ${id?.split('-')[1]}`,
    lat: 48.5 + Math.random(),
    lng: 68.0 + Math.random() * 5,
    severity: 'high',
    method: 'MFL',
    date: '2024-11-15',
    pipeline: 'MT-01',
    param1: 85.3,
    param2: 42.1,
    param3: 156.7,
  };

  const defects = [
    { id: 1, type: 'Corrosion', severity: 'high', depth: '45%', length: '150mm', position: 'KM 125.3' },
    { id: 2, type: 'Metal Loss', severity: 'medium', depth: '30%', length: '80mm', position: 'KM 125.5' },
    { id: 3, type: 'Crack', severity: 'critical', depth: '60%', length: '200mm', position: 'KM 126.1' },
  ];

  const inspectionHistory = [
    { date: '2024-11-15', inspector: 'John Smith', method: 'MFL', findings: '3 defects detected' },
    { date: '2024-05-20', inspector: 'Sarah Johnson', method: 'UT', findings: '2 defects detected' },
    { date: '2023-11-10', inspector: 'Mike Davis', method: 'Visual', findings: 'No major issues' },
  ];

  const mapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([objectData.lat, objectData.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    L.marker([objectData.lat, objectData.lng])
      .addTo(map)
      .bindPopup(objectData.name)
      .openPopup();

    return () => {
      map.remove();
    };
  }, [objectData.lat, objectData.lng, objectData.name]);

  return (
    <div className="h-full overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Map
          </button>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-slate-900 mb-2">{objectData.name}</h1>
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{objectData.lat.toFixed(6)}, {objectData.lng.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{objectData.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>{objectData.method}</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg border border-orange-200">
                HIGH SEVERITY
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-slate-200 px-6">
            <div className="flex gap-6">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'defects', label: 'Defects' },
                { key: 'history', label: 'Inspection History' },
                { key: 'ai', label: 'AI Prediction' },
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Metadata */}
                <div>
                  <h3 className="text-slate-900 mb-4">Object Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Pipeline</span>
                      <span className="text-slate-900">{objectData.pipeline}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Method</span>
                      <span className="text-slate-900">{objectData.method}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Parameter 1</span>
                      <span className="text-slate-900">{objectData.param1.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Parameter 2</span>
                      <span className="text-slate-900">{objectData.param2.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Parameter 3</span>
                      <span className="text-slate-900">{objectData.param3.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Mini Map */}
                <div>
                  <h3 className="text-slate-900 mb-4">Location</h3>
                  <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden"></div>
                </div>
              </div>
            )}

            {/* Defects Tab */}
            {activeTab === 'defects' && (
              <div>
                <h3 className="text-slate-900 mb-4">Detected Defects</h3>
                <div className="space-y-3">
                  {defects.map((defect) => (
                    <div
                      key={defect.id}
                      className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          <span className="text-slate-900">{defect.type}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          defect.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          defect.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {defect.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-slate-600">Depth</div>
                          <div className="text-slate-900">{defect.depth}</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Length</div>
                          <div className="text-slate-900">{defect.length}</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Position</div>
                          <div className="text-slate-900">{defect.position}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-slate-900 mb-4">Inspection History</h3>
                <div className="space-y-3">
                  {inspectionHistory.map((inspection, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-slate-600" />
                          <span className="text-slate-900">{inspection.date}</span>
                        </div>
                        <span className="text-slate-600">{inspection.method}</span>
                      </div>
                      <div className="text-slate-600">Inspector: {inspection.inspector}</div>
                      <div className="text-slate-900 mt-1">{inspection.findings}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Prediction Tab */}
            {activeTab === 'ai' && (
              <div>
                <h3 className="text-slate-900 mb-4">AI Prediction & Analysis</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-900">Failure Probability</span>
                    </div>
                    <div className="text-2xl text-blue-900 mb-2">68%</div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h4 className="text-slate-900 mb-3">Feature Importance</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">Corrosion Depth</span>
                          <span className="text-slate-900">85%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">Defect Length</span>
                          <span className="text-slate-900">72%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">Pipeline Age</span>
                          <span className="text-slate-900">56%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '56%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-900">
                      <strong>Note:</strong> AI prediction logic is implemented by ML teammate.
                      These are mock values for UI demonstration.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { X, AlertTriangle, Box, Activity, Thermometer, Gauge } from 'lucide-react';

interface RegionSummaryPanelProps {
  region: any;
  onClose: () => void;
}

export function RegionSummaryPanel({ region, onClose }: RegionSummaryPanelProps) {
  // Mock aggregated data for clicked region
  const regionData = {
    name: 'Atyrau Region',
    defectCount: 247,
    objectCount: 38,
    topRisks: [
      { type: 'Corrosion', count: 89, severity: 'high' },
      { type: 'Crack', count: 54, severity: 'critical' },
      { type: 'Wall Thinning', count: 47, severity: 'medium' },
    ],
    diagnosticsCount: 1243,
    sensors: {
      temperature: { value: 42.3, unit: '°C', status: 'normal' },
      vibration: { value: 2.1, unit: 'mm/s', status: 'normal' },
    },
  };

  return (
    <div className="absolute top-20 left-4 w-96 bg-white rounded-lg shadow-xl z-[1000] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-white">Region Summary</h3>
          <p className="text-blue-100">{regionData.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-500 rounded text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-slate-700">Defects</span>
            </div>
            <p className="text-red-600">{regionData.defectCount}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Box className="w-4 h-4 text-purple-600" />
              <span className="text-slate-700">Objects</span>
            </div>
            <p className="text-purple-600">{regionData.objectCount}</p>
          </div>
        </div>

        {/* Top Risks */}
        <div>
          <h4 className="text-slate-900 mb-2">Top Risks</h4>
          <div className="space-y-2">
            {regionData.topRisks.map((risk, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-slate-50 rounded"
              >
                <div>
                  <p className="text-slate-700">{risk.type}</p>
                  <p className="text-slate-500">{risk.count} occurrences</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-white ${
                    risk.severity === 'critical'
                      ? 'bg-red-600'
                      : risk.severity === 'high'
                      ? 'bg-orange-600'
                      : 'bg-yellow-600'
                  }`}
                >
                  {risk.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostics */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-slate-700">Total Diagnostics</span>
          </div>
          <p className="text-blue-600">{regionData.diagnosticsCount} inspections</p>
        </div>

        {/* Sensor Readings */}
        <div>
          <h4 className="text-slate-900 mb-2">Latest Sensor Readings</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-600" />
                <span className="text-slate-700">Temperature</span>
              </div>
              <div className="text-right">
                <p className="text-slate-900">
                  {regionData.sensors.temperature.value}{' '}
                  {regionData.sensors.temperature.unit}
                </p>
                <p className="text-green-600">{regionData.sensors.temperature.status}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-blue-600" />
                <span className="text-slate-700">Vibration</span>
              </div>
              <div className="text-right">
                <p className="text-slate-900">
                  {regionData.sensors.vibration.value}{' '}
                  {regionData.sensors.vibration.unit}
                </p>
                <p className="text-green-600">{regionData.sensors.vibration.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

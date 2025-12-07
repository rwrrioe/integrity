import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, AlertCircle } from 'lucide-react';

export function Sensors() {
  // Accelerometer A1 data
  const accelerometerA1Data = [
    { time: '00:00', x: 0.12, y: 0.15, z: 9.81 },
    { time: '04:00', x: 0.14, y: 0.13, z: 9.82 },
    { time: '08:00', x: 0.18, y: 0.16, z: 9.80 },
    { time: '12:00', x: 0.25, y: 0.22, z: 9.79 },
    { time: '16:00', x: 0.21, y: 0.18, z: 9.81 },
    { time: '20:00', x: 0.16, y: 0.14, z: 9.82 },
    { time: '24:00', x: 0.13, y: 0.15, z: 9.81 },
  ];

  // Accelerometer A2 data (with anomaly)
  const accelerometerA2Data = [
    { time: '00:00', x: 0.11, y: 0.14, z: 9.80 },
    { time: '04:00', x: 0.13, y: 0.15, z: 9.81 },
    { time: '08:00', x: 0.15, y: 0.17, z: 9.79 },
    { time: '12:00', x: 1.25, y: 1.35, z: 9.45 },
    { time: '16:00', x: 0.92, y: 0.88, z: 9.62 },
    { time: '20:00', x: 0.18, y: 0.16, z: 9.79 },
    { time: '24:00', x: 0.14, y: 0.15, z: 9.80 },
  ];

  return (
    <div className="h-full overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900">Sensors</h1>
              <p className="text-slate-600">Vibration and accelerometer monitoring</p>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
          <div>
            <div className="text-orange-900">Vibration Anomaly Detected</div>
            <div className="text-orange-700">
              Accelerometer A2 detected unusual vibration patterns at 12:00. Review recommended.
            </div>
          </div>
        </div>

        {/* Accelerometer A1 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-slate-900">Accelerometer A1</h2>
                <p className="text-slate-600">MT-01 Pipeline - KM 125.3</p>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded">
                Normal
              </div>
            </div>
          </div>
          <div className="p-6">
            <div style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accelerometerA1Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="x" stroke="#ef4444" name="X-Axis (m/s²)" strokeWidth={2} />
                  <Line type="monotone" dataKey="y" stroke="#3b82f6" name="Y-Axis (m/s²)" strokeWidth={2} />
                  <Line type="monotone" dataKey="z" stroke="#22c55e" name="Z-Axis (m/s²)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-red-700">X-Axis Average</div>
                <div className="text-red-900">0.17 m/s²</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-700">Y-Axis Average</div>
                <div className="text-blue-900">0.16 m/s²</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-green-700">Z-Axis Average</div>
                <div className="text-green-900">9.81 m/s²</div>
              </div>
            </div>
          </div>
        </div>

        {/* Accelerometer A2 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-slate-900">Accelerometer A2</h2>
                <p className="text-slate-600">MT-02 Pipeline - KM 203.7</p>
              </div>
              <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded">
                Anomaly Detected
              </div>
            </div>
          </div>
          <div className="p-6">
            <div style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accelerometerA2Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="x" stroke="#ef4444" name="X-Axis (m/s²)" strokeWidth={2} />
                  <Line type="monotone" dataKey="y" stroke="#3b82f6" name="Y-Axis (m/s²)" strokeWidth={2} />
                  <Line type="monotone" dataKey="z" stroke="#22c55e" name="Z-Axis (m/s²)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-red-700">X-Axis Average</div>
                <div className="text-red-900">0.41 m/s²</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-700">Y-Axis Average</div>
                <div className="text-blue-900">0.43 m/s²</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-green-700">Z-Axis Average</div>
                <div className="text-green-900">9.72 m/s²</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="text-orange-900 mb-2">Anomaly Analysis</h3>
              <p className="text-orange-700">
                Significant spike detected at 12:00 with X-axis reaching 1.25 m/s² and Y-axis reaching 1.35 m/s².
                This indicates potential mechanical vibration or structural movement. Immediate inspection recommended.
              </p>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-slate-900 mb-4">Vibration Anomaly Detection</h2>
          <div className="space-y-3 text-slate-700">
            <p>
              The IntegrityOS platform continuously monitors accelerometer data from sensors deployed
              along pipeline infrastructure to detect vibration anomalies that may indicate:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Mechanical equipment malfunction</li>
              <li>Structural instability or settling</li>
              <li>External interference or impact</li>
              <li>Fluid flow irregularities</li>
              <li>Ground movement or seismic activity</li>
            </ul>
            <p className="mt-4">
              <strong>Detection Threshold:</strong> Vibrations exceeding 0.5 m/s² in X or Y axes, or deviation
              of more than 0.2 m/s² from expected Z-axis gravity (9.81 m/s²) trigger automatic alerts.
            </p>
            <p className="mt-4">
              <strong>Response Protocol:</strong> When anomalies are detected, the system automatically:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Generates alert notifications for inspection teams</li>
              <li>Logs the event with timestamp and sensor location</li>
              <li>Increases monitoring frequency for affected sensors</li>
              <li>Creates a task for on-site investigation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

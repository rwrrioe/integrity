import { X, MapPin, Activity, AlertTriangle } from 'lucide-react';
import { LeafletMap } from '../map/LeafletMap';

interface DefectDetailCardProps {
  defect: any;
  onClose: () => void;
}

export function DefectDetailCard({ defect, onClose }: DefectDetailCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Mock diagnostics data
  const diagnostics = [
    { date: '2024-11-28', method: 'ILI', result: 'Confirmed', technician: 'J. Smith' },
    { date: '2024-11-15', method: 'UT', result: 'Follow-up Required', technician: 'A. Johnson' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              {defect.type}
            </h2>
            <p className="text-slate-600">{defect.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded ${getSeverityColor(defect.severity)}`}>
              {defect.severity}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-slate-900 mb-3">Defect Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Type</p>
                <p className="text-slate-900">{defect.type}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Method</p>
                <p className="text-slate-900">{defect.method}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Date</p>
                <p className="text-slate-900">{defect.date}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Pipeline</p>
                <p className="text-slate-900">{defect.pipelineId}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Coordinates</p>
                <p className="text-slate-900">
                  {defect.coordinates[0].toFixed(4)}, {defect.coordinates[1].toFixed(4)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Severity</p>
                <p className="text-slate-900">{defect.severity}</p>
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div>
            <h3 className="text-slate-900 mb-3">Measurement Parameters</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-slate-700 mb-1">Parameter 1</p>
                <p className="text-blue-600">{defect.param1}</p>
                <p className="text-slate-600">Wall Thickness (mm)</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-slate-700 mb-1">Parameter 2</p>
                <p className="text-purple-600">{defect.param2}</p>
                <p className="text-slate-600">Depth (%)</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-slate-700 mb-1">Parameter 3</p>
                <p className="text-green-600">{defect.param3}</p>
                <p className="text-slate-600">Confidence Score</p>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div>
            <h3 className="text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h3>
            <div className="h-64 rounded-lg overflow-hidden border border-slate-200">
              <LeafletMap
                center={defect.coordinates as [number, number]}
                zoom={10}
                className="w-full h-full"
                markers={[
                  {
                    position: defect.coordinates as [number, number],
                    popup: `
                      <div class="p-2">
                        <p class="text-slate-900 mb-1">${defect.type}</p>
                        <p class="text-slate-600">Severity: ${defect.severity}</p>
                      </div>
                    `,
                  },
                ]}
              />
            </div>
          </div>

          {/* Related Diagnostics */}
          <div>
            <h3 className="text-slate-900 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Related Diagnostics
            </h3>
            <div className="space-y-2">
              {diagnostics.map((diag, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-900">{diag.date}</p>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        diag.result === 'Confirmed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {diag.result}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Method: {diag.method}</span>
                    <span>Technician: {diag.technician}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Schedule Repair
            </button>
            <button className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

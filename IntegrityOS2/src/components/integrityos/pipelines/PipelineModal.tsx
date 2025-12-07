import { X, MapPin, AlertTriangle } from 'lucide-react';
import { LeafletMap } from '../map/LeafletMap';
import { mockDefects } from '../data/mockData';

interface PipelineModalProps {
  pipeline: any;
  onClose: () => void;
}

export function PipelineModal({ pipeline, onClose }: PipelineModalProps) {
  const relatedDefects = mockDefects.filter((d) => d.pipelineId === pipeline.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 mb-1">{pipeline.name}</h2>
            <p className="text-slate-600">{pipeline.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-600 mb-1">Length</p>
              <p className="text-slate-900">{pipeline.length} km</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-600 mb-1">Diameter</p>
              <p className="text-slate-900">{pipeline.diameter}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-600 mb-1">Material</p>
              <p className="text-slate-900">{pipeline.material}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-600 mb-1">Pressure</p>
              <p className="text-slate-900">{pipeline.pressure}</p>
            </div>
          </div>

          {/* Map */}
          <div>
            <h3 className="text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Pipeline Route
            </h3>
            <div className="h-64 rounded-lg overflow-hidden border border-slate-200">
              <LeafletMap
                center={pipeline.coordinates[0] as [number, number]}
                zoom={8}
                className="w-full h-full"
                polylines={[
                  {
                    positions: pipeline.coordinates as [number, number][],
                    color: pipeline.status === 'active' ? '#22c55e' : '#ef4444',
                    weight: 3,
                    opacity: 0.8,
                  },
                ]}
                markers={relatedDefects.map((defect) => ({
                  position: defect.coordinates as [number, number],
                  popup: `
                    <div class="p-2">
                      <p class="text-slate-900 mb-1">${defect.type}</p>
                      <p class="text-slate-600">Severity: ${defect.severity}</p>
                    </div>
                  `,
                }))}
              />
            </div>
          </div>

          {/* Related Defects */}
          <div>
            <h3 className="text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Related Defects ({relatedDefects.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {relatedDefects.length > 0 ? (
                relatedDefects.map((defect) => (
                  <div key={defect.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-slate-900">{defect.type}</p>
                      <p className="text-slate-600">{defect.id}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        defect.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : defect.severity === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : defect.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {defect.severity}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-600">No defects found</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              View Full Details
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

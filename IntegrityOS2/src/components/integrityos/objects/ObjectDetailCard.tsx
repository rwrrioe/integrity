import { X, MapPin, Activity } from 'lucide-react';
import { LeafletMap } from '../map/LeafletMap';

interface ObjectDetailCardProps {
  object: any;
  onClose: () => void;
}

export function ObjectDetailCard({ object, onClose }: ObjectDetailCardProps) {
  // Mock maintenance history
  const maintenanceHistory = [
    { date: '2024-11-20', type: 'Routine Inspection', status: 'Completed', technician: 'J. Smith' },
    { date: '2024-10-15', type: 'Equipment Upgrade', status: 'Completed', technician: 'M. Johnson' },
    { date: '2024-09-05', type: 'Preventive Maintenance', status: 'Completed', technician: 'R. Williams' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 mb-1">{object.name}</h2>
            <p className="text-slate-600">{object.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded ${
                object.status === 'operational'
                  ? 'bg-green-100 text-green-700'
                  : object.status === 'maintenance'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {object.status}
            </span>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-slate-900 mb-3">Object Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Type</p>
                <p className="text-slate-900">{object.type}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Status</p>
                <p className="text-slate-900">{object.status}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Coordinates</p>
                <p className="text-slate-900">
                  {object.coordinates[0].toFixed(4)}, {object.coordinates[1].toFixed(4)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Capacity</p>
                <p className="text-slate-900">{object.capacity || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Last Inspection</p>
                <p className="text-slate-900">{object.lastInspection || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-1">Next Maintenance</p>
                <p className="text-slate-900">{object.nextMaintenance || 'N/A'}</p>
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
                center={object.coordinates as [number, number]}
                zoom={10}
                className="w-full h-full"
                circles={[
                  {
                    center: object.coordinates as [number, number],
                    radius: 5000,
                    color: '#8b5cf6',
                    fillColor: '#8b5cf6',
                    fillOpacity: 0.4,
                    weight: 2,
                  },
                ]}
              />
            </div>
          </div>

          {/* Maintenance History */}
          <div>
            <h3 className="text-slate-900 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Maintenance History
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {maintenanceHistory.map((record, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-900">{record.date}</p>
                    <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-700">
                      {record.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Type: {record.type}</span>
                    <span>Technician: {record.technician}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Schedule Maintenance
            </button>
            <button className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
              View Full History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPoint } from './MapView';
import { X, MapPin, Calendar, Activity, FileText, ExternalLink } from 'lucide-react';

interface PointDetailPanelProps {
  point: MapPoint;
  onClose: () => void;
}

export function PointDetailPanel({ point, onClose }: PointDetailPanelProps) {
  const navigate = useNavigate();

  const severityColor =
    point.severity === 'critical' ? 'text-red-600 bg-red-50 border-red-200' :
    point.severity === 'high' ? 'text-orange-600 bg-orange-50 border-orange-200' :
    point.severity === 'medium' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
    'text-green-600 bg-green-50 border-green-200';

  return (
    <div className="absolute top-0 right-0 bottom-0 w-96 bg-white shadow-xl z-[1001] flex flex-col">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-slate-900">Object Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Object Name */}
        <div>
          <h3 className="text-slate-900">{point.name}</h3>
          <div className="flex items-center gap-2 text-slate-600 mt-1">
            <MapPin className="w-4 h-4" />
            <span>{point.lat.toFixed(6)}, {point.lng.toFixed(6)}</span>
          </div>
        </div>

        {/* Severity */}
        <div>
          <div className="text-slate-700 mb-2">Severity</div>
          <div className={`inline-block px-3 py-1 rounded-lg border ${severityColor}`}>
            {point.severity.toUpperCase()}
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Pipeline</span>
            <span className="text-slate-900">{point.pipeline}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">Method</span>
            <span className="text-slate-900">{point.method}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">Inspection Date</span>
            <span className="text-slate-900">{point.date}</span>
          </div>
        </div>

        {/* Parameters */}
        <div>
          <div className="text-slate-700 mb-2">Parameters</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Parameter 1</span>
              <span className="text-slate-900">{point.param1.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Parameter 2</span>
              <span className="text-slate-900">{point.param2.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Parameter 3</span>
              <span className="text-slate-900">{point.param3.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-blue-600">Defects</div>
            <div className="text-blue-900">3</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-purple-600">Risk Score</div>
            <div className="text-purple-900">7.5/10</div>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => navigate(`/objects/${point.id}`)}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-5 h-5" />
          Open Full Details
        </button>
      </div>
    </div>
  );
}

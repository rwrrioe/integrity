import { X, Eye, EyeOff } from 'lucide-react';

interface LayerPanelProps {
  layers: {
    kazBoundary: boolean;
    defects: boolean;
    pipelines: boolean;
    objects: boolean;
    heatmap: boolean;
  };
  onToggleLayer: (layerName: string) => void;
  onClose: () => void;
}

export function LayerPanel({ layers, onToggleLayer, onClose }: LayerPanelProps) {
  const layerConfig = [
    { key: 'kazBoundary', label: 'Kazakhstan Boundary', color: 'bg-blue-500' },
    { key: 'defects', label: 'Defect Markers', color: 'bg-red-500' },
    { key: 'pipelines', label: 'Pipeline Polylines', color: 'bg-green-500' },
    { key: 'objects', label: 'Object Markers', color: 'bg-purple-500' },
    { key: 'heatmap', label: 'Heatmap Layer', color: 'bg-orange-500' },
  ];

  return (
    <div className="absolute top-20 right-4 w-80 bg-white rounded-lg shadow-xl z-[1000] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900">Map Layers</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="space-y-3">
        {layerConfig.map((layer) => (
          <div
            key={layer.key}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${layer.color}`}></div>
              <span className="text-slate-700">{layer.label}</span>
            </div>
            <button
              onClick={() => onToggleLayer(layer.key)}
              className="p-1 hover:bg-slate-200 rounded"
            >
              {layers[layer.key as keyof typeof layers] ? (
                <Eye className="w-5 h-5 text-blue-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-slate-700 mb-1">📍 GeoJSON Integration</p>
        <p className="text-slate-600">
          The Kazakhstan boundary layer loads from kz_1.json at runtime. This
          provides regional boundaries for summary aggregation.
        </p>
      </div>
    </div>
  );
}

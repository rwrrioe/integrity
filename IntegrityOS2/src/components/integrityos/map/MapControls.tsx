import React from 'react';
import { ZoomIn, ZoomOut, Layers, Filter } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleLayers: () => void;
  onToggleFilters: () => void;
}

export function MapControls({ onZoomIn, onZoomOut, onToggleLayers, onToggleFilters }: MapControlsProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-50"
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-50"
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      <button
        onClick={onToggleLayers}
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-50"
        title="Layers"
      >
        <Layers className="w-5 h-5" />
      </button>
      <button
        onClick={onToggleFilters}
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-50"
        title="Filters"
      >
        <Filter className="w-5 h-5" />
      </button>
    </div>
  );
}

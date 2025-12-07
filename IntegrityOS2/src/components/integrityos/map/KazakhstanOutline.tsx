import React from 'react';
import { MapPin, FileJson } from 'lucide-react';

export function KazakhstanOutline() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-slate-900 mb-2">Kazakhstan Country Outline</h1>
        <p className="text-slate-600">
          Reference vector outline of Kazakhstan used as fallback if GeoJSON unavailable
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Outline */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-slate-900 mb-4">Vector Outline</h2>
          
          <div className="relative w-full h-96 bg-slate-50 rounded-lg overflow-hidden">
            <svg
              viewBox="0 0 800 500"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
             
              <path
                d="M 150,50 L 140,180 L 120,240 L 100,310 L 90,390 L 130,420 L 180,430 L 250,410 L 320,380 L 400,340 L 480,300 L 560,250 L 650,200 L 720,160 L 750,120 L 740,80 L 700,60 L 600,50 L 480,55 L 350,60 L 250,55 Z"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              
              {/* Major cities */}
              <circle cx="350" cy="200" r="5" fill="#ef4444" />
              <text x="360" y="205" className="text-xs" fill="#1e293b">Astana</text>
              
              <circle cx="450" cy="280" r="5" fill="#ef4444" />
              <text x="460" y="285" className="text-xs" fill="#1e293b">Almaty</text>
              
              <circle cx="250" cy="320" r="5" fill="#ef4444" />
              <text x="260" y="325" className="text-xs" fill="#1e293b">Aktau</text>
            </svg>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-900">
              This simplified outline is rendered using SVG paths and serves as a visual reference
              for the Kazakhstan boundary layer on the map.
            </p>
          </div>
        </div>

        {/* GeoJSON Placeholder */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileJson className="w-6 h-6 text-slate-700" />
            <h2 className="text-slate-900">kz_1.json (GeoJSON Data)</h2>
          </div>

          <div className="bg-slate-900 text-slate-300 rounded-lg p-4 font-mono h-96 overflow-auto">
            <div className="text-slate-500">{'{'}</div>
            <div className="ml-4 text-slate-500">&quot;type&quot;: &quot;FeatureCollection&quot;,</div>
            <div className="ml-4 text-slate-500">&quot;features&quot;: [</div>
            <div className="ml-8 text-slate-500">{'{'}</div>
            <div className="ml-12 text-slate-500">&quot;type&quot;: &quot;Feature&quot;,</div>
            <div className="ml-12 text-slate-500">&quot;properties&quot;: {'{'}</div>
            <div className="ml-16 text-slate-500">&quot;name&quot;: &quot;Kazakhstan&quot;</div>
            <div className="ml-12 text-slate-500">{'}'},</div>
            <div className="ml-12 text-slate-500">&quot;geometry&quot;: {'{'}</div>
            <div className="ml-16 text-slate-500">&quot;type&quot;: &quot;Polygon&quot;,</div>
            <div className="ml-16 text-slate-500">&quot;coordinates&quot;: [</div>
            <div className="ml-20 text-yellow-500">// Paste Kazakhstan GeoJSON coordinates here</div>
            <div className="ml-20 text-yellow-500">// This file is intentionally empty</div>
            <div className="ml-20 text-yellow-500">// Add real GeoJSON data manually</div>
            <div className="ml-16 text-slate-500">]</div>
            <div className="ml-12 text-slate-500">{'}'}</div>
            <div className="ml-8 text-slate-500">{'}'}</div>
            <div className="ml-4 text-slate-500">]</div>
            <div className="text-slate-500">{'}'}</div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-900">
              <strong>Note:</strong> This is a placeholder for the Kazakhstan GeoJSON boundary data.
              The actual GeoJSON should be pasted here manually when available.
            </p>
          </div>
        </div>
      </div>

      {/* Coordinate Reference */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-slate-900 mb-4">Key Coordinates</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-slate-600">Northern Point</div>
            <div className="text-slate-900">55.45°N, 50.3°E</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-slate-600">Southern Point</div>
            <div className="text-slate-900">40.9°N, 68.6°E</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-slate-600">Western Point</div>
            <div className="text-slate-900">49.1°N, 46.5°E</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-slate-600">Eastern Point</div>
            <div className="text-slate-900">49.0°N, 87.3°E</div>
          </div>
        </div>
      </div>
    </div>
  );
}

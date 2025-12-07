import { X } from 'lucide-react';
import { useState } from 'react';

interface MapFiltersProps {
  onClose: () => void;
}

export function MapFilters({ onClose }: MapFiltersProps) {
  const [method, setMethod] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [pipeline, setPipeline] = useState('all');

  return (
    <div className="absolute top-4 right-28 w-80 bg-white rounded-lg shadow-xl z-[1000] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900">Map Filters</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-slate-700 mb-2">Inspection Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Methods</option>
            <option value="ILI">ILI (In-Line Inspection)</option>
            <option value="UT">UT (Ultrasonic Testing)</option>
            <option value="RT">RT (Radiographic Testing)</option>
            <option value="VT">VT (Visual Testing)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-700 mb-2">Severity Level</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-700 mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-700 mb-2">Pipeline</label>
          <select
            value={pipeline}
            onChange={(e) => setPipeline(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Pipelines</option>
            <option value="pipeline-1">Main Gas Pipeline A</option>
            <option value="pipeline-2">Oil Transport Line B</option>
            <option value="pipeline-3">Water Supply Network C</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              setMethod('all');
              setSeverity('all');
              setDateRange('all');
              setPipeline('all');
            }}
            className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
          >
            Reset
          </button>
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Search, Filter, Box, AlertTriangle } from 'lucide-react';
import { mockObjects, mockDefects } from '../data/mockData';
import { ObjectDetailCard } from './ObjectDetailCard';
import { DefectDetailCard } from './DefectDetailCard';

export function ObjectsList() {
  const [activeTab, setActiveTab] = useState<'objects' | 'defects'>('objects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [selectedDefect, setSelectedDefect] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-700';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700';
      case 'offline':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

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

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2">Objects & Defects</h1>
          <p className="text-slate-600">
            Manage infrastructure objects and track defects
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('objects')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'objects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Objects ({mockObjects.length})
          </button>
          <button
            onClick={() => setActiveTab('defects')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'defects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Defects ({mockDefects.length})
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            Filters
          </button>
        </div>

        {/* Objects Table */}
        {activeTab === 'objects' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-700">ID</th>
                  <th className="text-left py-3 px-4 text-slate-700">Name</th>
                  <th className="text-left py-3 px-4 text-slate-700">Type</th>
                  <th className="text-left py-3 px-4 text-slate-700">Pipeline</th>
                  <th className="text-left py-3 px-4 text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockObjects.map((obj) => (
                  <tr key={obj.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600">{obj.id}</td>
                    <td className="py-3 px-4 text-slate-900">{obj.name}</td>
                    <td className="py-3 px-4 text-slate-600">{obj.type}</td>
                    <td className="py-3 px-4 text-slate-600">{obj.pipelineId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded ${getStatusColor(obj.status)}`}>
                        {obj.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedObject(obj)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Defects Table */}
        {activeTab === 'defects' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-700">ID</th>
                  <th className="text-left py-3 px-4 text-slate-700">Type</th>
                  <th className="text-left py-3 px-4 text-slate-700">Severity</th>
                  <th className="text-left py-3 px-4 text-slate-700">Method</th>
                  <th className="text-left py-3 px-4 text-slate-700">Pipeline</th>
                  <th className="text-left py-3 px-4 text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockDefects.map((defect) => (
                  <tr key={defect.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600">{defect.id}</td>
                    <td className="py-3 px-4 text-slate-900">{defect.type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded ${getSeverityColor(defect.severity)}`}>
                        {defect.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{defect.method}</td>
                    <td className="py-3 px-4 text-slate-600">{defect.pipelineId}</td>
                    <td className="py-3 px-4 text-slate-600">{defect.date}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedDefect(defect)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Object Detail Modal */}
      {selectedObject && (
        <ObjectDetailCard
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      )}

      {/* Defect Detail Modal */}
      {selectedDefect && (
        <DefectDetailCard
          defect={selectedDefect}
          onClose={() => setSelectedDefect(null)}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, Search, Filter, Eye } from 'lucide-react';
import { mockPipelines } from '../data/mockData';
import { PipelineModal } from './PipelineModal';

export function PipelineList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPipeline, setSelectedPipeline] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700';
      case 'inactive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2">Pipelines</h1>
          <p className="text-slate-600">
            Manage and monitor all pipeline infrastructure
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search pipelines..."
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

        {/* Pipeline Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockPipelines.map((pipeline) => (
            <div
              key={pipeline.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <GitBranch className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-slate-900">{pipeline.name}</h3>
                      <p className="text-slate-600">{pipeline.id}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded ${getStatusColor(
                      pipeline.status
                    )}`}
                  >
                    {pipeline.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Length</span>
                    <span className="text-slate-900">{pipeline.length} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Material</span>
                    <span className="text-slate-900">{pipeline.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Diameter</span>
                    <span className="text-slate-900">{pipeline.diameter} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Install Date</span>
                    <span className="text-slate-900">{pipeline.installDate}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/pipelines/${pipeline.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => setSelectedPipeline(pipeline)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    title="Quick View"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Modal */}
      {selectedPipeline && (
        <PipelineModal
          pipeline={selectedPipeline}
          onClose={() => setSelectedPipeline(null)}
        />
      )}
    </div>
  );
}

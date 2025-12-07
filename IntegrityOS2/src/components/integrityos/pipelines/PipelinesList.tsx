import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, MapPin, AlertTriangle, TrendingUp, Search } from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  length: string;
  objects: number;
  defects: number;
  status: 'active' | 'maintenance' | 'offline';
  lastInspection: string;
  riskScore: number;
}

export function PipelinesList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const pipelines: Pipeline[] = [
    {
      id: 'MT-01',
      name: 'Main Transport 01',
      length: '450 km',
      objects: 412,
      defects: 45,
      status: 'active',
      lastInspection: '2024-11-28',
      riskScore: 7.5,
    },
    {
      id: 'MT-02',
      name: 'Main Transport 02',
      length: '380 km',
      objects: 356,
      defects: 32,
      status: 'active',
      lastInspection: '2024-11-25',
      riskScore: 6.2,
    },
    {
      id: 'MT-03',
      name: 'Main Transport 03',
      length: '520 km',
      objects: 479,
      defects: 51,
      status: 'maintenance',
      lastInspection: '2024-11-30',
      riskScore: 8.1,
    },
  ];

  const filteredPipelines = pipelines.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Pipeline['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
      case 'offline': return 'bg-red-100 text-red-700';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 6) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="h-full overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2">Pipelines</h1>
          <p className="text-slate-600">Manage and monitor pipeline infrastructure</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search pipelines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-slate-600 mb-1">Total Pipelines</div>
            <div className="text-slate-900">{pipelines.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-slate-600 mb-1">Total Length</div>
            <div className="text-slate-900">1,350 km</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-slate-600 mb-1">Total Objects</div>
            <div className="text-slate-900">{pipelines.reduce((sum, p) => sum + p.objects, 0)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-slate-600 mb-1">Total Defects</div>
            <div className="text-slate-900">{pipelines.reduce((sum, p) => sum + p.defects, 0)}</div>
          </div>
        </div>

        {/* Pipelines List */}
        <div className="space-y-4">
          {filteredPipelines.map((pipeline) => (
            <div
              key={pipeline.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/pipelines/${pipeline.id}`)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <GitBranch className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-slate-900">{pipeline.name}</h2>
                      <div className="text-slate-600">ID: {pipeline.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded ${getStatusColor(pipeline.status)}`}>
                      {pipeline.status.toUpperCase()}
                    </span>
                    <div className={`flex items-center gap-1 ${getRiskColor(pipeline.riskScore)}`}>
                      <TrendingUp className="w-4 h-4" />
                      <span>{pipeline.riskScore}/10</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-slate-600 mb-1">Length</div>
                    <div className="text-slate-900">{pipeline.length}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-slate-600 mb-1">Objects</div>
                    <div className="text-slate-900">{pipeline.objects}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-slate-600 mb-1">Defects</div>
                    <div className="text-orange-600">{pipeline.defects}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-slate-600 mb-1">Last Inspection</div>
                    <div className="text-slate-900">{pipeline.lastInspection}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-slate-600 mb-1">Risk Score</div>
                    <div className={getRiskColor(pipeline.riskScore)}>
                      {pipeline.riskScore}/10
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

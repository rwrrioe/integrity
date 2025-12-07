import React, { useState } from 'react';
import { Briefcase, CheckCircle, Clock, AlertCircle, FileText, Download } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  pipeline: string;
  status: 'created' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  assignedDate: string;
  dueDate: string;
  description: string;
}

export function EmployeeWorkspace() {
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Inspect MT-01 Pipeline Section KM 125-130',
      pipeline: 'MT-01',
      status: 'in_progress',
      priority: 'high',
      assignedDate: '2024-12-01',
      dueDate: '2024-12-10',
      description: 'Complete visual inspection and MFL analysis',
    },
    {
      id: '2',
      title: 'Review Defect Reports for MT-02',
      pipeline: 'MT-02',
      status: 'created',
      priority: 'medium',
      assignedDate: '2024-12-05',
      dueDate: '2024-12-15',
      description: 'Analyze recent inspection data and prepare report',
    },
    {
      id: '3',
      title: 'Generate Monthly Inspection Report',
      pipeline: 'All',
      status: 'created',
      priority: 'low',
      assignedDate: '2024-12-03',
      dueDate: '2024-12-20',
      description: 'Compile data from November inspections',
    },
    {
      id: '4',
      title: 'MT-03 Critical Defect Follow-up',
      pipeline: 'MT-03',
      status: 'resolved',
      priority: 'high',
      assignedDate: '2024-11-20',
      dueDate: '2024-11-30',
      description: 'Document repair actions and verification',
    },
  ]);

  const [selectedStatus, setSelectedStatus] = useState<'all' | 'created' | 'in_progress' | 'resolved'>('all');

  const filteredTasks = selectedStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === selectedStatus);

  const statusCounts = {
    created: tasks.filter(t => t.status === 'created').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    resolved: tasks.filter(t => t.status === 'resolved').length,
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'created': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-green-100 text-green-700';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'created': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
    }
  };

  return (
    <div className="h-full overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900">My Workspace</h1>
              <p className="text-slate-600">Manage your assigned tasks and inspections</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Created</p>
                <p className="text-slate-900">{statusCounts.created}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">In Progress</p>
                <p className="text-slate-900">{statusCounts.in_progress}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Resolved</p>
                <p className="text-slate-900">{statusCounts.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <span className="text-slate-700">Filter by status:</span>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All Tasks' },
                  { key: 'created', label: 'Created' },
                  { key: 'in_progress', label: 'In Progress' },
                  { key: 'resolved', label: 'Resolved' },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedStatus(filter.key as any)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedStatus === filter.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="p-4">
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-slate-900">{task.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-2">{task.description}</p>
                      <div className="flex gap-4 text-sm text-slate-600">
                        <span>Pipeline: {task.pipeline}</span>
                        <span className={getPriorityColor(task.priority)}>
                          Priority: {task.priority.toUpperCase()}
                        </span>
                        <span>Assigned: {task.assignedDate}</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {task.status === 'created' && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Start Task
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Mark Complete
                      </button>
                    )}
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 text-left">
              <FileText className="w-8 h-8 text-blue-600 mb-2" />
              <div className="text-slate-900">Generate Report</div>
              <div className="text-slate-600">Create inspection report</div>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 text-left">
              <Download className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-slate-900">Export Data</div>
              <div className="text-slate-600">Download task data</div>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 text-left">
              <AlertCircle className="w-8 h-8 text-orange-600 mb-2" />
              <div className="text-slate-900">Report Issue</div>
              <div className="text-slate-600">Submit defect report</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

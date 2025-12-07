import React, { useState } from 'react';
import { Shield, Users, GitBranch, Database, Settings, BarChart3, FileEdit } from 'lucide-react';

export function AdminPanel() {
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'pipelines' | 'objects' | 'system'>('overview');

  const stats = {
    totalUsers: 45,
    activePipelines: 3,
    totalObjects: 1247,
    pendingTasks: 23,
  };

  const users = [
    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Employee', status: 'Active' },
    { id: 3, name: 'Mike Davis', email: 'mike@example.com', role: 'Employee', status: 'Inactive' },
  ];

  const pipelines = [
    { id: 'MT-01', name: 'Main Transport 01', length: '450 km', objects: 412, status: 'Active' },
    { id: 'MT-02', name: 'Main Transport 02', length: '380 km', objects: 356, status: 'Active' },
    { id: 'MT-03', name: 'Main Transport 03', length: '520 km', objects: 479, status: 'Active' },
  ];

  return (
    <div className="h-full overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900">Admin Panel</h1>
              <p className="text-slate-600">System management and configuration</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Total Users</p>
                <p className="text-slate-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Active Pipelines</p>
                <p className="text-slate-900">{stats.activePipelines}</p>
              </div>
              <GitBranch className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Total Objects</p>
                <p className="text-slate-900">{stats.totalObjects}</p>
              </div>
              <Database className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Pending Tasks</p>
                <p className="text-slate-900">{stats.pendingTasks}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-slate-200 px-6">
            <div className="flex gap-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'users', label: 'User Management', icon: Users },
                { key: 'pipelines', label: 'Pipelines', icon: GitBranch },
                { key: 'objects', label: 'Objects', icon: Database },
                { key: 'system', label: 'System Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSection(tab.key as any)}
                    className={`py-4 border-b-2 transition-colors flex items-center gap-2 ${
                      activeSection === tab.key
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* Overview */}
            {activeSection === 'overview' && (
              <div>
                <h2 className="text-slate-900 mb-4">System Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="text-slate-900 mb-3">Recent Activity</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 rounded text-sm">
                        <div className="text-slate-900">New user registered: Sarah Johnson</div>
                        <div className="text-slate-600">2 hours ago</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded text-sm">
                        <div className="text-slate-900">Pipeline MT-03 inspection completed</div>
                        <div className="text-slate-600">5 hours ago</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded text-sm">
                        <div className="text-slate-900">Critical defect detected on MT-01</div>
                        <div className="text-slate-600">1 day ago</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="text-slate-900 mb-3">System Health</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">Database</span>
                          <span className="text-green-600">Healthy</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">API Services</span>
                          <span className="text-green-600">Online</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600">Storage</span>
                          <span className="text-yellow-600">78% Used</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Management */}
            {activeSection === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-slate-900">User Management</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add User
                  </button>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-slate-700">Name</th>
                        <th className="px-4 py-3 text-left text-slate-700">Email</th>
                        <th className="px-4 py-3 text-left text-slate-700">Role</th>
                        <th className="px-4 py-3 text-left text-slate-700">Status</th>
                        <th className="px-4 py-3 text-left text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t border-slate-200">
                          <td className="px-4 py-3 text-slate-900">{user.name}</td>
                          <td className="px-4 py-3 text-slate-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-blue-600 hover:text-blue-700 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-700">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pipelines Management */}
            {activeSection === 'pipelines' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-slate-900">Pipeline Management</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Pipeline
                  </button>
                </div>
                <div className="space-y-3">
                  {pipelines.map((pipeline) => (
                    <div key={pipeline.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-slate-900">{pipeline.name}</h3>
                          <div className="flex gap-4 text-slate-600 mt-1">
                            <span>ID: {pipeline.id}</span>
                            <span>Length: {pipeline.length}</span>
                            <span>Objects: {pipeline.objects}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
                            {pipeline.status}
                          </span>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <FileEdit className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Objects Management */}
            {activeSection === 'objects' && (
              <div>
                <h2 className="text-slate-900 mb-4">Objects Editor</h2>
                <p className="text-slate-600">
                  Object management interface for editing inspection points, defects, and metadata.
                </p>
              </div>
            )}

            {/* System Settings */}
            {activeSection === 'system' && (
              <div>
                <h2 className="text-slate-900 mb-4">System Settings</h2>
                <div className="space-y-4">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="text-slate-900 mb-3">General Settings</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-slate-700">Enable Email Notifications</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-slate-700">Auto-assign Tasks</span>
                        <input type="checkbox" className="rounded" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-slate-700">Enable AI Predictions</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </label>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="text-slate-900 mb-3">Map Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-700 mb-1">Default Map View</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                          <option>Kazakhstan Overview</option>
                          <option>Pipeline Focus</option>
                          <option>Last Viewed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 mb-1">Cluster Threshold</label>
                        <input
                          type="number"
                          defaultValue={50}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

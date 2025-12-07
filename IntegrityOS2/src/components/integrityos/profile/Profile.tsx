import React from 'react';
import { useAuth } from '../../../IntegrityOS_FullUI';
import { User, Mail, Shield, Calendar, Activity, Edit } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();

  const activityData = [
    { date: '2024-12-07', action: 'Completed inspection on MT-01', type: 'task' },
    { date: '2024-12-06', action: 'Updated defect report #4523', type: 'update' },
    { date: '2024-12-05', action: 'Generated monthly report', type: 'report' },
    { date: '2024-12-04', action: 'Reviewed AI predictions for MT-02', type: 'analysis' },
  ];

  const stats = {
    tasksCompleted: 47,
    reportsGenerated: 12,
    inspectionsLogged: 156,
    defectsIdentified: 89,
  };

  return (
    <div className="h-full overflow-auto bg-slate-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900">Profile</h1>
          <p className="text-slate-600">View and manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white text-3xl">
                {user?.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-slate-900 mb-1">{user?.email.split('@')[0]}</h2>
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-lg flex items-center gap-2 ${
                    user?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Shield className="w-4 h-4" />
                    <span>{user?.role === 'admin' ? 'Administrator' : 'Employee'}</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg">
                    Active
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 gap-6">
            <div>
              <div className="text-slate-600 mb-1">Member Since</div>
              <div className="text-slate-900">November 2023</div>
            </div>
            <div>
              <div className="text-slate-600 mb-1">Last Login</div>
              <div className="text-slate-900">Today, 09:24 AM</div>
            </div>
            <div>
              <div className="text-slate-600 mb-1">Department</div>
              <div className="text-slate-900">Pipeline Inspection</div>
            </div>
            <div>
              <div className="text-slate-600 mb-1">Location</div>
              <div className="text-slate-900">Astana, Kazakhstan</div>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-slate-900">Activity Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-900">{stats.tasksCompleted}</div>
                <div className="text-blue-700">Tasks Completed</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-green-900">{stats.reportsGenerated}</div>
                <div className="text-green-700">Reports Generated</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-900">{stats.inspectionsLogged}</div>
                <div className="text-purple-700">Inspections Logged</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-orange-900">{stats.defectsIdentified}</div>
                <div className="text-orange-700">Defects Identified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-700" />
              <h2 className="text-slate-900">Recent Activity</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activityData.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-slate-900">{activity.action}</div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-3 h-3" />
                      <span>{activity.date}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    activity.type === 'task' ? 'bg-green-100 text-green-700' :
                    activity.type === 'update' ? 'bg-blue-100 text-blue-700' :
                    activity.type === 'report' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {activity.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

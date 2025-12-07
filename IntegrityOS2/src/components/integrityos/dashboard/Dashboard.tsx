import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Activity, Calendar, Upload, FileText, ArrowRight } from 'lucide-react';
import { api, endpoints } from '../../../services/api';

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            // GET /admin/dashboard
            const res = await api.get(endpoints.dashboard);
            setStats(res.data);
        } catch (e) {
            console.error("Dashboard error", e);
        }
    };
    fetchStats();
  }, []);

  // Если данных нет, показываем загрузку или статику
  if (!stats) return <div className="p-6">Loading real-time analytics...</div>;

  // Маппинг данных с Go (charts.defs_by_criticality)
  const critData = stats.charts?.defs_by_criticality?.map((d: any) => ({
      name: d.Status,
      value: d.Count,
      color: d.Status === 'недопустимо' ? '#ef4444' : '#eab308' 
  })) || [];

  // Маппинг по годам
  const yearData = stats.charts?.defs_by_year?.map((d: any) => ({
      year: d.Year.toString(),
      count: d.Count
  })) || [];

  return (
    <div className="h-full overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2">Executive Dashboard</h1>
          <p className="text-slate-600">Real-time infrastructure health monitoring</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Total Defects</p>
                <p className="text-slate-900 text-2xl font-bold">{stats.metrics?.total || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Inspections</p>
                <p className="text-slate-900 text-2xl font-bold">{stats.metrics?.inspections || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          {/* ... Другие виджеты ... */}
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-slate-900 mb-4">Defects by Year</h2>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-slate-900 mb-4">Criticality Distribution</h2>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={critData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                     {critData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ef4444' : '#eab308'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Risks */}
         <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-slate-900 mb-4">Top 5 Critical Defects</h2>
          <div className="space-y-3">
            {stats.metrics?.top_5?.map((risk: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-slate-900">{risk.DefectType} on {risk.ObjectName}</div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="px-3 py-1 bg-red-100 text-red-700 rounded">
                    Critical
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
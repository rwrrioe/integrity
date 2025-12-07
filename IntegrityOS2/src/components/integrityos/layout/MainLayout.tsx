import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../IntegrityOS_FullUI';
import {
  Map,
  LayoutDashboard,
  GitBranch,
  Radio,
  Settings,
  User,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  Shield,
  Briefcase,
  Upload,
  FileText
} from 'lucide-react';

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: Map, label: 'Map', path: '/map', roles: ['admin', 'employee'] },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'employee'] },
    { icon: GitBranch, label: 'Pipelines', path: '/pipelines', roles: ['admin', 'employee'] },
    { icon: Radio, label: 'Sensors', path: '/sensors', roles: ['admin', 'employee'] },
    { icon: Upload, label: 'Import Data', path: '/import-data', roles: ['admin'] },
    { icon: FileText, label: 'Reports', path: '/report-generator', roles: ['admin', 'employee'] },
    { icon: Shield, label: 'Admin Panel', path: '/admin', roles: ['admin'] },
    { icon: Briefcase, label: 'My Tasks', path: '/employee', roles: ['employee'] },
  ];

  const bottomMenuItems = [
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin', 'employee'] },
    { icon: User, label: 'Profile', path: '/profile', roles: ['admin', 'employee'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'employee')
  );

  const filteredBottomItems = bottomMenuItems.filter(item =>
    item.roles.includes(user?.role || 'employee')
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded"></div>
              <span>IntegrityOS</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-slate-800 rounded-lg"
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-slate-800 px-2 py-4 space-y-1">
          {filteredBottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search objects, pipelines, defects..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Badge */}
            <div className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {user?.role === 'admin' ? 'Administrator' : 'Employee'}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-100 rounded-lg relative"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="text-slate-900">Notifications</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-slate-900">New defect detected</p>
                      <p className="text-slate-600">MT-01 Pipeline - High severity</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-slate-900">Inspection completed</p>
                      <p className="text-slate-600">MT-02 Pipeline - 3 objects</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                {user?.email.charAt(0).toUpperCase()}
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
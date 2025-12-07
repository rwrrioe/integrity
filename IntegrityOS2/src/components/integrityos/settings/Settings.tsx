import React, { useState } from 'react';
import { useAuth } from '../../../IntegrityOS_FullUI';
import { Settings as SettingsIcon, Lock, Bell, Palette, Save } from 'lucide-react';

export function Settings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [theme, setTheme] = useState('light');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveChanges = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="h-full overflow-auto bg-slate-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900">Settings</h1>
              <p className="text-slate-600">Manage your account preferences</p>
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-900">Current Role</div>
              <div className="text-blue-700">{user?.role === 'admin' ? 'Administrator' : 'Employee'}</div>
            </div>
            <div className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {user?.role === 'admin' ? 'Full Access' : 'Limited Access'}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-700" />
              <h2 className="text-slate-900">Change Password</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-slate-700 mb-2">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-slate-700 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-slate-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-700" />
              <h2 className="text-slate-900">Notification Preferences</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="text-slate-900">Email Notifications</div>
                <div className="text-slate-600">Receive email updates about tasks and defects</div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <div className="text-slate-900">Push Notifications</div>
                <div className="text-slate-600">Get browser notifications for critical alerts</div>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <div className="text-slate-900">Task Reminders</div>
                <div className="text-slate-600">Remind me about upcoming task deadlines</div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <div className="text-slate-900">Inspection Reports</div>
                <div className="text-slate-600">Notify when new inspection reports are available</div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="rounded"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {saved && (
              <span className="text-green-600">Settings saved successfully!</span>
            )}
          </div>
          <button
            onClick={handleSaveChanges}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

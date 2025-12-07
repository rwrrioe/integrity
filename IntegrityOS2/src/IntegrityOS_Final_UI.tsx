import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/integrityos/auth/Login';
import { Register } from './components/integrityos/auth/Register';
import { ForgotPassword } from './components/integrityos/auth/ForgotPassword';
import { ResetPassword } from './components/integrityos/auth/ResetPassword';
import { MainLayout } from './components/integrityos/layout/MainLayout';
import { MainMapView } from './components/integrityos/map/MainMapView';
import { Dashboard } from './components/integrityos/dashboard/Dashboard';
import { PipelineList } from './components/integrityos/pipelines/PipelineList';
import { PipelineDetail } from './components/integrityos/pipelines/PipelineDetail';
import { ObjectsList } from './components/integrityos/objects/ObjectsList';
import { ImportData } from './components/integrityos/import/ImportData';
import { ReportGenerator } from './components/integrityos/reports/ReportGenerator';
import { DeveloperNotes } from './components/integrityos/dev/DeveloperNotes';

export default function IntegrityOS_Final_UI() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleLogin = (userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            {/* Main App Routes - Map First! */}
            <Route
              path="/"
              element={
                <MainLayout user={user} onLogout={handleLogout}>
                  <MainMapView />
                </MainLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <MainLayout user={user} onLogout={handleLogout}>
                  <Dashboard />
                </MainLayout>
              }
            />
            <Route
              path="/pipelines"
              element={
                <MainLayout user={user} onLogout={handleLogout}>
                  <PipelineList />
                </MainLayout>
              }
            />
            <Route
              path="/pipelines/:id"
              element={
                <MainLayout user={user} onLogout={handleLogout}>
                  <PipelineDetail />
                </MainLayout>
              }
            />
            <Route
              path="/objects"
              element={
                <MainLayout user={user} onLogout={handleLogout}>
                  <ObjectsList />
                </MainLayout>
              }
            />
            <Route
              path="/import"
              element={
                <MainLayout user={user} onLogout={handleLogout}>
                  <ImportData />
                </MainLayout>
              }
            />
            <Route
              path="/reports"
              element={
                <MainLayout user={user} onLogout={handleLogout}>
                  <ReportGenerator />
                </MainLayout>
              }
            />
            <Route
              path="/dev-notes"
              element={
                <MainLayout user={user} onLogout={handleLogout}>
                  <DeveloperNotes />
                </MainLayout>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/integrityos/auth/Login';
import { Register } from './components/integrityos/auth/Register';
import { ForgotPassword } from './components/integrityos/auth/ForgotPassword';
import { ResetPassword } from './components/integrityos/auth/ResetPassword';
import { MainLayout } from './components/integrityos/layout/MainLayout';
import { MainMapView } from './components/integrityos/map/MainMapView'; // ВАЖНО: Импортируем MainMapView, а не MapView
import { AdminPanel } from './components/integrityos/admin/AdminPanel';
import { EmployeeWorkspace } from './components/integrityos/employee/EmployeeWorkspace';
import { Settings } from './components/integrityos/settings/Settings';
import { Profile } from './components/integrityos/profile/Profile';
import { PipelinesList } from './components/integrityos/pipelines/PipelinesList';
import { PipelineDetail } from './components/integrityos/pipelines/PipelineDetail';
import { ObjectDetail } from './components/integrityos/objects/ObjectDetail';
import { Dashboard } from './components/integrityos/dashboard/Dashboard';
import { Sensors } from './components/integrityos/sensors/Sensors';
import { ImportData } from './components/integrityos/import/ImportData';
import { ReportGenerator } from './components/integrityos/reports/ReportGenerator';
import { KazakhstanOutline } from './components/integrityos/map/KazakhstanOutline';
import { api, endpoints } from './services/api'; // Импорт API
import { wsService } from './services/socket';   // Импорт WS

// Auth context
interface AuthContextType {
  user: { email: string; role: 'admin' | 'employee'; token?: string } | null;
  login: (email: string, password: string) => Promise<boolean>; // Async
  register: (email: string, password: string, role: 'admin' | 'employee') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; role: 'admin' | 'employee'; token?: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('integrityos_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    // Запускаем WS при старте
    wsService.connect();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post(endpoints.login, { Email: email, Password: password });
      
      // В твоем Go коде: c.JSON(200, gin.H{"token": req.Email})
      // Токен - это email. Роль определяем локально или можно запросить профиль
      const token = res.data.token;
      
      // Хак для демо, так как бэк не возвращает роль в /login, но она есть в мапе users
      const role = email.includes('admin') ? 'admin' : 'employee';

      const userData = { email, role, token };
      setUser(userData as any);
      localStorage.setItem('integrityos_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const register = async (email: string, password: string, role: 'admin' | 'employee'): Promise<boolean> => {
    try {
        await api.post(endpoints.register, { Email: email, Password: password, Name: email.split('@')[0] });
        // После регистрации сразу логиним
        return login(email, password);
    } catch (error) {
        console.error("Register failed", error);
        return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('integrityos_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/map" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/map" /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/map" />} />
        {/* Используем MainMapView который грузит данные */}
        <Route path="map" element={<MainMapView />} /> 
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pipelines" element={<PipelinesList />} />
        <Route path="pipelines/:id" element={<PipelineDetail />} />
        <Route path="objects/:id" element={<ObjectDetail />} />
        <Route path="sensors" element={<Sensors />} />
        <Route path="import-data" element={<ImportData />} />
        <Route path="report-generator" element={<ReportGenerator />} />
        <Route path="admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/map" />} />
        <Route path="employee" element={user?.role === 'employee' ? <EmployeeWorkspace /> : <Navigate to="/map" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="kazakhstan-outline" element={<KazakhstanOutline />} />
      </Route>
    </Routes>
  );
}

export default function IntegrityOS_FullUI() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
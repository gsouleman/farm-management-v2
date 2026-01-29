import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Inventory from './pages/Inventory';
import TeamManagement from './pages/TeamManagement';
import WeatherCenter from './pages/WeatherCenter';
import DocumentVault from './pages/DocumentVault';

import Dashboard from './pages/Dashboard';
import MainLayout from './components/MainLayout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute>
            <MainLayout>
              <Inventory />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/team" element={
          <ProtectedRoute>
            <MainLayout>
              <TeamManagement />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/weather" element={
          <ProtectedRoute>
            <MainLayout>
              <WeatherCenter />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/vault" element={
          <ProtectedRoute>
            <MainLayout>
              <DocumentVault />
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

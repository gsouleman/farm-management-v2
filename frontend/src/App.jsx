import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Fields from './pages/Fields';
import Activities from './pages/Activities';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import TeamManagement from './pages/TeamManagement';
import Harvests from './pages/Harvests';
import Crops from './pages/Crops';
import Planner from './pages/Planner';
import WeatherCenter from './pages/WeatherCenter';
import DocumentVault from './pages/DocumentVault';
import Infrastructure from './pages/Infrastructure';
import ProductionCosts from './pages/ProductionCosts';
import Contracts from './pages/Contracts';
import Stores from './pages/Stores';
import MainLayout from './components/MainLayout';
import GlobalNotification from './components/common/GlobalNotification';
import IdleTimer from './components/common/IdleTimer';

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
      <GlobalNotification />
      <IdleTimer />
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
        <Route path="/inventory" element={<Navigate to="/stores" />} />
        <Route path="/harvests" element={
          <ProtectedRoute>
            <MainLayout>
              <Harvests />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/crops" element={
          <ProtectedRoute>
            <MainLayout>
              <Crops />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/planner" element={
          <ProtectedRoute>
            <MainLayout>
              <Planner />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/fields" element={
          <ProtectedRoute>
            <MainLayout>
              <Fields />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/activities" element={
          <ProtectedRoute>
            <MainLayout>
              <Activities />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <MainLayout>
              <Reports />
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
        <Route path="/infrastructure" element={
          <ProtectedRoute>
            <MainLayout>
              <Infrastructure />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/production-costs" element={
          <ProtectedRoute>
            <MainLayout>
              <ProductionCosts />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/contracts" element={
          <ProtectedRoute>
            <MainLayout>
              <Contracts />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/stores" element={
          <ProtectedRoute>
            <MainLayout>
              <Stores />
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

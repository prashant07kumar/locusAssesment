import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';


import EventListPage from '../pages/EventListPage';
import EventDetailPage from '../pages/EventDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import OrganizerDashboard from '../pages/OrganizerDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<EventListPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
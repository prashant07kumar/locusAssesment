import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Page Imports
import EventListPage from '../pages/EventListPage';
import EventDetailPage from '../pages/EventDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import OrganizerDashboard from '../pages/OrganizerDashboard';

// A wrapper for routes that require authentication and specific roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // If not logged in, redirect to login page, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user's role is not in the allowed roles, redirect to home page
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<EventListPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />

      {/* Protected Organizer/Admin Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback for any other route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
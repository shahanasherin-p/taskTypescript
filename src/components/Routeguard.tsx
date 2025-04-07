import React, { Fragment, JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface User {
  role: 'admin' | 'User';
}

interface RouteGuardProps {
  authenticated: boolean;
  User: User;
  element: JSX.Element;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ authenticated, User, element }) => {
  const location = useLocation();

  // If not authenticated and not on auth page, redirect to login
  if (!authenticated && !location.pathname.includes('/login')) {
    return <Navigate to="/login" />;
  }

  // Handle authenticated users based on role
  if (authenticated) {
    const { role } = User;

    // Admin routes
    if (role === 'admin') {
      // If admin trying to access user routes or auth
      if (!location.pathname.includes('/admin')) {
        return <Navigate to="/admin" />;
      }
    } 
    // Regular user routes
    else if (role === 'User') {
      // If regular user trying to access admin routes or auth
      if (location.pathname.includes('/admin')) {
        return <Navigate to="/" />;
      }
    }
  }

  // Render the element for the current route
  return <Fragment>{element}</Fragment>;
};

export default RouteGuard;

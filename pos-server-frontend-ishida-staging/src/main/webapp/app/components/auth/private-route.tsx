import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

interface PrivateRouteProps {
  isAuthenticated: boolean;
  redirectPath?: string;
  screensAccess?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAuthenticated, redirectPath = '/login', screensAccess }) => {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (location.pathname === '/' || screensAccess.some((path) => location.pathname.includes(path))) {
    return <Outlet />;
  }

  return <Navigate to={redirectPath} replace />;
};

export default PrivateRoute;

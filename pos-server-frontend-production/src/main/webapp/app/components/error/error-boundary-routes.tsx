import React, { Suspense } from 'react';
import { Outlet, Route, Routes, RoutesProps } from 'react-router-dom';
import ErrorBoundary from 'app/components/error/error-boundary';

const ErrorBoundaryRoutes = ({ children }: RoutesProps) => {
  return (
    <Suspense>
      <Routes>
        <Route
          element={
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          }
        >
          {children}
        </Route>
      </Routes>
    </Suspense>
  );
};

export default ErrorBoundaryRoutes;

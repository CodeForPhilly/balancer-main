import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../services/actions/types';
import Spinner from '../LoadingSpinner/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  // TODO: Optimize useSelector to prevent unnecessary re-renders
  // Use: const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Wait for auth check to complete (null means not checked yet)
  // TODO: Add error handling for auth check failures
  if (isAuthenticated === null) {
    // TODO: Add accessibility attributes (role="status", aria-live="polite", aria-label)
    // TODO: Prevent Loading State Flash by adding 200ms delay before showing spinner
    return <Spinner />;
  }

  // If not authenticated, redirect to login and include the original location
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // TODO: Remove unnecessary fragment wrapper - just return children directly
  return <>{children}</>;
};

export default ProtectedRoute;
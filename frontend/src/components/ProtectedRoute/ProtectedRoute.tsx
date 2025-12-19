import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../services/actions/types';
import { AppDispatch, checkAuthenticated } from '../../services/actions/auth';
import Spinner from '../LoadingSpinner/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Check authentication status when component mounts
  useEffect(() => {
    if (isAuthenticated === null) {
      dispatch(checkAuthenticated());
    }
  }, [dispatch, isAuthenticated]);

  // Wait for auth check to complete (null means not checked yet)
  // TODO: Consider adding error handling for auth check failures
  if (isAuthenticated === null) {
    // TODO: Consider adding accessibility attributes (role="status", aria-live="polite", aria-label)
    // TODO: Consider preventing Loading State Flash by adding delay before showing spinner
    return <Spinner />;
  }

  // If not authenticated, redirect to login and include the original location
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
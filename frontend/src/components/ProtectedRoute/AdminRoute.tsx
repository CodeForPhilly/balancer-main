import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../services/actions/types';
import { AppDispatch, checkAuthenticated } from '../../services/actions/auth';
import Spinner from '../LoadingSpinner/LoadingSpinner';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isSuperuser } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated === null) {
      dispatch(checkAuthenticated());
    }
  }, [dispatch, isAuthenticated]);

  if (isAuthenticated === null) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isSuperuser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;

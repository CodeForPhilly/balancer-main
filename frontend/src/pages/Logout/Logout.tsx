import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { logout, AppDispatch } from "../../services/actions/auth";

const LogoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(logout());

    const timer = setTimeout(() => {
      navigate('/');
    }, 3000); // Redirect after 3 seconds

    // Cleanup the timer on component unmount
    return () => clearTimeout(timer);
  }, [dispatch, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md max-w-md text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">You’ve been logged out</h1>
        <div className="w-full h-2 bg-gray-200 overflow-hidden relative rounded-full">
          <div className="absolute top-0 left-0 h-2 w-1/3 bg-blue-500 rounded-full animate-loading"></div>
        </div>
        <p className="text-gray-600 mb-6">
          Thank you for using <span className="body_logo">Balancer</span>. You'll be redirected to the homepage shortly.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Go to Homepage Now
        </button>
      </div>
    </div>
  );
};

export default LogoutPage;

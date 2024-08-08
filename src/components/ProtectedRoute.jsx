import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from '../utils/Loader';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, user, initialized } = useAuth();

  if (!initialized) {
    return <Loader />; 
  }

  if (!isLoggedIn || !user) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;

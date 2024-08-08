import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, user, initialized } = useAuth();

  if (!initialized) {
    return null; 
  }

  if (!isLoggedIn || !user) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Custom hook to access the authentication context.
 *
 * This hook provides an easy way to access the authentication state and
 * functions from the AuthContext. It abstracts the useContext hook to
 * make it more convenient to use the AuthContext in functional components.
 *
 * @returns {Object} The current authentication context value, including user data,
 * login status, and authentication methods.
 */
const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;

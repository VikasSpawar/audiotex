import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // If we're still loading the auth state, loading indicator
  if (loading) return <div className="flex  p-2 justify-center items-center space-x-2">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className="w-6 h-6 bg-indigo-600 rounded-full animate-pulse "
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>; // wait until session is loaded

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

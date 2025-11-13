import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function protectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}


import { Navigate, Outlet } from "react-router-dom";

// Dummy auth check, replace with real logic
const isAuthenticated = () => {
  return !!localStorage.getItem("auth");
};

export default function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

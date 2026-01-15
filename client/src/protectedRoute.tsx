import { Navigate,Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query"
import { meApi } from "./api/api"

const ProtectedRoute = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: meApi,
    retry: false,          // don’t retry on 401
    staleTime: 5 * 60 * 1000
  });

  // Still checking auth → don’t redirect yet
  if (isLoading) {
    return null; // or loader
  }

  // Not authenticated
  if (error || !data) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated
  return <Outlet />;
};

export default ProtectedRoute;


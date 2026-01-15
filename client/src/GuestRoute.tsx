import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { meApi } from "./api/api";

const GuestRoute = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: meApi,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return null; // or accessible loader
  }

  // If user is authenticated (data exists), redirect to home
  if (data) {
    return <Navigate to="/" replace />;
  }

  // Not authenticated, allow access to nested routes
  return <Outlet />;
};

export default GuestRoute;

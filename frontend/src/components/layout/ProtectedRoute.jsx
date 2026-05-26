import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

/**
 * Wraps routes that require authentication (and optionally admin role).
 * Usage: <ProtectedRoute adminOnly /> or <ProtectedRoute />
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.account_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

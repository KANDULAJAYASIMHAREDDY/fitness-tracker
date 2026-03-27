// src/components/common/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import UserContext from "../../context/User-Context";

export default function ProtectedRoute({ children, roles = [] }) {
  const { isLoggedIn, role } = useContext(UserContext);

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

// src/components/common/Navbar.jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../../context/User-Context";

export default function Navbar() {
  const { isLoggedIn, user, handleLogout } = useContext(UserContext);

  return (
    <nav style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
      <Link to="/">Home</Link>{" | "}
      <Link to="/trainers">Trainers</Link>{" | "}
      <Link to="/clients">Clients</Link>{" | "}
      <Link to="/workouts">Workouts</Link>{" | "}
      <Link to="/diets">Diets</Link>{" | "}
      <Link to="/progress">Progress</Link>{" | "}
      <Link to="/subscriptions">Subscriptions</Link>{" | "}
      <Link to="/payments">Payments</Link>{" | "}
      {!isLoggedIn ? (
        <>
          <Link to="/register">Register</Link>{" | "}
          <Link to="/login">Login</Link>
        </>
      ) : (
        <>
          <span style={{ marginLeft: 8 }}>{user?.name || user?.email}</span>
          <button onClick={handleLogout} style={{ marginLeft: 8 }}>Logout</button>
        </>
      )}
    </nav>
  );
}

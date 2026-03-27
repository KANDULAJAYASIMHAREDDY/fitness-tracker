// src/App.jsx
import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AuthenticationProvider from "./components/authentication/AuthenticationProvider";
import ProtectedRoute from "./components/common/ProtectedRoute";
import UserContext from "./context/User-Context";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Trainers from "./pages/trainers/Trainers";
import Clients from "./pages/clients/Clients";
import Workouts from "./pages/workouts/Workouts";
import Diets from "./pages/diets/Diets";
import Progress from "./pages/progress/Progress";
import Subscriptions from "./pages/subscriptions/Subscriptions";
import Payments from "./pages/payments/Payments";

function Navbar() {
  const { isLoggedIn, user, role, handleLogout } = useContext(UserContext);
  const linkStyle = { marginRight: 12, textDecoration: "none", color: "#2563eb", fontWeight: 500 };
  const isAdminOrTrainer = role === "Admin" || role === "Trainer";

  return (
    <nav style={{ padding: "10px 20px", borderBottom: "2px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
      <Link to="/" style={{ ...linkStyle, fontWeight: 700, fontSize: 18, color: "#111", marginRight: 20 }}>💪 FitTracker</Link>
      <Link to="/workouts" style={linkStyle}>Workouts</Link>
      <Link to="/diets" style={linkStyle}>Diets</Link>
      <Link to="/progress" style={linkStyle}>Progress</Link>
      {isAdminOrTrainer && <Link to="/clients" style={linkStyle}>Clients</Link>}
      {isAdminOrTrainer && <Link to="/trainers" style={linkStyle}>Trainers</Link>}
      {isAdminOrTrainer && <Link to="/subscriptions" style={linkStyle}>Subscriptions</Link>}
      {isAdminOrTrainer && <Link to="/payments" style={linkStyle}>Payments</Link>}
      {role === "Client" && <Link to="/subscriptions" style={linkStyle}>My Subscription</Link>}
      {role === "Client" && <Link to="/payments" style={linkStyle}>My Payments</Link>}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {!isLoggedIn ? (
          <>
            <Link to="/register" style={linkStyle}>Register</Link>
            <Link to="/login" style={{ ...linkStyle, background: "#2563eb", color: "#fff", padding: "6px 14px", borderRadius: 4 }}>Login</Link>
          </>
        ) : (
          <>
            <span style={{ fontSize: 14, color: "#555" }}>
              👤 <strong>{user?.name || user?.email}</strong>
              <span style={{ marginLeft: 6, padding: "2px 8px", background: role === "Admin" ? "#fef3c7" : role === "Trainer" ? "#dbeafe" : "#d1fae5", borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                {role}
              </span>
            </span>
            <button onClick={handleLogout}
              style={{ padding: "6px 14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 }}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

function Home() {
  const { isLoggedIn, user, role } = useContext(UserContext);
  const isAdminOrTrainer = role === "Admin" || role === "Trainer";

  return (
    <div style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>💪</div>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>FitTracker</h1>
      <p style={{ color: "#666", fontSize: 18, marginBottom: 32 }}>
        Complete Fitness Management — Workouts, Diet Plans, Progress Tracking & Payments
      </p>
      {!isLoggedIn ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Link to="/register" style={{ padding: "12px 28px", background: "#2563eb", color: "#fff", textDecoration: "none", borderRadius: 6, fontWeight: 600, fontSize: 16 }}>
            Get Started
          </Link>
          <Link to="/login" style={{ padding: "12px 28px", background: "#f3f4f6", color: "#111", textDecoration: "none", borderRadius: 6, fontWeight: 600, fontSize: 16 }}>
            Sign In
          </Link>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 18, marginBottom: 24 }}>
            Welcome back, <strong>{user?.name}</strong>! <span style={{ color: "#2563eb" }}>({role})</span>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, textAlign: "left" }}>
            {[
              { to: "/workouts", label: "🏋️ Workouts", desc: "Training programs" },
              { to: "/diets", label: "🥗 Diet Plans", desc: "Nutrition guidance" },
              { to: "/progress", label: "📈 Progress", desc: "Track milestones" },
              ...(isAdminOrTrainer ? [
                { to: "/clients", label: "👥 Clients", desc: "Manage clients" },
                { to: "/trainers", label: "🧑‍🏫 Trainers", desc: "Trainer profiles" },
                { to: "/subscriptions", label: "📋 Subscriptions", desc: "Assign plans" },
                { to: "/payments", label: "💳 Payments", desc: "Track payments" },
              ] : [
                { to: "/subscriptions", label: "📋 My Subscription", desc: "Your plan" },
                { to: "/payments", label: "💳 My Payments", desc: "Payment history" },
              ])
            ].map(item => (
              <Link key={item.to} to={item.to}
                style={{ display: "block", padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, textDecoration: "none", color: "#111", background: "#fff" }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: "#888" }}>{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isLoggedIn && (
        <div style={{ marginTop: 48, padding: 20, background: "#f9fafb", borderRadius: 8, textAlign: "left" }}>
          
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthenticationProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/trainers" element={<ProtectedRoute roles={['Admin', 'Trainer']}><Trainers /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute roles={['Admin', 'Trainer']}><Clients /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute roles={['Admin', 'Trainer', 'Client']}><Workouts /></ProtectedRoute>} />
          <Route path="/diets" element={<ProtectedRoute roles={['Admin', 'Trainer', 'Client']}><Diets /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute roles={['Admin', 'Trainer', 'Client']}><Progress /></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute roles={['Admin', 'Trainer', 'Client']}><Subscriptions /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute roles={['Admin', 'Trainer', 'Client']}><Payments /></ProtectedRoute>} />
        </Routes>
      </AuthenticationProvider>
    </BrowserRouter>
  );
}

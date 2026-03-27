// src/pages/auth/Register.jsx
import React, { useState, useContext } from "react";
import UserContext from "../../context/User-Context";

export default function Register() {
  const { handleRegister, serverError } = useContext(UserContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Client" });

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleRegister(form, () => setForm({ name: "", email: "", password: "", role: "Client" }));
  };

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: "0 16px" }}>
      <h2 style={{ marginBottom: 20 }}>Register</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Full Name *</label>
          <input name="name" placeholder="John Doe" value={form.name} onChange={onChange} required
            style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Email *</label>
          <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={onChange} required
            style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Password *</label>
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required
            style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>Role</label>
          <select name="role" value={form.role} onChange={onChange}
            style={{ width: "100%", padding: 8, boxSizing: "border-box", border: "1px solid #ccc", borderRadius: 4 }}>
            <option value="Client">Client</option>
            <option value="Trainer">Trainer</option>
          </select>
          <small style={{ color: "#666" }}>Note: First registered user becomes Admin automatically.</small>
        </div>
        <button type="submit" style={{ padding: "10px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
          Register
        </button>
      </form>
      {serverError && <div style={{ marginTop: 12, color: "red", padding: 8, background: "#fee", borderRadius: 4 }}>{serverError}</div>}
      <p style={{ marginTop: 16 }}>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
}

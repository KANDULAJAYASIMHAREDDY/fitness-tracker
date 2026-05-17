// src/pages/auth/Login.jsx
import React, { useState, useContext } from "react";
import UserContext from "../../context/User-Context";

export default function Login() {
  const { handleLogin, serverError } = useContext(UserContext);
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(form, () => setForm({ email: "", password: "" }));
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} />
        <br />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} />
        <br />
        <button type="submit">Login</button>
      </form>
      {serverError && <div style={{ marginTop: 12, color: "red" }}>{serverError}</div>}
    </div>
  );
}

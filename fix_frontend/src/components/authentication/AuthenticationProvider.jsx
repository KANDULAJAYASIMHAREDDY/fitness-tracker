// src/components/authentication/AuthenticationProvider.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/User-Context";
import API from "../../api/api";

export default function AuthenticationProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [serverError, setServerError] = useState("");
  const [role, setRole] = useState("");

  const setUserFromAccount = (data) => {
    if (!data) return;
    setUser(data);
    setIsLoggedIn(true);
    if (data.role) setRole(data.role);
    setServerError("");
  };

  const handleRegister = async (formData, resetForm) => {
    setServerError("");
    try {
      const res = await API.post("/user/register", formData);
      const token = res?.data?.token;
      if (token) {
        localStorage.setItem("ft_token", token);
        const account = await API.get("/user/account");
        setUserFromAccount(account.data);
        resetForm?.();
        navigate("/");
        return;
      }
      resetForm?.();
      navigate("/login");
    } catch (err) {
      const resp = err?.response;
      let msg = "Registration failed";
      if (resp?.data) {
        if (resp.data.error) msg = resp.data.error;
        else if (resp.data.message) msg = resp.data.message;
        else if (Array.isArray(resp.data.errors)) msg = resp.data.errors.map(e=>e.message||e.msg||JSON.stringify(e)).join("; ");
        else msg = JSON.stringify(resp.data);
      } else msg = err.message || msg;
      setServerError(msg);
    }
  };

  const handleLogin = async (formData, resetForm) => {
    setServerError("");
    try {
      const res = await API.post("/user/login", formData);
      const token = res?.data?.token;
      if (!token) {
        setServerError("Login failed: no token received");
        return;
      }
      localStorage.setItem("ft_token", token);
      const account = await API.get("/user/account");
      setUserFromAccount(account.data);
      resetForm?.();
      navigate("/");
    } catch (err) {
      const resp = err?.response;
      let msg = "Login failed";
      if (resp?.data) {
        if (resp.data.error) msg = resp.data.error;
        else if (resp.data.message) msg = resp.data.message;
        else if (Array.isArray(resp.data.errors)) msg = resp.data.errors.map(e=>e.message||e.msg||JSON.stringify(e)).join("; ");
        else msg = JSON.stringify(resp.data);
      } else msg = err.message || msg;
      setServerError(msg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ft_token");
    setUser(null);
    setIsLoggedIn(false);
    setRole("");
    setServerError("");
    navigate("/login");
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("ft_token");
      if (!token) return;
      try {
        const res = await API.get("/user/account");
        setUserFromAccount(res.data);
      } catch (err) {
        localStorage.removeItem("ft_token");
        setUser(null);
        setIsLoggedIn(false);
      }
    };
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{
      user, isLoggedIn, role, serverError, setServerError,
      handleRegister, handleLogin, handleLogout
    }}>
      {children}
    </UserContext.Provider>
  );
}

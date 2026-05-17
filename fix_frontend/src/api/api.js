// src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333",
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("ft_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;

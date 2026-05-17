// src/context/User-Context.jsx
import { createContext } from "react";

const UserContext = createContext({
  user: null,
  isLoggedIn: false,
  role: "",
  serverError: "",
  setServerError: () => {},
  handleRegister: async () => {},
  handleLogin: async () => {},
  handleLogout: () => {},
});

export default UserContext;

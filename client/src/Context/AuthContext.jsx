import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===========================
     LOAD AUTH FROM LOCAL STORAGE
  ============================ */
  useEffect(() => {
    const stored = localStorage.getItem("auth");

    if (stored) {
      const data = JSON.parse(stored);
      setUser(data.user);
      setToken(data.token);

      // Attach token globally to axios
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.token}`;
    }

    setLoading(false);
  }, []);

  /* ===========================
     LOGIN
  ============================ */
  const login = (data) => {
    localStorage.setItem("auth", JSON.stringify(data));
    setUser(data.user);
    setToken(data.token);

    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${data.token}`;
  };

  /* ===========================
     LOGOUT
  ============================ */
  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

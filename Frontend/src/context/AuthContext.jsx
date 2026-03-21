import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sc_token");
    const email = localStorage.getItem("sc_email");
    if (token && email) setUser({ token, email });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    let res;
    try {
      res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      throw new Error("Cannot reach server. Is the backend running?");
    }

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Server returned an invalid response.");
    }

    if (!res.ok) {
      throw new Error(data?.message || "Invalid email or password.");
    }

    localStorage.setItem("sc_token", data.token);
    localStorage.setItem("sc_email", data.email);
    setUser({ token: data.token, email: data.email });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("sc_token");
    localStorage.removeItem("sc_email");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
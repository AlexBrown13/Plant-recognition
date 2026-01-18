import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  // holds the currently logged-in user (or null if logged out)
  const [user, setUser] = useState(null);

  useEffect(() => {
    // try to read saved user data from localStorage
    const storedUser = localStorage.getItem("user");
    // if user exists in storage → restore login state
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // userData = decoded jwt or object from backend
  // idToken = google id token (jwt string)
  const login = (userData, idToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("google_id_token", idToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("google_id_token");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

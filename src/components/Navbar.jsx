import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoImg from "../assets/quiz_logo.png";
import { supabase } from "../utils/supabaseClient";
import { signOut } from "../utils/auth";

export default function Navbar() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    alert("Logged out!");
  };

  return (
    <header className="navbar flex justify-between items-center p-4">
      <div className="nav-left flex items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={logoImg}
            alt="Quizly Logo"
            className="h-6 w-auto object-contain"
            style={{ maxHeight: "80px" }}
          />
        </Link>
      </div>

      <div className="nav-right flex items-center gap-4">
        <Link to="/leaderboard" className="nav-icon-btn" title="Leaderboard">
          <span role="img" aria-label="Leaderboard">🏆</span>
        </Link>
        <Link to="/practice" className="nav-icon-btn" title="Practice">
          <span role="img" aria-label="Practice">📝</span>
        </Link>

        <div className="coins">💎 345</div>

        {/* User authentication buttons */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              padding: "4px 10px",
              borderRadius: "6px",
              border: "1px solid #4f46e5",
              fontWeight: "600",
              fontSize: "14px"
            }}>
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "4px 12px",
                borderRadius: "6px",
                border: "1px solid #ef4444",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link
              to="/login"
              style={{
                padding: "4px 12px",
                borderRadius: "6px",
                border: "1px solid #3b82f6",
                fontWeight: "600",
                fontSize: "14px",
                textDecoration: "none",
                cursor: "pointer"
              }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              style={{
                padding: "4px 12px",
                borderRadius: "6px",
                border: "1px solid #10b981",
                fontWeight: "600",
                fontSize: "14px",
                textDecoration: "none",
                cursor: "pointer"
              }}
            >
              Sign Up
            </Link>
          </div>
        )}

        
      </div>
    </header>
  );
}

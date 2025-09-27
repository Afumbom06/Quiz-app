// src/pages/Login.jsx
import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // Save user locally
      localStorage.setItem("currentUser", data.user.email);
      navigate("/home");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0e1624",
        color: "#fff",
        padding: "16px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#141d35",
          padding: "32px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: "24px" }}>🎮 Login</h2>

        {error && (
          <div
            style={{
              backgroundColor: "#ff4d4f",
              padding: "8px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...buttonStyle,
            backgroundColor: "#1d8df1",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#1dd17d" }}>
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #333",
  backgroundColor: "#0e1624",
  color: "#fff",
  fontSize: "16px",
};

const buttonStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  color: "#fff",
  fontWeight: "700",
  fontSize: "16px",
};

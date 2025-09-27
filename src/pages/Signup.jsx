// src/pages/Signup.jsx
import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp(
      { email: form.email, password: form.password },
      { data: { name: form.name, phone: form.phone } } // optional metadata
    );

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(
        "Signup successful! Please check your email and verify before logging in."
      );
      setForm({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
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
        <h2 style={{ textAlign: "center", fontSize: "24px" }}>🎮 Sign Up</h2>

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

        {success && (
          <div
            style={{
              backgroundColor: "#1dd17d",
              padding: "8px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            {success}
          </div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />

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
          type="tel"
          name="phone"
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={handleChange}
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

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
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
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p style={{ textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#1dd17d" }}>
            Login
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

// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function Login() {
  const nav = useNavigate();
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const change = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", data);

      // Save auth data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      alert(`Welcome back, ${res.data.username}!`);

      // Redirect user based on role
      if (res.data.role === "ADMIN") {
        nav("/admin");
      } else {
        nav("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Invalid credentials!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex justify-center items-center p-6">
      <motion.div
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Left side UI */}
        <div className="bg-gradient-to-br from-indigo-700 to-purple-600 text-white flex flex-col justify-center p-10">
          <h2 className="text-4xl font-extrabold mb-3">Welcome Back 👋</h2>
          <p className="text-lg text-indigo-100">
            Log in to manage your income, expenses, and goals with{" "}
            <span className="font-bold">BudgetWise</span>.
          </p>
        </div>

        {/* Right side - Login Form */}
        <div className="p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
            Login to BudgetWise
          </h2>

          <form onSubmit={submit} className="space-y-5">
            <input
              name="username"
              type="text"
              placeholder="Enter Username"
              onChange={change}
              value={data.username}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Enter Password"
              onChange={change}
              value={data.password}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />

            {/* Forgot Password link */}
            <p className="text-right -mt-3">
              <Link
                to="/forgot-password"
                className="text-indigo-600 text-sm font-semibold hover:underline"
              >
                Forgot Password?
              </Link>
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {loading ? "Signing in..." : "Login"}
            </motion.button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function Signup() {
  const nav = useNavigate();
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);

  const change = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/signup", data);
      alert("🎉 Account created successfully! Please login.");
      nav("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex justify-center items-center p-6">
      <motion.div
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Left Side Illustration */}
        <motion.div
          className="bg-gradient-to-br from-purple-700 to-indigo-600 text-white flex flex-col justify-center p-10"
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-4xl font-extrabold mb-3">Join BudgetWise 🎯</h2>
          <p className="text-lg text-indigo-100 leading-relaxed">
            Track your money smartly, set goals, and stay financially confident.
          </p>
        </motion.div>

        {/* Right Side Form */}
        <motion.div
          className="p-10 flex flex-col justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
            Create Your Account
          </h2>
          <form onSubmit={submit} className="space-y-5">
            <input
              name="username"
              placeholder="Username"
              onChange={change}
              value={data.username}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={change}
              value={data.email}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={change}
              value={data.password}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            <select
              name="role"
              value={data.role}
              onChange={change}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {loading ? "Creating..." : "Signup"}
            </motion.button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

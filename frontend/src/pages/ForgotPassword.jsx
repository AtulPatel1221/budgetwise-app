// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <motion.div
        className="bg-white w-full max-w-md shadow-xl rounded-2xl p-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-4">
          Forgot Password?
        </h2>

        <p className="text-gray-600 text-center mb-6">
          Enter your registered email. We’ll send you a reset link.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter Email"
            className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </motion.button>
        </form>

        {msg && (
          <p className="text-center mt-4 text-sm text-green-600 font-semibold">
            {msg}
          </p>
        )}
      </motion.div>
    </div>
  );
}

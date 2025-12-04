import React, { useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, KeyRound } from "lucide-react";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  // ✔ LIVE PASSWORD VALIDATION
  const validatePassword = (pass) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!regex.test(pass)) {
      setPasswordError(
        "Password must contain uppercase, lowercase, number, special character, and min 8 characters."
      );
    } else {
      setPasswordError("");
    }
  };

  // 🔐 Change Password API
  const changePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError("");

    // BLOCK weak password
    if (passwordError) {
      setError("New password is weak. Fix it before submitting!");
      setLoading(false);
      return;
    }

    // Check confirm password
    if (newPassword !== confirmPassword) {
      setError("New password and Confirm password do not match!");
      setLoading(false);
      return;
    }

    try {
      const res = await API.post(
        "/auth/change-password",
        { oldPassword, newPassword, confirmPassword }, // FIXED
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      setMsg(res.data.message);

      // Clear fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    !oldPassword ||
    !newPassword ||
    !confirmPassword ||
    passwordError ||
    loading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex justify-center items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="backdrop-blur-xl bg-white/10 w-full max-w-md rounded-3xl shadow-2xl p-8 border border-white/20 text-white"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-lg">
            <ShieldCheck size={40} />
          </div>

          <h2 className="text-3xl font-extrabold mt-4">Change Password</h2>
          <p className="text-indigo-200 text-sm mt-1">
            Keep your account safe & secure
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={changePassword}>
          {/* Old password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-indigo-300" size={20} />
            <input
              type="password"
              placeholder="Old Password"
              className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-indigo-200 focus:ring-2 focus:ring-purple-300 outline-none"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          {/* New password */}
          <div className="relative">
            <KeyRound
              className="absolute left-3 top-3 text-indigo-300"
              size={20}
            />
            <input
              type="password"
              placeholder="New Password"
              className={`w-full pl-10 pr-4 py-3 bg-white/20 border rounded-xl text-white placeholder-indigo-200 focus:ring-2 outline-none ${
                passwordError
                  ? "border-red-400 focus:ring-red-300"
                  : "border-white/30"
              }`}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              required
            />
          </div>

          {/* Password error message */}
          {passwordError && (
            <p className="text-red-300 text-sm -mt-3">{passwordError}</p>
          )}

          {/* Confirm password */}
          <div className="relative">
            <KeyRound
              className="absolute left-3 top-3 text-indigo-300"
              size={20}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-indigo-200 focus:ring-2 focus:ring-purple-300 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={!isDisabled ? { scale: 1.02 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
            className={`w-full py-3 rounded-xl font-semibold shadow-lg transition ${
              isDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600 text-white"
            }`}
            disabled={isDisabled}
          >
            {loading ? "Updating..." : "Update Password"}
          </motion.button>
        </form>

        {/* Success or Error Message */}
        {msg && (
          <p className="text-center mt-4 text-green-300 font-semibold">
            {msg}
          </p>
        )}
        {error && (
          <p className="text-center mt-4 text-red-300 font-semibold">{error}</p>
        )}

        {/* Cancel */}
        <button
          onClick={() => window.history.back()}
          className="block text-center mt-6 text-indigo-200 hover:text-white transition"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}

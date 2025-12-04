import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Shield, User2, LogOut, KeyRound } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/user/profile", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setProfile(res.data);
      } catch (err) {
        alert("Session expired. Please login again.");
        nav("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [nav]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    nav("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white text-lg">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex justify-center items-center px-4">

      {/* Smaller Profile Card */}
      <motion.div
        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-white"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        
        {/* Header */}
        <div className="text-center p-6 bg-gradient-to-b from-white/10 to-transparent">
          <motion.div
            className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-lg border border-white/40 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <User2 size={38} className="text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold mt-3 tracking-wide">
            {profile.username}
          </h2>

          <p className="text-indigo-100 mt-1 text-xs">
            Manage your account & security
          </p>
        </div>

        {/* Details Section (Smaller) */}
        <div className="p-6 space-y-4">

          {/* Email */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 rounded-xl p-4 border border-white/20 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-200 uppercase">Email</p>
              <p className="text-lg font-semibold">{profile.email}</p>
            </div>
            <Mail size={26} className="text-pink-300" />
          </motion.div>

          {/* Role */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 rounded-xl p-4 border border-white/20 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-200 uppercase">Role</p>
              <p className={`text-lg font-semibold ${
                profile.role === "ADMIN" ? "text-red-300" : "text-green-300"
              }`}>
                {profile.role}
              </p>
            </div>
            <Shield size={26} className="text-indigo-300" />
          </motion.div>

          {/* Account Type */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 rounded-xl p-4 border border-white/20 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-200 uppercase">Account Type</p>
              <p className="text-lg font-semibold text-yellow-300">BudgetWise User</p>
            </div>
            <span className="text-2xl">💰</span>
          </motion.div>

          {/* Change Password */}
          <motion.button
            onClick={() => nav("/change-password")}
            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-semibold flex items-center justify-center gap-1 shadow-md text-sm"
            whileHover={{ scale: 1.03 }}
          >
            <KeyRound size={18} /> Change Password
          </motion.button>
        </div>

        {/* Logout */}
        <div className="p-6 border-t border-white/10 flex justify-center">
          <motion.button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg text-sm"
            whileHover={{ scale: 1.05 }}
          >
            <LogOut size={16} /> Logout
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
}

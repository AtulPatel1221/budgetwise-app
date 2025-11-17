import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Shield, User2, LogOut } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  // 🔹 Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/user/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        alert("Session expired. Please login again.");
        nav("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [nav]);

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    nav("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 flex justify-center items-center">

      <motion.div
        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden text-white"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 🔵 Header */}
        <div className="text-center p-10 bg-gradient-to-b from-white/20 to-transparent">
          <motion.div
            className="w-28 h-28 mx-auto rounded-full bg-white/20 backdrop-blur-lg border border-white/40 flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <User2 size={48} className="text-white" />
          </motion.div>

          <h2 className="text-4xl font-extrabold mt-4 tracking-wide">
            {profile.username}
          </h2>
          <p className="text-indigo-100 mt-2 text-sm">
            Manage your account details & security 🔐
          </p>
        </div>

        {/* 🔐 Details Section */}
        <div className="p-8 space-y-6">

          {/* 📧 Email */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 shadow-md flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-200 uppercase tracking-wide">
                Email Address
              </p>
              <p className="text-xl font-semibold">{profile.email}</p>
            </div>
            <Mail size={32} className="text-pink-300" />
          </motion.div>

          {/* 🛡️ Role */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 shadow-md flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-200 uppercase tracking-wide">
                Role
              </p>
              <p
                className={`text-xl font-semibold ${
                  profile.role === "ADMIN" ? "text-red-300" : "text-green-300"
                }`}
              >
                {profile.role}
              </p>
            </div>
            <Shield size={32} className="text-indigo-300" />
          </motion.div>

          {/* 💳 Account Type */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 shadow-md flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-200 uppercase tracking-wide">
                Account Type
              </p>
              <p className="text-xl font-semibold text-yellow-300">
                BudgetWise User
              </p>
            </div>
            <span className="text-3xl">💰</span>
          </motion.div>

        </div>

        {/* 🚪 Logout */}
        <div className="p-8 border-t border-white/10 flex justify-center">
          <motion.button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-10 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg transition-all"
            whileHover={{ scale: 1.07 }}
          >
            <LogOut size={20} /> Logout
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
}

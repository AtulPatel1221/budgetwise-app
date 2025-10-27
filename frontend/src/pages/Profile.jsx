import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  // ✅ Fetch user profile
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

  // ✅ Logout
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 flex justify-center items-center text-white">
      <motion.div
        className="bg-white text-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 🎨 Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-center">
          <motion.div
            className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-4xl font-bold text-indigo-600">
              {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
            </span>
          </motion.div>
          <h2 className="text-3xl font-bold mt-4">{profile.username}</h2>
          <p className="text-indigo-100 text-sm mt-2">
            Welcome back to your BudgetWise account 💼
          </p>
        </div>

        {/* 🧾 Profile Details Section */}
        <div className="p-8 space-y-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 p-5 rounded-2xl shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="text-sm text-gray-500 uppercase font-semibold">
                Email Address
              </h3>
              <p className="text-xl font-bold text-gray-800">{profile.email}</p>
            </div>
            <span className="text-indigo-600 text-2xl">📧</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 p-5 rounded-2xl shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="text-sm text-gray-500 uppercase font-semibold">
                Role
              </h3>
              <p
                className={`text-xl font-bold ${
                  profile.role === "ADMIN" ? "text-red-600" : "text-green-600"
                }`}
              >
                {profile.role}
              </p>
            </div>
            <span className="text-indigo-600 text-2xl">🎯</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 p-5 rounded-2xl shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="text-sm text-gray-500 uppercase font-semibold">
                Account Type
              </h3>
              <p className="text-xl font-bold text-indigo-700">
                BudgetWise User
              </p>
            </div>
            <span className="text-indigo-600 text-2xl">💰</span>
          </motion.div>
        </div>

        {/* 🚪 Logout Section */}
        <div className="p-8 border-t flex justify-center">
          <motion.button
            onClick={handleLogout}
            className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold shadow-md hover:bg-red-600 transition-all"
            whileHover={{ scale: 1.05 }}
          >
            🚪 Logout
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

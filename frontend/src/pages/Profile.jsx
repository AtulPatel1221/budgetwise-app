import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  // ✅ Fetch user profile from backend
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

  // ✅ Logout handler
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-lg w-full">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          My Profile
        </h2>

        {/* Profile Info */}
        <div className="space-y-5">
          <div>
            <label className="block text-gray-500 font-semibold uppercase text-sm mb-1">
              Username
            </label>
            <p className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
              {profile.username}
            </p>
          </div>

          <div>
            <label className="block text-gray-500 font-semibold uppercase text-sm mb-1">
              Email
            </label>
            <p className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
              {profile.email}
            </p>
          </div>

          <div>
            <label className="block text-gray-500 font-semibold uppercase text-sm mb-1">
              Role
            </label>
            <p
              className={`text-xl font-bold ${
                profile.role === "ADMIN"
                  ? "text-red-600"
                  : "text-green-600"
              } border-b border-gray-200 pb-2`}
            >
              {profile.role}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center mt-10">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white w-full py-3 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

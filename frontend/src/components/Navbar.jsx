import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex justify-between items-center px-8 py-3 shadow-md">
      {/* Logo / Title */}
      <div className="text-2xl font-bold tracking-wide flex items-center gap-2">
        <span>💰</span> BudgetWise
      </div>

      {/* Navigation Links */}
      <div className="space-x-6 text-lg font-medium flex items-center">
        {/* If not logged in */}
        {!token ? (
          <>
            <Link to="/signup" className="hover:text-gray-200 transition">
              Signup
            </Link>
            <Link to="/login" className="hover:text-gray-200 transition">
              Login
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="hover:text-gray-200 transition">
              Dashboard
            </Link>
            {/* ✅ New Transactions Link */}
            <Link to="/transactions" className="hover:text-gray-200 transition">
              Transactions
            </Link>
            <Link to="/profile" className="hover:text-gray-200 transition">
              Profile
            </Link>

            {/* ✅ Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-md text-white font-medium transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

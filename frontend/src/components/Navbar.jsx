import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <motion.nav
      className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 shadow-lg sticky top-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3 text-white">
        {/* 💰 Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-extrabold tracking-wide hover:scale-105 transition-transform"
        >
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            💰
          </motion.span>
          <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
            BudgetWise
          </span>
        </Link>

        {/* 📱 Mobile Menu Icon */}
        <button
          onClick={toggleMenu}
          className="md:hidden focus:outline-none text-white"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* 🧭 Links */}
        <div
          className={`md:flex md:space-x-8 items-center font-medium text-lg ${
            isMenuOpen
              ? "flex flex-col absolute top-16 left-0 w-full bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 py-5 space-y-4 md:static md:flex-row md:space-y-0 md:bg-none"
              : "hidden md:flex"
          }`}
        >
          {!token ? (
            <>
              <Link
                to="/signup"
                className="hover:text-yellow-200 transition duration-200"
              >
                Signup
              </Link>
              <Link
                to="/login"
                className="hover:text-yellow-200 transition duration-200"
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="hover:text-yellow-200 transition duration-200"
              >
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className="hover:text-yellow-200 transition duration-200"
              >
                Transactions
              </Link>
              <Link
                to="/budgets"
                className="hover:text-yellow-200 transition duration-200"
              >
                Budgets
              </Link>
              <Link
                to="/goals"
                className="hover:text-yellow-200 transition duration-200"
              >
                Goals
              </Link>
              <Link
                to="/analytics"
                className="hover:text-yellow-200 transition duration-200"
              >
                Analytics
              </Link>
              <Link
                to="/profile"
                className="hover:text-yellow-200 transition duration-200"
              >
                Profile
              </Link>

              {/* 🔘 Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-full shadow-md font-semibold transition-all"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

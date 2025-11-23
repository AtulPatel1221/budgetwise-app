import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); 
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <motion.nav
      className="backdrop-blur-md bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600/90 
                 shadow-lg sticky top-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-3 text-white">

        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-extrabold tracking-wide hover:scale-105 transition-transform"
        >
          <span className="text-3xl">💰</span>
          <span className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
            BudgetWise
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white hover:scale-110 transition"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navigation */}
        <div
          className={`${
            isMenuOpen
              ? "flex flex-col absolute top-20 left-0 w-full bg-indigo-800/95 py-5 space-y-4 md:hidden"
              : "hidden md:flex"
          } md:flex md:items-center md:space-x-8 text-lg font-medium`}
        >
          {!token ? (
            <>
              <Link className="hover:text-yellow-300" to="/signup">Signup</Link>
              <Link className="hover:text-yellow-300" to="/login">Login</Link>
            </>
          ) : (
            <>
              {/* ----------------------- USER NAVIGATION ----------------------- */}
              {role !== "ADMIN" && (
                <>
                  <Link to="/dashboard" className="hover:text-yellow-300">Dashboard</Link>
                  <Link to="/transactions" className="hover:text-yellow-300">Transactions</Link>
                  <Link to="/budgets" className="hover:text-yellow-300">Budgets</Link>
                  <Link to="/goals" className="hover:text-yellow-300">Goals</Link>
                  <Link to="/forum" className="hover:text-yellow-300">Forum</Link>
                  <Link to="/reports" className="hover:text-yellow-300">Reports</Link>
                  <Link to="/profile" className="hover:text-yellow-300">Profile</Link>

                  <Link
                    to="/chatbot"
                    className="bg-white/20 px-4 py-1.5 rounded-full shadow-sm hover:bg-white/30 hover:scale-105 transition-all"
                  >
                    AI Help
                  </Link>
                </>
              )}

              {/* ----------------------- ADMIN NAVIGATION ----------------------- */}
              {role === "ADMIN" && (
                <>
                  <Link
                    to="/admin"
                    className="bg-yellow-400/80 px-5 py-2 rounded-full text-gray-900 font-semibold shadow-md hover:bg-yellow-400 hover:scale-105 transition"
                  >
                    Admin Panel
                  </Link>

                  <Link to="/profile" className="hover:text-yellow-300">Profile</Link>
                </>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-500/80 hover:bg-red-600 px-5 py-2 rounded-full shadow-md font-semibold transition-all"
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

import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Sparkles, LogOut, UserCircle } from "lucide-react";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinkClass = ({ isActive }) =>
    `transition-all text-[15px] font-medium hover:text-yellow-300 ${
      isActive ? "text-yellow-300" : "text-white"
    }`;

  return (
    <motion.nav
      className="backdrop-blur-xl bg-gradient-to-r from-indigo-900/90 via-purple-800/90 to-pink-700/90 shadow-xl sticky top-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">

        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-extrabold tracking-wide hover:scale-105 transition"
        >
          <span className="text-3xl">💰</span>
          <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
            BudgetWise
          </span>
          <Sparkles size={16} className="text-yellow-300" />
        </Link>

        {/* Mobile Toggle */}
        <button onClick={toggleMenu} className="md:hidden text-white">
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 text-[15px]">
          {!token ? (
            <>
              <NavLink className={navLinkClass} to="/signup">Signup</NavLink>
              <NavLink className={navLinkClass} to="/login">Login</NavLink>
            </>
          ) : (
            <>
              {role !== "ADMIN" && (
                <>
                  <NavLink className={navLinkClass} to="/dashboard">Dashboard</NavLink>
                  <NavLink className={navLinkClass} to="/transactions">Transactions</NavLink>

                  {/* ⭐ Analytics placed after Transactions */}
                  <NavLink className={navLinkClass} to="/analytics">Analytics</NavLink>

                  <NavLink className={navLinkClass} to="/budgets">Budgets</NavLink>
                  <NavLink className={navLinkClass} to="/goals">Goals</NavLink>
                  <NavLink className={navLinkClass} to="/forum">Forum</NavLink>
                  <NavLink className={navLinkClass} to="/reports">Reports</NavLink>

                  <NavLink
                    to="/chatbot"
                    className="bg-white/20 px-4 py-1.5 rounded-full text-[14.5px] font-medium hover:bg-white/30"
                  >
                    🤖 AI Assistant
                  </NavLink>
                </>
              )}

              {/* ⭐ ADMIN PANEL BUTTON */}
              {role === "ADMIN" && (
                <NavLink
                  to="/admin"
                  className="bg-yellow-400/90 px-4 py-1.5 rounded-full text-gray-900 font-semibold shadow-md hover:bg-yellow-300 hover:scale-105 transition"
                >
                  Admin Panel
                </NavLink>
              )}

              {/* Account Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-[14.5px] hover:bg-white/30"
                >
                  <UserCircle size={18} />
                  My Account
                </button>

                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-40 bg-white text-gray-700 rounded-lg shadow-lg text-[15px]"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-100 text-red-600"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react"; // NEW ICONS
import API from "../services/api";

export default function Signup() {
  const nav = useNavigate();
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER",
  });

  const [showPassword, setShowPassword] = useState(false);

  // LIVE VALIDATION
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // EMAIL VALIDATION (must end with @gmail.com)
  const validateEmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(email)) {
      setEmailError("Email must end with @gmail.com");
    } else {
      setEmailError("");
    }
  };

  // PASSWORD VALIDATION
  const validatePassword = (pass) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!passwordRegex.test(pass)) {
      setPasswordError(
        "Password must contain: uppercase, lowercase, number, special character, and min 8 characters"
      );
    } else {
      setPasswordError("");
    }
  };

  const change = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });

    if (name === "email") validateEmail(value);
    if (name === "password") validatePassword(value);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (emailError || passwordError) {
      return alert("Fix the errors before submitting.");
    }

    try {
      await API.post("/auth/signup", data);
      alert("🎉 Account created successfully! Please login.");
      nav("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed!");
    }
  };

  const isFormValid =
    data.username &&
    data.email &&
    data.password &&
    !emailError &&
    !passwordError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex justify-center items-center p-6">
      <motion.div
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Left Side */}
        <motion.div
          className="bg-gradient-to-br from-purple-700 to-indigo-600 text-white flex flex-col justify-center p-10"
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-4xl font-extrabold mb-3">Join BudgetWise 🎯</h2>
          <p className="text-lg text-indigo-100 leading-relaxed">
            Track your money smartly, set goals, and stay financially confident.
          </p>
        </motion.div>

        {/* Right Side Form */}
        <motion.div
          className="p-10 flex flex-col justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
            Create Your Account
          </h2>

          <form onSubmit={submit} className="space-y-5">
            {/* Username */}
            <input
              name="username"
              placeholder="Username"
              onChange={change}
              value={data.username}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />

            {/* Email */}
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={change}
                value={data.email}
                className={`w-full px-4 py-3 border rounded-lg outline-none ${
                  emailError
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:ring-indigo-500"
                }`}
                required
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  onChange={change}
                  value={data.password}
                  className={`w-full px-4 py-3 border rounded-lg outline-none ${
                    passwordError
                      ? "border-red-500 focus:ring-red-400"
                      : "focus:ring-indigo-500"
                  }`}
                  required
                />

                {/* Modern Eye Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-500 hover:text-indigo-600 transition"
                >
                  {showPassword ? (
                    <EyeOff size={22} />
                  ) : (
                    <Eye size={22} />
                  )}
                </button>
              </div>

              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            {/* Role */}
            <select
              name="role"
              value={data.role}
              onChange={change}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>

            {/* Submit Button */}
            <motion.button
              whileHover={isFormValid ? { scale: 1.05 } : {}}
              whileTap={isFormValid ? { scale: 0.95 } : {}}
              disabled={!isFormValid}
              className={`w-full py-3 rounded-lg font-semibold transition text-white ${
                isFormValid
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Signup
            </motion.button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

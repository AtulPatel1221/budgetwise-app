import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [transactions, setTransactions] = useState([]);

  // ✅ Fetch user profile
  const fetchUser = async () => {
    try {
      const res = await API.get("/user/profile");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  // ✅ Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchTransactions();
  }, []);

  // 💰 Summary Calculations
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  // 🧾 Recent Transactions (latest 5)
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // 💬 Random motivational quote
  const tips = [
    "Small savings every day lead to big achievements!",
    "A budget tells your money where to go instead of wondering where it went.",
    "Save before you spend — future you will thank you!",
    "Track your habits, not just your expenses.",
    "Every rupee saved is a step toward freedom."
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 text-white">
      <div className="max-w-7xl mx-auto">
        {/* 👤 Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold">
              Welcome, {user.username ? user.username : "User"} 👋
            </h1>
            <p className="text-indigo-100 mt-2 text-lg">
              Here’s your financial summary at a glance.
            </p>
          </div>
          <div className="mt-6 md:mt-0 bg-white text-indigo-700 px-6 py-3 rounded-full shadow-lg text-lg font-semibold">
            💼 Balance: ₹{balance.toFixed(2)}
          </div>
        </div>

        {/* 💰 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-green-100 text-green-800 p-6 rounded-2xl shadow-xl hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold">Total Income</h3>
            <p className="text-3xl font-bold mt-2">₹{totalIncome.toFixed(2)}</p>
            <p className="text-sm mt-2 text-gray-600">
              All income sources combined.
            </p>
          </div>
          <div className="bg-red-100 text-red-800 p-6 rounded-2xl shadow-xl hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold">Total Expenses</h3>
            <p className="text-3xl font-bold mt-2">₹{totalExpense.toFixed(2)}</p>
            <p className="text-sm mt-2 text-gray-600">
              All your monthly spendings.
            </p>
          </div>
          <div className="bg-indigo-100 text-indigo-800 p-6 rounded-2xl shadow-xl hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold">Net Balance</h3>
            <p className="text-3xl font-bold mt-2">₹{balance.toFixed(2)}</p>
            <p className="text-sm mt-2 text-gray-600">
              Remaining after expenses.
            </p>
          </div>
        </div>

        {/* 📊 Chart Placeholders (Future Recharts Integration) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-md h-80 flex flex-col justify-center items-center">
            <h3 className="text-xl font-bold mb-2 text-indigo-700">
              Pie Chart - Category Wise Expense
            </h3>
            <p className="text-gray-500">📊 Chart will appear here soon.</p>
          </div>

          <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-md h-80 flex flex-col justify-center items-center">
            <h3 className="text-xl font-bold mb-2 text-indigo-700">
              Bar Chart - Income vs Expense
            </h3>
            <p className="text-gray-500">📈 Chart will appear here soon.</p>
          </div>
        </div>

        {/* 🧾 Recent Transactions */}
        <div className="bg-white text-gray-800 rounded-2xl shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">
            Recent Transactions
          </h2>
          {recent.length > 0 ? (
            <table className="min-w-full border rounded-lg">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{t.date}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          t.type === "INCOME"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3">{t.category}</td>
                    <td className="p-3 font-semibold">₹{t.amount}</td>
                    <td className="p-3">{t.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No transactions found yet.
            </p>
          )}
        </div>

        {/* 🎯 Buttons + Motivation */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/transactions")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-indigo-700 transition"
            >
              ➕ Add / Manage Transactions
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="bg-white text-indigo-700 px-6 py-3 rounded-full shadow-md hover:bg-gray-100 transition font-semibold"
            >
              👤 View Profile
            </button>
          </div>

          <div className="text-gray-100 italic text-lg mt-4 md:mt-0">
            💬 {tip}
          </div>
        </div>
      </div>
    </div>
  );
}

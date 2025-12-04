import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const COLORS = ["#4F46E5", "#22C55E", "#F97316", "#06B6D4", "#E11D48", "#8B5CF6"];

  // ==================== APIs ====================
  const fetchUser = async () => {
    try {
      const res = await API.get("/user/profile");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const catRes = await API.get("/analytics/category-summary");
      const monRes = await API.get("/analytics/monthly-summary");

      const formattedCat = Object.entries(catRes.data).map(([name, value]) => ({
        name,
        value
      }));

      setCategoryData(formattedCat);
      setMonthlyData(monRes.data);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchTransactions();
    fetchAnalytics();
  }, []);

  // ==================== Calculations ====================
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const tips = [
    "Small savings everyday lead to big achievements!",
    "A budget tells your money where to go instead of wondering where it went.",
    "Save before you spend — future you will thank you!",
    "Track your habits, not just your expenses.",
    "Every rupee saved is a step toward financial freedom."
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 text-white">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
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

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <SummaryCard title="Total Income" amount={totalIncome} type="income" />
          <SummaryCard title="Total Expenses" amount={totalExpense} type="expense" />
          <SummaryCard title="Net Balance" amount={balance} type="balance" />
        </div>

        {/* ⭐ REMOVED AI PREDICTION CARD COMPLETELY */}

        <MiniCharts categoryData={categoryData} monthlyData={monthlyData} COLORS={COLORS} />
        <RecentTransactions recent={recent} />

        {/* FOOTER BUTTONS */}
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

          <div className="text-gray-100 italic text-lg">
            💬 {tip}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */

function SummaryCard({ title, amount, type }) {
  const config = {
    income: {
      icon: "💰",
      gradient: "from-green-500 to-emerald-600",
      shadow: "shadow-green-300"
    },
    expense: {
      icon: "💸",
      gradient: "from-red-500 to-rose-600",
      shadow: "shadow-red-300"
    },
    balance: {
      icon: "📊",
      gradient: "from-indigo-500 to-purple-600",
      shadow: "shadow-indigo-300"
    }
  };

  const style = config[type];

  return (
    <div
      className={`bg-gradient-to-br ${style.gradient} p-6 rounded-3xl bg-opacity-90 backdrop-blur-xl text-white ${style.shadow} shadow-xl transform hover:scale-105 transition-all duration-300`}
    >
      <div className="text-4xl">{style.icon}</div>
      <h3 className="text-xl font-semibold mt-2">{title}</h3>

      <p className="text-4xl font-extrabold mt-3 drop-shadow-lg">₹{amount.toFixed(2)}</p>

      <p className="text-sm mt-2 text-white/90">
        {type === "income" && "Your total earnings"}
        {type === "expense" && "Total spending this month"}
        {type === "balance" && "Remaining after expenses"}
      </p>
    </div>
  );
}

function MiniCharts({ categoryData, monthlyData, COLORS }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      {/* Pie Chart */}
      <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-md h-80">
        <h3 className="text-xl font-bold mb-4 text-indigo-700 text-center">
          Category-wise Spending
        </h3>

        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 mt-12">No data available</p>
        )}
      </div>

      {/* Bar Chart */}
      <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-md h-80">
        <h3 className="text-xl font-bold mb-4 text-indigo-700 text-center">
          Monthly Income VS Expense
        </h3>

        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#22C55E" />
              <Bar dataKey="expense" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 mt-12">No data available</p>
        )}
      </div>
    </div>
  );
}

function RecentTransactions({ recent }) {
  return (
    <div className="bg-white text-gray-800 rounded-2xl shadow-lg p-6 mb-12">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Recent Transactions</h2>

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
              <tr key={t.id} className="border-b hover:bg-gray-50 transition">
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
        <p className="text-center text-gray-500 py-4">
          No transactions found yet.
        </p>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import API from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";

export default function Analytics() {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const COLORS = ["#4F46E5", "#22C55E", "#F97316", "#06B6D4", "#E11D48", "#8B5CF6"];

  const fetchAnalytics = async () => {
    try {
      const catRes = await API.get("/analytics/category-summary");
      const monRes = await API.get("/analytics/monthly-summary");

      const formattedCatData = Object.entries(catRes.data).map(([category, amount]) => ({
        name: category,
        value: amount,
      }));

      setCategoryData(formattedCatData);
      setMonthlyData(monRes.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      alert("Failed to load analytics data");
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 flex justify-center items-center text-white">
      <motion.div
        className="max-w-7xl w-full bg-white text-gray-900 rounded-3xl shadow-2xl p-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold text-center mb-10 text-indigo-700 tracking-wide">
          📊 Financial Analytics Overview
        </h1>

        {/* 🔹 Two charts side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* 💸 Pie Chart */}
          <motion.div
            className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl font-bold mb-5 text-center text-indigo-700">
              💸 Category-wise Spending
            </h2>
            <div className="flex justify-center items-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      fill="#8884d8"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 mt-8">No data available</p>
              )}
            </div>
          </motion.div>

          {/* 📅 Bar Chart */}
          <motion.div
            className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl font-bold mb-5 text-center text-indigo-700">
              📅 Monthly Income vs Expenses
            </h2>
            <div className="flex justify-center items-center">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="income" fill="#22C55E" name="Income" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="expense" fill="#EF4444" name="Expense" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 mt-8">No data available</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* 📈 Footer Insight Section */}
        <motion.div
          className="mt-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl shadow-lg p-8 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold mb-3">💡 Financial Insights</h3>
          <p className="text-lg text-indigo-100">
            Keep tracking your spending patterns and income trends!  
            These analytics help you plan budgets, monitor expenses,  
            and achieve your financial goals efficiently 🚀
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

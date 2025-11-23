import React, { useEffect, useState } from "react";
import API from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line,
  RadialBarChart, RadialBar
} from "recharts";
import { motion } from "framer-motion";

export default function Analytics() {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [aiData, setAiData] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const COLORS = ["#4F46E5", "#22C55E", "#F97316", "#06B6D4", "#E11D48", "#8B5CF6"];

  useEffect(() => {
    loadAnalytics();
    loadAiPrediction();
  }, []);

  const loadAnalytics = async () => {
    try {
      const catRes = await API.get("/analytics/category-summary");
      const monRes = await API.get("/analytics/monthly-summary");

      const formattedCatData = Object.entries(catRes.data).map(([category, amount]) => ({
        name: category,
        value: amount
      }));

      setCategoryData(formattedCatData);
      setMonthlyData(monRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAiPrediction = async () => {
    try {
      setLoadingAi(true);
      const res = await API.get("/ai/predict-expenses");
      setAiData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  // Build mini prediction chart
  const buildLineSeries = () => {
    if (!aiData?.monthlyTotals) return [];

    const months = [...aiData.months].sort();
    const series = months.map((m) => ({
      month: m,
      expense: aiData.monthlyTotals[m]
    }));

    // Add prediction point
    const last = months[months.length - 1];
    const [y, m] = last.split("-").map(Number);
    const nextMonth = `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}`;

    series.push({
      month: nextMonth,
      expense: aiData.nextMonthPrediction,
      predicted: true
    });

    return series;
  };

  const savingsPercent = () => {
    if (monthlyData.length === 0) return 0;
    const last = monthlyData[monthlyData.length - 1];
    const { income = 0, expense = 0 } = last;
    if (income === 0) return 0;
    return Math.round(((income - expense) / income) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 flex justify-center items-start text-white">
      <motion.div
        className="max-w-7xl w-full bg-white text-gray-900 rounded-3xl shadow-2xl p-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold text-center mb-12 text-indigo-700 tracking-wide drop-shadow">
          📊 Financial Analytics Dashboard
        </h1>

        {/* ================================
            🔥 TOP SECTION – TWO MAIN CHARTS
        ================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

          {/* PIE CHART */}
          <motion.div
            className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-3xl p-6 shadow-xl hover:scale-105 transition"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl font-bold text-center text-indigo-700 mb-5">
              💸 Category-wise Spending
            </h2>

            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    dataKey="value"
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 mt-20">No Data Available</p>
            )}
          </motion.div>

          {/* MONTHLY INCOME vs EXPENSE */}
          <motion.div
            className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-3xl p-6 shadow-xl hover:scale-105 transition"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl font-bold text-center text-indigo-700 mb-5">
              📅 Monthly Income vs Expense
            </h2>

            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#16A34A" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="#DC2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 mt-20">No Data Available</p>
            )}
          </motion.div>
        </div>

        {/* ================================
            🤖 AI PREDICTION + SAVINGS + INSIGHTS
        ================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* AI Prediction */}
          <motion.div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-indigo-700 mb-3">
              🤖 AI Next-Month Expense
            </h2>

            {loadingAi ? (
              <p className="text-gray-500">Calculating...</p>
            ) : aiData ? (
              <>
                <p className="text-3xl font-extrabold text-purple-700">
                  ₹{aiData.nextMonthPrediction.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm mb-4">Forecast based on previous months.</p>

                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={buildLineSeries()}>
                      <Line dataKey="expense" stroke="#7C3AED" strokeWidth={2} dot />
                      <XAxis dataKey="month" hide />
                      <ReTooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <p>No prediction available</p>
            )}
          </motion.div>

          {/* Savings Gauge */}
          <motion.div className="bg-gradient-to-br from-white to-gray-100 rounded-3xl p-6 shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold text-indigo-700 mb-3">💾 Savings Percentage</h2>

            <div style={{ width: 180, height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="100%"
                  data={[{ name: "Savings", value: savingsPercent() }]}
                  startAngle={220}
                  endAngle={-40}
                >
                  <RadialBar dataKey="value" cornerRadius={12} fill="#7C3AED" />
                  <ReTooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-3xl font-extrabold text-purple-700">{savingsPercent()}%</p>
            <p className="text-sm text-gray-500 mt-2">Based on latest month</p>
          </motion.div>

          {/* Insights */}
          <motion.div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-indigo-700 mb-3">🔍 Key Highlights</h2>

            {/* Highest Category */}
            {categoryData.length > 0 ? (
              <div className="p-3 bg-white rounded-xl mb-3 shadow">
                <p className="text-gray-500 text-sm">Highest Spending</p>
                <p className="font-bold text-lg text-gray-800">
                  {categoryData.sort((a, b) => b.value - a.value)[0].name}
                </p>
              </div>
            ) : (
              <p className="text-gray-400">No data</p>
            )}

            {/* Month Change */}
            {monthlyData.length >= 2 ? (
              (() => {
                const sorted = [...monthlyData].sort(
                  (a, b) => new Date(a.month) - new Date(b.month)
                );
                const last = sorted[sorted.length - 1];
                const prev = sorted[sorted.length - 2];
                const diff = last.expense - prev.expense;

                return (
                  <div className="p-3 bg-white rounded-xl mb-3 shadow">
                    <p className="text-gray-500 text-sm">Expense Trend</p>
                    <p className="font-bold text-lg text-gray-800">
                      {diff > 0
                        ? `↑ Increased by ₹${diff}`
                        : diff < 0
                        ? `↓ Reduced by ₹${Math.abs(diff)}`
                        : "No Change"}
                    </p>
                  </div>
                );
              })()
            ) : (
              <p className="text-gray-400">Not enough monthly data</p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

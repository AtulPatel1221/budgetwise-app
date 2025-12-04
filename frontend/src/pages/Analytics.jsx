import React, { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { motion } from "framer-motion";

export default function Analytics() {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [aiData, setAiData] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [timeRange, setTimeRange] = useState("LAST_6"); // NEW: time filter

  const COLORS = ["#4F46E5", "#22C55E", "#F97316", "#06B6D4", "#E11D48", "#8B5CF6"];

  useEffect(() => {
    loadAnalytics();
    loadAiPrediction();
  }, []);

  const loadAnalytics = async () => {
    try {
      const catRes = await API.get("/analytics/category-summary");
      const monRes = await API.get("/analytics/monthly-summary");

      const formattedCatData = Object.entries(catRes.data || {}).map(
        ([category, amount]) => ({
          name: category,
          value: amount,
        })
      );

      setCategoryData(formattedCatData);
      setMonthlyData(monRes.data || []);
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

  // ========== HELPER: FILTER MONTHLY DATA BY TIME RANGE ==========
  const getFilteredMonthlyData = (data, range) => {
    if (!data || data.length === 0) return [];

    const sorted = [...data].sort((a, b) => {
      const da = new Date(a.month);
      const db = new Date(b.month);
      return da - db;
    });

    if (range === "LAST_3") return sorted.slice(-3);
    if (range === "LAST_6") return sorted.slice(-6);
    if (range === "LAST_12") return sorted.slice(-12);
    if (range === "THIS_YEAR") {
      const last = sorted[sorted.length - 1];
      const lastYear = new Date(last.month).getFullYear();
      return sorted.filter((m) => new Date(m.month).getFullYear() === lastYear);
    }

    // ALL
    return sorted;
  };

  const filteredMonthlyData = useMemo(
    () => getFilteredMonthlyData(monthlyData, timeRange),
    [monthlyData, timeRange]
  );

  // Build mini prediction chart from AI data
  const buildLineSeries = () => {
    if (!aiData?.monthlyTotals || !aiData?.months) return [];

    const months = [...aiData.months].sort();
    const series = months.map((m) => ({
      month: m,
      expense: aiData.monthlyTotals[m],
    }));

    // Add prediction point
    const last = months[months.length - 1];
    const [y, m] = last.split("-").map(Number);
    const nextMonth = `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(
      2,
      "0"
    )}`;

    series.push({
      month: nextMonth,
      expense: aiData.nextMonthPrediction,
      predicted: true,
    });

    return series;
  };

  const savingsPercent = () => {
    if (filteredMonthlyData.length === 0) return 0;
    const last = filteredMonthlyData[filteredMonthlyData.length - 1];
    const { income = 0, expense = 0 } = last;
    if (income === 0) return 0;
    return Math.round(((income - expense) / income) * 100);
  };

  const totalIncomeAndExpense = () => {
    if (!filteredMonthlyData.length) return { income: 0, expense: 0 };
    return filteredMonthlyData.reduce(
      (acc, cur) => ({
        income: acc.income + (cur.income || 0),
        expense: acc.expense + (cur.expense || 0),
      }),
      { income: 0, expense: 0 }
    );
  };

  const getTopCategory = () => {
    if (!categoryData.length) return null;
    const sorted = [...categoryData].sort((a, b) => b.value - a.value);
    return sorted[0];
  };

  // ========== COMPARISON WITH LAST MONTH ==========
  const lastMonthComparison = () => {
    if (filteredMonthlyData.length < 2) return null;

    const sorted = [...filteredMonthlyData].sort(
      (a, b) => new Date(a.month) - new Date(b.month)
    );
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];

    const diff = (last.expense || 0) - (prev.expense || 0);
    const percent =
      prev.expense && prev.expense !== 0
        ? Math.round((diff / prev.expense) * 100)
        : 0;

    return { last, prev, diff, percent };
  };

  // ========== AI STYLE ADVICE ==========
  const generateAdvice = () => {
    const sp = savingsPercent();
    const { income, expense } = totalIncomeAndExpense();
    const topCat = getTopCategory();
    const cmp = lastMonthComparison();

    if (!income && !expense && !topCat) {
      return "Start adding your income and expenses to unlock smart insights here.";
    }

    let advice = "";

    if (sp < 15) {
      advice += `Your savings rate is only ${sp}% of your income. Try to push it towards 20–30%.\n`;
    } else if (sp >= 15 && sp <= 35) {
      advice += `Your savings rate of ${sp}% is decent. Try to increase it slightly each month.\n`;
    } else if (sp > 35) {
      advice += `Great! Your savings rate of ${sp}% is very strong. Maintain this discipline.\n`;
    }

    if (topCat) {
      advice += `You spend the most on "${topCat.name}". Check if all of that is essential or if you can reduce it by 5–10%.\n`;
    }

    if (cmp) {
      if (cmp.diff > 0) {
        advice += `Your monthly expenses increased by ₹${cmp.diff.toFixed(
          0
        )} (${cmp.percent}% vs last month). Try reviewing frequent or impulse purchases.\n`;
      } else if (cmp.diff < 0) {
        advice += `Good job! Your expenses decreased by ₹${Math.abs(cmp.diff).toFixed(
          0
        )} (${Math.abs(cmp.percent)}% lower than last month). Keep this trend going.\n`;
      } else {
        advice += `Your spending is almost the same as last month. Try setting a small reduction target for next month.\n`;
      }
    }

    if (!advice) {
      advice =
        "Your finances look stable. Keep tracking your expenses and aim to grow your savings month by month.";
    }

    return advice.trim();
  };

  const savings = savingsPercent();
  const comparison = lastMonthComparison();
  const { income: totalIncome, expense: totalExpense } = totalIncomeAndExpense();
  const topCategory = getTopCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 flex justify-center items-start text-white">
      <motion.div
        className="max-w-7xl w-full bg-white text-gray-900 rounded-3xl shadow-2xl p-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header + Time Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-wide drop-shadow">
            📊 Financial Analytics Dashboard
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border rounded-lg px-3 py-2 bg-white shadow-sm"
            >
              <option value="LAST_3">Last 3 Months</option>
              <option value="LAST_6">Last 6 Months</option>
              <option value="LAST_12">Last 12 Months</option>
              <option value="THIS_YEAR">This Year</option>
              <option value="ALL">All Time</option>
            </select>
          </div>
        </div>

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
              <p className="text-center text-gray-400 mt-20">
                No Data Available. Add some transactions.
              </p>
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

            {filteredMonthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={filteredMonthlyData}>
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
              <p className="text-center text-gray-400 mt-20">
                Not enough monthly data to show.
              </p>
            )}
          </motion.div>
        </div>

        {/* ================================
            📈 EXPENSE TREND LINE (Feature 6)
        ================================== */}
        <div className="mb-12">
          <motion.div
            className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 rounded-3xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-indigo-700 mb-3">
              📈 Expense Trend Over Time
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Track how your total expenses are changing over the selected time range.
            </p>

            {filteredMonthlyData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ReTooltip />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#EF4444"
                      strokeWidth={3}
                      dot
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-400">No expense trend available yet.</p>
            )}
          </motion.div>
        </div>

        {/* ================================
            🤖 AI PREDICTION + SAVINGS + HIGHLIGHTS
        ================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
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
                <p className="text-gray-600 text-sm mb-4">
                  Forecast based on your previous monthly spending.
                </p>

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
              <p>No prediction available yet.</p>
            )}
          </motion.div>

          {/* Savings Gauge */}
          <motion.div className="bg-gradient-to-br from-white to-gray-100 rounded-3xl p-6 shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold text-indigo-700 mb-3">
              💾 Savings Percentage
            </h2>

            <div style={{ width: 180, height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="100%"
                  data={[{ name: "Savings", value: savings }]}
                  startAngle={220}
                  endAngle={-40}
                >
                  <RadialBar dataKey="value" cornerRadius={12} fill="#7C3AED" />
                  <ReTooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-3xl font-extrabold text-purple-700">{savings}%</p>
            <p className="text-sm text-gray-500 mt-2">Based on the latest month</p>
          </motion.div>

          {/* Comparison with Last Month (Feature 8) */}
          <motion.div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-indigo-700 mb-3">
              📌 Last Month Comparison
            </h2>

            {comparison ? (
              <>
                <p className="text-sm text-gray-500 mb-2">
                  Comparing your latest month with the previous one.
                </p>
                <div className="p-3 bg-white rounded-xl mb-3 shadow">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">
                    Latest Month Expense
                  </p>
                  <p className="font-bold text-xl text-gray-800">
                    ₹{comparison.last.expense.toFixed(0)}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl mb-3 shadow">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">
                    Change vs Previous Month
                  </p>
                  <p
                    className={`font-bold text-lg ${
                      comparison.diff > 0 ? "text-red-600" : comparison.diff < 0 ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    {comparison.diff > 0
                      ? `↑ +₹${comparison.diff.toFixed(0)} (${comparison.percent}% more)`
                      : comparison.diff < 0
                      ? `↓ -₹${Math.abs(comparison.diff).toFixed(0)} (${Math.abs(
                          comparison.percent
                        )}% less)`
                      : "No change"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-400">
                Need at least 2 months of data to compare.
              </p>
            )}
          </motion.div>
        </div>

        {/* ================================
            🔍 KEY HIGHLIGHTS + AI ADVICE (Feature 3)
        ================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Key Highlights */}
          <motion.div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-indigo-700 mb-3">🔍 Key Highlights</h2>

            {/* Highest Category */}
            {topCategory ? (
              <div className="p-3 bg-white rounded-xl mb-3 shadow">
                <p className="text-gray-500 text-sm">Highest Spending Category</p>
                <p className="font-bold text-lg text-gray-800">{topCategory.name}</p>
                <p className="text-sm text-gray-500">
                  Total: ₹{topCategory.value.toFixed(0)}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 mb-3">No category data yet.</p>
            )}

            {/* Total Income / Expense in Selected Range */}
            <div className="p-3 bg-white rounded-xl mb-3 shadow">
              <p className="text-gray-500 text-sm">Selected Range Summary</p>
              <p className="text-sm text-gray-600">
                Income:{" "}
                <span className="font-semibold text-green-700">
                  ₹{totalIncome.toFixed(0)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Expense:{" "}
                <span className="font-semibold text-red-600">
                  ₹{totalExpense.toFixed(0)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Savings:{" "}
                <span className="font-semibold text-indigo-700">
                  ₹{(totalIncome - totalExpense).toFixed(0)}
                </span>
              </p>
            </div>
          </motion.div>

          {/* AI Advice Box */}
          <motion.div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-indigo-700 mb-3">
              🤝 Smart Finance Advice
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              Simple, human-friendly suggestions based on your recent spending and
              savings.
            </p>
            <div className="bg-white rounded-2xl p-4 shadow-inner border border-purple-100 text-sm leading-relaxed text-gray-800 whitespace-pre-line">
              {generateAdvice()}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

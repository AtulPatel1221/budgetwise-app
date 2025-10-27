import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({
    id: null,
    month: "",
    year: new Date().getFullYear(),
    category: "Food",
    limitAmount: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    "Food",
    "Rent",
    "Travel",
    "Bills",
    "Shopping",
    "Entertainment",
    "Health",
    "Education",
    "Other",
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchBudgets = async () => {
    try {
      const res = await API.get("/budgets");
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load budgets");
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/budgets", form);
      alert(isEditing ? "Budget updated successfully!" : "Budget added successfully!");
      resetForm();
      fetchBudgets();
    } catch (err) {
      console.error(err);
      alert("Error saving budget");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (b) => {
    setForm(b);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this budget?")) return;
    await API.delete(`/budgets/${id}`);
    fetchBudgets();
  };

  const resetForm = () => {
    setForm({
      id: null,
      month: "",
      year: new Date().getFullYear(),
      category: "Food",
      limitAmount: "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 p-10 text-white">
      <div className="max-w-6xl mx-auto bg-white text-gray-900 rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-indigo-700">
          💰 Monthly Budgets
        </h1>

        {/* Add/Edit Form */}
        <div className="mb-10 bg-gray-50 rounded-2xl p-6 shadow-inner">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            <select
              name="month"
              value={form.month}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Month</option>
              {months.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>

            <input
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            >
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>

            <input
              name="limitAmount"
              type="number"
              placeholder="Budget Limit"
              value={form.limitAmount}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
              required
            />

            <button
              className={`${
                isEditing ? "bg-yellow-500" : "bg-indigo-600"
              } text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition`}
              disabled={loading}
            >
              {isEditing ? "Update" : "Add"}
            </button>
          </form>
        </div>

        {/* Budget Cards */}
        {budgets.length === 0 ? (
          <p className="text-center text-gray-600">No budgets added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((b) => {
              const progress = Math.min((b.spentAmount / b.limitAmount) * 100, 100);
              const remaining = b.limitAmount - (b.spentAmount || 0);

              return (
                <div
                  key={b.id}
                  className="p-6 rounded-2xl shadow-md bg-gradient-to-br from-indigo-50 to-purple-100 hover:shadow-xl transition-all"
                >
                  <h3 className="text-xl font-bold text-indigo-700 mb-2">
                    {b.category}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {b.month} {b.year}
                  </p>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Spent: ₹{b.spentAmount || 0}</span>
                      <span>Limit: ₹{b.limitAmount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          progress > 90
                            ? "bg-red-500"
                            : progress > 60
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm mt-2 text-gray-600">
                      Remaining: ₹{remaining.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => handleEdit(b)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

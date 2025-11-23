import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({
    id: null,
    goalName: "",
    targetAmount: "",
    savedAmount: "",
    deadline: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await API.get("/goals");
      setGoals(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load goals");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/goals", form);
      alert(isEditing ? "Goal updated!" : "Goal added!");
      resetForm();
      fetchGoals();
    } catch (err) {
      console.error(err);
      alert("Error saving goal");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal) => {
    setForm(goal);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    await API.delete(`/goals/${id}`);
    fetchGoals();
  };

  const resetForm = () => {
    setForm({
      id: null,
      goalName: "",
      targetAmount: "",
      savedAmount: "",
      deadline: "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-8">
      <div className="max-w-6xl mx-auto bg-white text-gray-900 rounded-3xl shadow-2xl p-10">

        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-indigo-700 tracking-wide">
          🎯 Savings Goals Tracker
        </h1>

        {/* Form Section */}
        <div className="mb-12 bg-gray-50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6">
            {isEditing ? "✏️ Edit Your Goal" : "➕ Add New Goal"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-5 gap-6"
          >
            <input
              name="goalName"
              placeholder="Goal Name"
              value={form.goalName}
              onChange={handleChange}
              className="border rounded-xl px-4 py-3 shadow-sm bg-white focus:ring-2 focus:ring-indigo-400"
              required
            />

            <input
              name="targetAmount"
              type="number"
              placeholder="Target (₹)"
              value={form.targetAmount}
              onChange={handleChange}
              className="border rounded-xl px-4 py-3 shadow-sm bg-white focus:ring-2 focus:ring-indigo-400"
              required
            />

            <input
              name="savedAmount"
              type="number"
              placeholder="Saved (₹)"
              value={form.savedAmount}
              onChange={handleChange}
              className="border rounded-xl px-4 py-3 shadow-sm bg-white focus:ring-2 focus:ring-indigo-400"
            />

            <input
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              className="border rounded-xl px-4 py-3 shadow-sm bg-white focus:ring-2 focus:ring-indigo-400"
            />

            <button
              className={`${
                isEditing ? "bg-yellow-500" : "bg-indigo-600"
              } text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:opacity-90 transition`}
              disabled={loading}
            >
              {isEditing ? "Update" : "Add"}
            </button>
          </form>
        </div>

        {/* Goals Grid */}
        <h2 className="text-2xl font-bold text-indigo-700 mb-5">
          📌 Your Goals
        </h2>

        {goals.length === 0 ? (
          <p className="text-center text-gray-600">No goals added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {goals.map((g) => {
              const progress = Math.min((g.savedAmount / g.targetAmount) * 100, 100);
              const remaining = g.targetAmount - g.savedAmount;

              return (
                <div
                  key={g.id}
                  className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-100 shadow-xl border border-purple-200 hover:shadow-2xl hover:scale-[1.02] transition-all"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-indigo-700">
                      {g.goalName}
                    </h3>
                    <span className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full shadow">
                      {g.deadline || "No Date"}
                    </span>
                  </div>

                  {/* Numbers */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span>Saved: ₹{g.savedAmount}</span>
                      <span>Target: ₹{g.targetAmount}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          progress >= 100
                            ? "bg-green-600"
                            : progress > 70
                            ? "bg-green-400"
                            : progress > 40
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <p className="text-sm mt-3 text-gray-700 font-semibold">
                      Remaining: ₹{remaining.toFixed(2)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 mt-5">
                    <button
                      onClick={() => handleEdit(g)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
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

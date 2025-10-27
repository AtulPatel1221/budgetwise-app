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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-10 text-white">
      <div className="max-w-6xl mx-auto bg-white text-gray-900 rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-indigo-700">
          🎯 Savings Goals Tracker
        </h1>

        {/* Add/Edit Form */}
        <div className="mb-10 bg-gray-50 rounded-2xl p-6 shadow-inner">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            <input
              name="goalName"
              placeholder="Goal Name"
              value={form.goalName}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              name="targetAmount"
              type="number"
              placeholder="Target (₹)"
              value={form.targetAmount}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              name="savedAmount"
              type="number"
              placeholder="Saved (₹)"
              value={form.savedAmount}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />
            <input
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
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

        {/* Goal Cards */}
        {goals.length === 0 ? (
          <p className="text-center text-gray-600">No goals added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((g) => {
              const progress = Math.min((g.savedAmount / g.targetAmount) * 100, 100);
              const remaining = g.targetAmount - g.savedAmount;

              return (
                <div
                  key={g.id}
                  className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-100 shadow-md hover:shadow-xl transition"
                >
                  <h3 className="text-xl font-bold text-indigo-700 mb-2">
                    {g.goalName}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Deadline: {g.deadline}
                  </p>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Saved: ₹{g.savedAmount}</span>
                      <span>Target: ₹{g.targetAmount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          progress > 90
                            ? "bg-green-600"
                            : progress > 60
                            ? "bg-green-400"
                            : "bg-yellow-400"
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

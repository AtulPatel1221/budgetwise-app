import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState({});
  const [form, setForm] = useState({
    id: null,
    type: "EXPENSE",
    category: "Food",
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch logged-in user
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

  // 🔄 Handle input
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ➕ Add or ✏ Update
  const addOrUpdate = async (e) => {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        await API.put(`/transactions/${form.id}`, form);
        alert("✅ Transaction updated successfully!");
      } else {
        await API.post("/transactions", form);
        alert("✅ Transaction added successfully!");
      }
      resetForm();
      fetchTransactions();
    } catch (err) {
      console.error(err);
      alert("⚠️ Error saving transaction");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete
  const deleteTx = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    try {
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  // ✏ Edit
  const editTx = (tx) => {
    setForm({ ...tx });
    setIsEditing(true);
  };

  // 🔁 Reset
  const resetForm = () => {
    setForm({
      id: null,
      type: "EXPENSE",
      category: "Food",
      amount: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
    });
    setIsEditing(false);
  };

  // 💰 Summary
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // 📂 Categories
  const categories = [
    "Food",
    "Rent",
    "Travel",
    "Bills",
    "Shopping",
    "Entertainment",
    "Salary",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        {/* 👤 Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b pb-5">
          <div>
            <h1 className="text-4xl font-extrabold text-indigo-700">
              Welcome, {user.username ? user.username : "User"} 👋
            </h1>
            <p className="text-gray-500 mt-2">
              Track and manage your daily income & expenses.
            </p>
          </div>
          <div className="mt-5 md:mt-0 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold">
            💼 Current Balance: ₹{balance.toFixed(2)}
          </div>
        </div>

        {/* 💰 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-green-50 text-green-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:scale-105">
            <h3 className="text-lg font-semibold">Total Income</h3>
            <p className="text-3xl font-bold mt-2">₹{totalIncome.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">All income sources</p>
          </div>
          <div className="bg-red-50 text-red-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:scale-105">
            <h3 className="text-lg font-semibold">Total Expense</h3>
            <p className="text-3xl font-bold mt-2">₹{totalExpense.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">All your expenses</p>
          </div>
          <div className="bg-indigo-50 text-indigo-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:scale-105">
            <h3 className="text-lg font-semibold">Remaining Balance</h3>
            <p className="text-3xl font-bold mt-2">₹{balance.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">After all spendings</p>
          </div>
        </div>

        {/* 🧾 Form */}
        <form
          onSubmit={addOrUpdate}
          className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-10 bg-gray-50 p-6 rounded-2xl shadow-inner"
        >
          <select
            name="type"
            value={form.type}
            onChange={change}
            className="border rounded-lg px-3 py-2"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>

          <select
            name="category"
            value={form.category}
            onChange={change}
            className="border rounded-lg px-3 py-2"
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            name="amount"
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={change}
            className="border rounded-lg px-3 py-2"
            required
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={change}
            className="border rounded-lg px-3 py-2"
          />
          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={change}
            className="border rounded-lg px-3 py-2"
          />

          <div className="flex gap-2">
            <button
              disabled={loading}
              className={`${
                isEditing ? "bg-yellow-500" : "bg-indigo-600"
              } text-white px-4 py-2 rounded-lg hover:opacity-90 transition font-semibold`}
            >
              {isEditing ? "Update" : "Add"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:opacity-90"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* 📋 Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg shadow-sm">
            <thead className="bg-indigo-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
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
                    <td className="p-3 text-gray-600">{t.description}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => editTx(t)}
                        className="text-blue-600 hover:text-blue-800 font-semibold mr-4"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => deleteTx(t.id)}
                        className="text-red-500 hover:text-red-700 font-semibold"
                      >
                        ❌ Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-gray-500 py-10 italic"
                  >
                    No transactions yet — start by adding your first one 💡
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

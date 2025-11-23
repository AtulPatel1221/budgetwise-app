import React, { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

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

  // Fetch user
  const fetchUser = async () => {
    try {
      const res = await API.get("/user/profile");
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchTransactions();
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Add / Update
  const addOrUpdate = async (e) => {
    e.preventDefault();

    if (!form.amount || form.amount <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await API.put(`/transactions/${form.id}`, form);
        alert("Transaction updated!");
      } else {
        await API.post("/transactions", form);
        alert("Transaction added!");
      }
      resetForm();
      fetchTransactions();
    } catch (err) {
      console.error(err);
      alert("Error saving transaction");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const deleteTx = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit
  const editTx = (tx) => {
    setForm({ ...tx });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  // Summary calculations
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-800 to-pink-600 py-12 px-6 text-white">
      <motion.div
        className="max-w-7xl mx-auto bg-white text-gray-900 rounded-3xl shadow-2xl p-10"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b pb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-indigo-700">
              Welcome, {user.username || "User"} 👋
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Manage your daily income & expenses easily.
            </p>
          </div>

          {/* Highlighted Balance Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="mt-6 md:mt-0 bg-gradient-to-br from-indigo-600 to-purple-600 
            text-white px-10 py-4 rounded-2xl shadow-xl text-xl font-semibold border border-white/30 backdrop-blur-xl"
          >
            💼 Balance: ₹{balance.toFixed(2)}
          </motion.div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-7 rounded-2xl shadow-xl bg-gradient-to-br from-green-300 to-green-100 text-green-800 border border-green-200"
          >
            <h2 className="text-xl font-semibold">Total Income</h2>
            <p className="text-5xl font-extrabold mt-3">₹{totalIncome.toFixed(2)}</p>
            <p className="mt-2 text-gray-700">All money earned</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-7 rounded-2xl shadow-xl bg-gradient-to-br from-red-300 to-red-100 text-red-800 border border-red-200"
          >
            <h2 className="text-xl font-semibold">Total Expense</h2>
            <p className="text-5xl font-extrabold mt-3">₹{totalExpense.toFixed(2)}</p>
            <p className="mt-2 text-gray-700">All money spent</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-7 rounded-2xl shadow-xl bg-gradient-to-br from-indigo-300 to-indigo-100 text-indigo-800 border border-indigo-200"
          >
            <h2 className="text-xl font-semibold">Net Balance</h2>
            <p className="text-5xl font-extrabold mt-3">₹{balance.toFixed(2)}</p>
            <p className="mt-2 text-gray-700">Remaining cash</p>
          </motion.div>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={addOrUpdate}
          className="grid grid-cols-1 md:grid-cols-6 gap-5 mb-14 bg-gray-50 p-8 rounded-2xl shadow-inner"
        >
          <select
            name="type"
            value={form.type}
            onChange={change}
            className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>

          <select
            name="category"
            value={form.category}
            onChange={change}
            className="border rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-400"
          >
            {categories.map((cat, i) => (
              <option key={i}>{cat}</option>
            ))}
          </select>

          <input
            name="amount"
            type="number"
            placeholder="Amount"
            className="border rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-400"
            value={form.amount}
            onChange={change}
            required
          />

          <input
            name="date"
            type="date"
            className="border rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-400"
            value={form.date}
            onChange={change}
          />

          <input
            name="description"
            placeholder="Description"
            className="border rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-400"
            value={form.description}
            onChange={change}
          />

          <div className="flex gap-2">
            <button
              className={`${
                isEditing ? "bg-yellow-500" : "bg-indigo-600"
              } text-white px-5 py-3 rounded-xl shadow font-semibold hover:opacity-90`}
            >
              {isEditing ? "Update" : "Add"}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-5 py-3 rounded-xl shadow hover:opacity-90"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.form>

        {/* Transactions Table */}
        <motion.div
          className="overflow-x-auto bg-white rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
            Transaction History
          </h2>

          <table className="min-w-full rounded-xl overflow-hidden text-gray-800">
            <thead className="bg-indigo-100">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{t.date}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          t.type === "INCOME"
                            ? "bg-green-200 text-green-900"
                            : "bg-red-200 text-red-900"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="p-4">{t.category}</td>
                    <td className="p-4 font-semibold">₹{t.amount}</td>
                    <td className="p-4">{t.description}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => editTx(t)}
                        className="text-blue-600 font-semibold hover:text-blue-800 mr-4"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => deleteTx(t.id)}
                        className="text-red-600 font-semibold hover:text-red-800"
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
                    No transactions found — add your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </div>
  );
}

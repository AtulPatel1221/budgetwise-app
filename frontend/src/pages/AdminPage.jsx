// src/pages/AdminPage.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { Search, UserCheck, UserX, Receipt } from "lucide-react";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (id) => {
    if (!window.confirm("Are you sure you want to BAN this user?")) return;
    await API.put(`/admin/ban/${id}`);
    loadUsers();
  };

  const unbanUser = async (id) => {
    await API.put(`/admin/unban/${id}`);
    loadUsers();
  };

  const viewTransactions = async (username) => {
    setSelectedUser(username);
    const res = await API.get(`/admin/transactions/${username}`);
    setTransactions(res.data || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users
    .filter((u) => (filterRole === "ALL" ? true : u.role === filterRole))
    .filter((u) =>
      q
        ? (u.username || "").toLowerCase().includes(q.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(q.toLowerCase())
        : true
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between flex-wrap items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Control Panel</h1>
            <p className="text-sm text-gray-500">Smart user and transaction management</p>
          </div>

          <div className="flex gap-3 mt-3 md:mt-0">
            <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow border">
              <Search size={16} className="text-gray-400" />
              <input
                placeholder="Search users..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="outline-none text-sm ml-2"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white text-sm shadow"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admins</option>
              <option value="USER">Users</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* USERS TABLE */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 bg-white rounded-xl shadow p-5">
            <h2 className="text-xl font-semibold mb-4">Users List</h2>

            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="text-center">Controls</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-slate-50 transition">
                    <td className="p-3 font-medium">{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.role === "ADMIN" ? "bg-green-100 text-green-800" :
                        u.role === "BANNED" ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="flex justify-center gap-2 p-3">
                      <button
                        onClick={() => viewTransactions(u.username)}
                        className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
                      >
                        <Receipt size={14}/> Transactions
                      </button>

                      {u.role !== "BANNED" ? (
                        <button
                          onClick={() => banUser(u.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                        >
                          <UserX size={14}/> Ban
                        </button>
                      ) : (
                        <button
                          onClick={() => unbanUser(u.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                        >
                          <UserCheck size={14}/> Unban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* TRANSACTION PANEL */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow p-5">
            <h3 className="text-lg font-bold mb-3">User Transactions</h3>

            {!selectedUser ? (
              <p className="text-gray-500 text-sm">Click "Transactions" button to view user activity.</p>
            ) : (
              <>
                <p className="text-sm font-semibold mb-3 text-indigo-600">{selectedUser}'s Transactions</p>

                <div className="space-y-3 max-h-[400px] overflow-auto">
                  {transactions.length === 0 && (
                    <div className="text-gray-500 text-sm text-center">No transactions found</div>
                  )}

                  {transactions.map(t => (
                    <div key={t.id} className="border p-3 rounded-lg bg-slate-50 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">₹ {t.amount}</span>
                        <span className="text-xs text-gray-500">{t.date?.substring(0,10)}</span>
                      </div>
                      <div className="text-sm text-gray-700">{t.title || t.description || "No Title"}</div>
                      <div className="text-xs text-gray-500">Category: {t.category}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
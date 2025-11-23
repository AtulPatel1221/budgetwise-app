import React from "react";
import API from "../services/api";
import { motion } from "framer-motion";

export default function Reports() {
  // File download handler
  const downloadFile = async (type) => {
    const endpoint = type === "pdf" ? "/reports/export-pdf" : "/reports/export-csv";
    const fileType = type === "pdf" ? "application/pdf" : "text/csv";
    const fileName = type === "pdf" ? "BudgetWise_Report.pdf" : "BudgetWise_Report.csv";

    try {
      const res = await API.get(endpoint, { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: fileType }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
      alert("⚠️ Something went wrong while exporting the report.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-800 to-pink-600 flex flex-col items-center justify-center py-16 px-6 text-white">
      
      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white/90 backdrop-blur-xl text-gray-800 rounded-3xl shadow-2xl p-10 max-w-2xl w-full"
      >
        {/* Heading */}
        <h1 className="text-4xl font-extrabold mb-4 text-indigo-700 text-center">
          📊 Financial Reports
        </h1>

        <p className="text-gray-600 mb-10 text-lg text-center">
          Export your complete BudgetWise data in <strong>PDF</strong> or <strong>CSV</strong> format 
          for offline use, accounting, or analysis.
        </p>

        {/* Preview Box */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl shadow-inner p-6 mb-10">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">
            📄 Report Includes:
          </h3>
          <ul className="text-gray-700 space-y-2 text-sm">
            <li>• All transactions (Income + Expenses)</li>
            <li>• Budget allocations and usage</li>
            <li>• Savings goals progress</li>
            <li>• Monthly spending summary</li>
            <li>• Category-wise breakdown</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">

          {/* PDF Button */}
          <motion.button
            onClick={() => downloadFile("pdf")}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="bg-indigo-600 text-white font-semibold px-10 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            📄 Download PDF
          </motion.button>

          {/* CSV Button */}
          <motion.button
            onClick={() => downloadFile("csv")}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="bg-green-600 text-white font-semibold px-10 py-3 rounded-full shadow-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            📊 Download CSV
          </motion.button>

        </div>

        {/* Footer note */}
        <p className="text-sm text-gray-500 mt-10 text-center">
          *Reports auto-generated from your latest BudgetWise data.*
        </p>
      </motion.div>

    </div>
  );
}

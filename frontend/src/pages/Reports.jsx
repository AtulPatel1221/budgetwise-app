import React from "react";
import API from "../services/api";
import { motion } from "framer-motion";

export default function Reports() {
  // ✅ Function to handle file download (PDF/CSV)
  const downloadFile = async (type) => {
    const endpoint = type === "pdf" ? "/reports/export-pdf" : "/reports/export-csv";
    const fileType = type === "pdf" ? "application/pdf" : "text/csv";
    const fileName = type === "pdf" ? "BudgetWise_Report.pdf" : "BudgetWise_Report.csv";

    try {
      const res = await API.get(endpoint, { responseType: "blob" });

      // Create a download link for the blob data
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center text-white p-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white text-gray-800 rounded-3xl shadow-2xl p-10 max-w-xl w-full text-center"
      >
        <h1 className="text-4xl font-extrabold mb-6 text-indigo-700">
          📊 Export Financial Reports
        </h1>
        <p className="text-gray-600 mb-10 text-lg">
          You can download your BudgetWise data as PDF or CSV format for record keeping or analysis.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {/* PDF Download Button */}
          <motion.button
            onClick={() => downloadFile("pdf")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:bg-indigo-700 transition"
          >
            📄 Download PDF
          </motion.button>

          {/* CSV Download Button */}
          <motion.button
            onClick={() => downloadFile("csv")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:bg-green-700 transition"
          >
            📊 Download CSV
          </motion.button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          *Reports are auto-generated from your transaction data.*
        </p>
      </motion.div>
    </div>
  );
}

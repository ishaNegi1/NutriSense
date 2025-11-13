import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import api from "../api/client";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
useEffect(() => {
  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/history");
      console.log("History response:", res.data);

      setHistory(res.data.items || []);   

    } catch (err) {
      console.error(err);
      setError("Unable to load history");
    } finally {
      setLoading(false);
    }
  };

  fetchHistory();
}, []);

  const filteredHistory = history.filter((item) => {
    const d = new Date(item.date);
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const y = d.getFullYear().toString();

    const monthMatch = month ? m === month : true;
    const yearMatch = year ? y === year : true;

    return monthMatch && yearMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-semibold text-green-700 text-center mb-6">
          Prediction History
        </h1>

        {loading && (
          <p className="text-center text-gray-500">Loading history...</p>
        )}

        {error && (
          <p className="text-center text-red-600 font-medium">{error}</p>
        )}

        {!loading && (
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">Select Month</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Select Year</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        )}

        {!loading && filteredHistory.length === 0 ? (
          <p className="text-center text-gray-500">No records found.</p>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{item.date}</span>
                  <span className="font-medium text-green-600">
                    {item.output.nutrition_status}
                  </span>
                </div>

                <p className="text-gray-700 text-sm mb-1">
                  <b>Age:</b> {item.input.age} months
                </p>
                <p className="text-gray-700 text-sm mb-1">
                  <b>Gender:</b> {item.input.gender}
                </p>
                <p className="text-gray-700 text-sm mb-1">
                  <b>Height:</b> {item.input.height} cm
                </p>
                <p className="text-gray-700 text-sm mb-2">
                  <b>Food:</b> {item.input.food_text}
                </p>

                <p className="text-gray-800">
                  <b>Recommendation:</b> {item.output.recommendation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

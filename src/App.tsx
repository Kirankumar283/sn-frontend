import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sumSchema, type SumFormData } from "./schemas/sum.schema";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface SumRecord {
  _id: string;
  num1: number;
  num2: number;
  sum: number;
  createdAt?: string;
}

function App() {
  const [result, setResult] = useState<SumRecord | null>(null);
  const [history, setHistory] = useState<SumRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const paginatedHistory = useMemo(
    () => history.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [history, currentPage]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SumFormData>({
    resolver: zodResolver(sumSchema),
    defaultValues: { number1: "", number2: "" },
  });

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await axios.get(`${API_URL}/sum`);
      setHistory(res.data.data);
    } catch {
      console.error("Failed to fetch history");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onSubmit = async (data: SumFormData) => {
    setApiError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/sum`, {
        num1: parseFloat(data.number1),
        num2: parseFloat(data.number2),
      });
      setResult(res.data.data);
      reset();
      setCurrentPage(1);
      fetchHistory();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          "Something went wrong";
        setApiError(message);
      } else {
        setApiError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center p-4 pt-12 gap-8">
      {/* Calculator Card */}
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          Sum Calculator
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter two numbers to calculate their sum
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          id="sum-form"
          noValidate
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <label
                htmlFor="number1"
                className="text-sm font-medium text-gray-700"
              >
                Enter Number 1
              </label>
              <input
                type="number"
                placeholder="0"
                {...register("number1")}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all focus:ring-1 focus:ring-black focus:border-black ${
                  errors.number1 ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.number1 && (
                <p className="text-red-500 text-xs">{errors.number1.message}</p>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label
                htmlFor="number2"
                className="text-sm font-medium text-gray-700"
              >
                Enter Number 2
              </label>
              <input
                type="number"
                placeholder="0"
                {...register("number2")}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all focus:ring-1 focus:ring-black focus:border-black ${
                  errors.number2 ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.number2 && (
                <p className="text-red-500 text-xs">{errors.number2.message}</p>
              )}
            </div>
          </div>

          {apiError && (
            <p className="text-red-500 text-sm" id="error-message">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-black text-white font-medium text-sm hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            id="submit-btn"
            disabled={loading}
          >
            {loading ? "Calculating..." : "Calculate"}
          </button>
        </form>

        {result && (
          <div
            className="mt-5 p-4 bg-indigo-50 rounded-lg text-center border border-indigo-100"
            id="result-display"
          >
            <p className="text-sm text-gray-700 font-medium mb-1">Result</p>
            <p className="text-2xl font-bold text-gray-700">
              {result.num1} + {result.num2} = {result.sum}
            </p>
          </div>
        )}
      </div>

      {/* History List */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">History</h2>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {history.length}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {historyLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">
              No calculations yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100" id="history-list">
              {paginatedHistory.map((record, index) => (
                <li
                  key={record._id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-6 text-right">
                      {history.length - ((currentPage - 1) * PAGE_SIZE + index)}
                    </span>
                    <span className="text-sm text-gray-700">
                      {record.num1} + {record.num2} ={" "}
                      <span className="font-semibold text-gray-700">
                        {record.sum}
                      </span>
                    </span>
                  </div>
                  {record.createdAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(record.createdAt).toDateString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination Controls */}
        {history.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              id="prev-page-btn"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              id="next-page-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

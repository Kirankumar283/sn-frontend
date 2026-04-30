import { useState } from "react";
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
}

function App() {
  const [result, setResult] = useState<SumRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SumFormData>({
    resolver: zodResolver(sumSchema),
    defaultValues: { number1: "", number2: "" },
  });

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
    <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center p-4">
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
            className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            id="submit-btn"
            disabled={loading}
          >
            {loading ? "Calculating..." : "Calculate"}
          </button>
        </form>

        {result && (
          <div
            className="mt-5 p-4 bg-gray-50 rounded-lg text-center"
            id="result-display"
          >
            <p className="text-2xl font-bold">Sum is: {result?.sum}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

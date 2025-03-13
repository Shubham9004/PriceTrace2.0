"use client";

import { useEffect, useState, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler);

type PriceHistoryItem = {
  price: number;
  date: string;
};

type Props = {
  productId: string;
};

const PriceHistoryChart = ({ productId }: Props) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [highestPrice, setHighestPrice] = useState<number | null>(null);
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);

  const calculateStartDate = (range: "1D" | "1M" | "1Y" | "ALL") => {
    const today = new Date();
    let start: Date | null = null;

    switch (range) {
      case "1D":
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        break;
      case "1M":
        start = new Date(today);
        start.setMonth(today.getMonth() - 1);
        break;
      case "1Y":
        start = new Date(today);
        start.setFullYear(today.getFullYear() - 1);
        break;
      case "ALL":
        start = null;
        break;
    }

    return start ? start.toISOString().slice(0, 10) : "";
  };

  const fetchPriceHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chart?slug=${productId}&startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      const data = await response.json();
      setPriceHistory(data.priceHistory || []);

      const prices = data.priceHistory.map((item: PriceHistoryItem) => item.price);
      setHighestPrice(prices.length > 0 ? Math.max(...prices) : null);
      setLowestPrice(prices.length > 0 ? Math.min(...prices) : null);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [productId, startDate, endDate]);

  useEffect(() => {
    fetchPriceHistory();
  }, [fetchPriceHistory]);

  const handleDateRangeChange = (range: "1D" | "1M" | "1Y" | "ALL") => {
    setStartDate(calculateStartDate(range));
    setEndDate(new Date().toISOString().slice(0, 10));
    fetchPriceHistory();
  };

  const chartData = {
    labels: priceHistory.map((item) => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        data: priceHistory.map((item) => item.price),
        borderColor: "rgba(40, 41, 41, 1)", 
        backgroundColor: "rgba(195, 204, 219, 0.5)", 
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `₹${(context.raw as number).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Date", font: { size: 16, weight: "bold" } },
        grid: { color: "rgba(0,0,0,0.1)" },
      },
      y: {
        title: { display: true, text: "Price (₹)", font: { size: 16, weight: "bold" } },
        grid: { color: "rgba(0,0,0,0.1)" },
      },
    },
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex gap-2 justify-center my-4">
        {["1D", "1M", "1Y", "ALL"].map((range) => (
          <button
            key={range}
            className="bg-black text-white py-2 px-4 rounded hover:opacity-80"
            onClick={() => handleDateRangeChange(range as "1D" | "1M" | "1Y" | "ALL")}
          >
            {range === "1D" ? "1 Day" : range === "1M" ? "1 Month" : range === "1Y" ? "1 Year" : "All"}
          </button>
        ))}
      </div>

      {error && <p className="text-center text-red-500">{error}</p>}

      {isLoading ? (
        <p className="text-center">Loading chart...</p>
      ) : priceHistory.length > 0 ? (
        <div style={{ width: "100%", height: "450px" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p className="text-center">No data available for the selected range.</p>
      )}

      {highestPrice !== null && lowestPrice !== null && (
        <div className="text-center mt-4">
          <p><strong>Highest Price:</strong> ₹{highestPrice.toFixed(2)}</p>
          <p><strong>Lowest Price:</strong> ₹{lowestPrice.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default PriceHistoryChart;

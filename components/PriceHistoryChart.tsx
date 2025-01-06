"use client";

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
import { useEffect, useState, useCallback } from "react";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler);

type PriceHistoryItem = {
  price: number;
  date: string;
};

type Product = {
  title: string;
  url: string;
};

type Props = {
  productId: string;
  product?: Product;
};

const PriceHistoryChart = ({ productId, product }: Props) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [highestPrice, setHighestPrice] = useState<number | null>(null);
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);

  const calculateStartDate = (range: "1D" | "1M" | "1Y" | "ALL") => {
    const today = new Date();
    let start;

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
      default:
        start = null;
        break;
    }

    return start ? start.toISOString().slice(0, 10) : "";
  };

  const fetchPriceHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Debugging: Check the start and end date before fetching
    console.log(`Fetching data from ${startDate} to ${endDate}`);

    try {
      const response = await fetch(`/api/chart?productId=${productId}&startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setPriceHistory(data.priceHistory || []);

      // Calculate the highest and lowest prices from the fetched data
      const prices = data.priceHistory.map((item: PriceHistoryItem) => item.price);
      if (prices.length > 0) {
        setHighestPrice(Math.max(...prices));
        setLowestPrice(Math.min(...prices));
      } else {
        setHighestPrice(null);
        setLowestPrice(null);
      }
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
    const calculatedStartDate = calculateStartDate(range);
    setStartDate(calculatedStartDate);
    setEndDate(new Date().toISOString().slice(0, 10));
    fetchPriceHistory();
  };

  const chartData = {
    labels: priceHistory.map((item) => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        data: priceHistory.map((item) => item.price),
        borderColor: "rgba(40, 41, 41, 255)", 
        backgroundColor: "rgba(195, 204, 219)",  
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
      legend: {
        display: false, 
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return `₹${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        grid: {
          display: true,
          color: "rgba(0,0,0,0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price (₹)",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        grid: {
          display: true,
          color: "rgba(0,0,0,0.1)",
        },
      },
    },
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="date-range-buttons flex gap-2 justify-center my-4">
        <button
          className="bg-black text-white py-2 px-4 rounded hover:opacity-80"
          onClick={() => handleDateRangeChange("1D")}
        >
          1 Day
        </button>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:opacity-80"
          onClick={() => handleDateRangeChange("1M")}
        >
          1 Month
        </button>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:opacity-80"
          onClick={() => handleDateRangeChange("1Y")}
        >
          1 Year
        </button>
        <button
          className="bg-black text-white py-2 px-4 rounded hover:opacity-80"
          onClick={() => handleDateRangeChange("ALL")}
        >
          All
        </button>
      </div>

      {error && <p className="error-message text-center text-red-500">{error}</p>}

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
        <div className="price-info text-center mt-4">
          <p><strong>Highest Price:</strong> ₹{highestPrice.toFixed(2)}</p>
          <p><strong>Lowest Price:</strong> ₹{lowestPrice.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default PriceHistoryChart;

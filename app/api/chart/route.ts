import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose"; // Database connection
import Product from "@/lib/models/product.model"; // MongoDB Model for Product

// Interface for the price history item
interface PriceHistoryItem {
  price: number;
  date: Date; // Use Date for proper type
}

// Interface for the response
interface PriceHistoryResponse {
  priceHistory: {
    price: number;
    date: string; // ISO string format for the date
  }[];
}

// Explicitly mark this API route as dynamic
export const dynamic = "force-dynamic";

// API handler for GET request
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Connect to the database
    await connectToDB();

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product || !product.priceHistory) {
      return NextResponse.json({ error: "Product not found or no price history available" }, { status: 404 });
    }

    let priceHistory = product.priceHistory;

    // If date range is provided, filter the price history based on start and end dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Normalize time to avoid issues with different hours/minutes/seconds
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      priceHistory = priceHistory.filter((entry: PriceHistoryItem) => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });
    }

    // Format the priceHistory array
    const formattedPriceHistory: PriceHistoryResponse["priceHistory"] = priceHistory.map((entry: PriceHistoryItem) => ({
      price: entry.price,
      date: entry.date.toISOString(), // Convert date to string
    }));

    // Return the price history data
    return NextResponse.json({ priceHistory: formattedPriceHistory });
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
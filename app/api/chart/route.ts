import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";

interface PriceHistoryItem {
  price: number;
  date: Date;
}

interface PriceHistoryResponse {
  priceHistory: { price: number; date: string }[];
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!slug) {
      return NextResponse.json({ error: "Product slug is required" }, { status: 400 });
    }

    await connectToDB();
    const product = await Product.findOne({ slug });

    if (!product || !product.priceHistory) {
      return NextResponse.json({ error: "Product not found or no price history available" }, { status: 404 });
    }

    let priceHistory: PriceHistoryItem[] = product.priceHistory;

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      priceHistory = priceHistory.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });
    }

    // Remove highest price only if price history has ≤ 5 entries and the highest price appears only once
    if (priceHistory.length <= 5) {
      const highestPrice = Math.max(...priceHistory.map((entry) => entry.price));
      const highestPriceCount = priceHistory.filter((entry) => entry.price === highestPrice).length;

      if (highestPriceCount === 1) {
        priceHistory = priceHistory.filter((entry) => entry.price !== highestPrice);
      }
    }

    // Format the response
    const formattedPriceHistory: PriceHistoryResponse["priceHistory"] = priceHistory.map((entry) => ({
      price: entry.price,
      date: entry.date.toISOString(),
    }));

    return NextResponse.json({ priceHistory: formattedPriceHistory });
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

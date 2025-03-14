import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";

export const dynamic = "force-dynamic"; // Ensure fresh data on each request

export async function GET() {
  try {
    await connectToDB();
    
    // Fetch only necessary fields
    const products = await Product.find({}, "slug updatedAt");

    // Transform data for sitemap
    const productUrls = products.map((product) => ({
      slug: product.slug,
      lastModified: product.updatedAt.toISOString(),
    }));

    return NextResponse.json(productUrls);
  } catch (error: any) {
    return NextResponse.json({ message: `Failed: ${error.message}`, status: "error" });
  }
}

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";

const API_KEY = process.env.PRICE_TRACE_API_KEY || "";

// ✅ Handle CORS for Preflight Requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://www.pricetrace.tech",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}

export async function POST(request: Request) {
  try {
    // ✅ Verify API key
    const headers = request.headers;
    const apiKey = headers.get("x-api-key");
    if (!apiKey || apiKey !== API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // ✅ Restrict requests to your domain
    const origin = headers.get("origin");
    if (origin !== "https://www.pricetrace.tech") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const { productUrl, email, targetPrice } = await request.json();
    if (!productUrl || !email || !targetPrice) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("🔹 Scraping product URL:", productUrl);
    await connectToDB();

    // ✅ Scrape product data
    const scrapedProduct = await scrapeAmazonProduct(productUrl);
    if (!scrapedProduct) {
      console.error("❌ Scraping failed for URL:", productUrl);
      return NextResponse.json(
        { success: false, error: "Failed to scrape product details" },
        { status: 500 }
      );
    }

    console.log("✅ Scraped Product Data:", scrapedProduct);

    let product = await Product.findOne({ url: productUrl });

    if (!product) {
      product = new Product({
        url: scrapedProduct.url,
        slug: scrapedProduct.slug,
        currency: scrapedProduct.currency,
        image: scrapedProduct.image,
        title: scrapedProduct.title,
        currentPrice: scrapedProduct.currentPrice,
        originalPrice: scrapedProduct.originalPrice,
        priceHistory: [{ price: scrapedProduct.currentPrice, date: new Date() }],
        lowestPrice: scrapedProduct.lowestPrice,
        highestPrice: scrapedProduct.highestPrice,
        averagePrice: scrapedProduct.averagePrice,
        discountRate: scrapedProduct.discountRate,
        category: scrapedProduct.category,
        reviewsCount: scrapedProduct.reviewsCount,
        stars: scrapedProduct.stars,
        isOutOfStock: scrapedProduct.isOutOfStock,
        description: scrapedProduct.description,
        users: [],
      });
    }

    // ✅ Update or add the user's target price
    const userIndex = product.users.findIndex((user: any) => user.email === email);
    if (userIndex !== -1) {
      product.users[userIndex].targetPrice = targetPrice;
    } else {
      product.users.push({ email, targetPrice });
    }

    await product.save();

    // ✅ Send Email
    try {
      await sendEmail(
        {
          subject: "Price Alert Set",
          body: `You have set a price alert for ${product.title}. We will notify you when the price drops to $${targetPrice}.`,
        },
        [email]
      );
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError);
    }

    return NextResponse.json(
      { success: true, message: "Price alert set successfully!" },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "https://www.pricetrace.tech" },
      }
    );
  } catch (error) {
    console.error("❌ Error setting price alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to set price alert" },
      { status: 500 }
    );
  }
}

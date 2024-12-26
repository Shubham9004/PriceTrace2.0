"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { ScrapedProduct, PriceHistoryItem } from "./productInterfaces"; // Import the shared interfaces

dotenv.config();

// Function to sanitize a string and remove invalid UTF-8 characters
function sanitizeText(text: string): string {
  return text.replace(/[^\x00-\x7F]/g, "").trim();
}

export async function scrapeFlipkartProduct(url: string): Promise<ScrapedProduct | null> {
  if (!url) return null;

  const apiUrl = `https://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;

  try {
    const response = await axios.get(apiUrl);
    const responseBody = response.data;

    const $ = cheerio.load(responseBody);

    // Extract and sanitize product details
    const title = sanitizeText($("span.VU-ZEz").text());
    const currentPriceText = sanitizeText($("div.Nx9bqj.CxhGGd").text());
    const originalPriceText = sanitizeText($("div.yRaY8j").first().text().replace(/₹|,/g, ""));
    const discountRateText = sanitizeText($("div.UkUFwK.WW8yVX span").text());
    const description = sanitizeText($("div.cPHDOP.col-12-12 div._4gvKMe p").text());
    
    const outOfStock = $("div._16FRp0").text().toLowerCase().includes("out of stock");

  // Extract high-quality image from `srcset` or fallback to `src`
    const imageElement = $("img.DByuf4.IZexXJ.jLEJ7H");
    let image = imageElement.attr("src") || "";

    const srcset = imageElement.attr("srcset");
      if (srcset) {
      const srcsetParts = srcset.split(",");
    const highResImage = srcsetParts.find((part) => part.includes("2x")); // Find the 2x resolution
      if (highResImage) {
      image = highResImage.split(" ")[0].trim(); // Extract the URL portion
      }
      }

    // Extract numeric values
    const currency = "₹";
    const currentPrice = parseFloat(currentPriceText.replace(/[^\d.]/g, "")) || 0;
    const originalPrice = parseFloat(originalPriceText.replace(/[^\d.]/g, "")) || 0;

    // Validate original price
    const validatedOriginalPrice = originalPrice >= currentPrice ? originalPrice : 0;

    // Calculate price history
    const priceHistory: PriceHistoryItem[] = [
      { price: currentPrice, date: new Date().toISOString() },
      ...(validatedOriginalPrice ? [{ price: validatedOriginalPrice, date: new Date().toISOString() }] : []),
    ];

    // Determine price statistics
    const lowestPrice = Math.min(...priceHistory.map((item) => item.price));
    const highestPrice = Math.max(...priceHistory.map((item) => item.price));
    const averagePrice = (lowestPrice + highestPrice) / 2 || 0;

    const category = "category"; // Placeholder, as category extraction isn't specified

    // Construct final product data
    const productData: ScrapedProduct = {
      url,
      currency,
      image,
      title,
      currentPrice: currentPrice || validatedOriginalPrice,
      originalPrice: validatedOriginalPrice || currentPrice,
      priceHistory,
      discountRate: discountRateText ? parseInt(discountRateText.replace(/[^\d]/g, ""), 10) : 0,
      category,
      reviewsCount: 0, // Reviews count not extracted
      stars: 0, // Rating stars not extracted
      isOutOfStock: outOfStock,
      description,
      lowestPrice,
      highestPrice,
      averagePrice,
    };

    console.log("Scraped Data:", productData);

    return productData;
  } catch (error) {
    console.error("Error occurred while scraping Flipkart:", error);
    return null;
  }
}
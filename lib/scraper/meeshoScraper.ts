"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { ScrapedProduct, PriceHistoryItem } from "./productInterfaces"; // Import shared interfaces

dotenv.config();

// Utility function to sanitize strings
function sanitizeString(input: string): string {
  try {
    return input
      .replace(/[^\x00-\x7F\u00A0-\uFFFF]/g, "") // Remove invalid characters
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .trim(); // Trim leading/trailing spaces
  } catch (error) {
    console.error("Failed to sanitize string:", input, error);
    return "";
  }
}

export async function scrapeMeeshoProduct(url: string): Promise<ScrapedProduct | null> {
  if (!url) return null;

  const apiUrl = `https://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const $ = cheerio.load(response.data);

    // Extract product details
    const title = $("span.sc-eDvSVe.fhfLdV").text().trim();
    const currentPriceText = $("h4.sc-eDvSVe.biMVPh").text().trim();
    const originalPriceText = $("p.ShippingInfo__ParagraphBody2StrikeThroughStyled-sc-frp12n-3")
      .text()
      .replace(/[^0-9₹,]/g, "")
      .trim();

    const rawDescription = $("div.ProductDescription__DetailsCardStyled-sc-1l1jg0i-0")
      .text()
      .replace(/[\n\r]+/g, " ") // Replace newlines and return characters with space
      .trim();
    const description = sanitizeString(rawDescription);

    const outOfStock = $("div.out-of-stock").text().toLowerCase().includes("out of stock");

    const image =
      $("div.ProductDesktopImage__ImageWrapperDesktop-sc-8sgxcr-0.iEMJCd img").attr("src") || "";

    const currency = "₹"; // Meesho operates in INR

    const currentPrice = parseFloat(currentPriceText.replace(/[^\d.-]/g, "")) || 0;
    const originalPrice = parseFloat(originalPriceText.replace(/[^\d.-]/g, "")) || 0;

    const discountRate = originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

      // Calculate price history with only the current price
      const priceHistory: PriceHistoryItem[] = [
      { price: currentPrice, date: new Date().toISOString() }
      ];
      console.log("Constructed Price History:", priceHistory); // Log price history


    const lowestPrice = Math.min(...priceHistory.map((item) => item.price));
    const highestPrice = Math.max(...priceHistory.map((item) => item.price));
    const averagePrice =
      priceHistory.reduce((sum, item) => sum + item.price, 0) / priceHistory.length || 0;

 // Extract star rating and reviews count
 const starRatingText = $("span.sc-eDvSVe.laVOtN").text().trim(); // Star rating text (e.g., "4.0")
 const reviewsCountText = $("span.ShippingInfo__OverlineStyled-sc-frp12n-4").text().trim(); // Reviews count

 const stars = parseFloat(starRatingText) || 0;
 const reviewsCount = parseInt(reviewsCountText.split(' ')[0], 10) || 0;

    // Construct final product data
    const productData: ScrapedProduct = {
      url,
      currency,
      image,
      title,
      currentPrice,
      originalPrice,
      priceHistory,
      discountRate,
      category: "category", // Placeholder
      reviewsCount,
      stars,
      isOutOfStock: outOfStock,
      description,
      lowestPrice,
      highestPrice,
      averagePrice,
    };

    console.log("Scraped Data:", productData);

    return productData;
  } catch (error) {
    console.error("Error occurred while scraping Meesho:", error);
    return null;
  }
}

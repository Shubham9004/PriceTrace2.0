"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { ScrapedProduct, PriceHistoryItem } from "./productInterfaces"; // Import the shared interfaces

dotenv.config();

/**
 * Sanitize a string by removing invalid UTF-8 characters and trimming whitespace.
 * @param text - The string to sanitize.
 * @returns The sanitized string.
 */
function sanitizeText(text: string): string {
  return text.replace(/[^\x00-\x7F]/g, "").trim();
}

/**
 * Scrape product details from Flipkart using the given URL.
 * @param url - The Flipkart product URL.
 * @returns A promise resolving to the scraped product data or null.
 */
export async function scrapeFlipkartProduct(url: string): Promise<ScrapedProduct | null> {
  if (!url) return null;

  const apiUrl = `https://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;

  try {
    const response = await axios.get(apiUrl);
    const responseBody = response.data;

    const $ = cheerio.load(responseBody);

    // Extract breadcrumb data for category
    const breadcrumb: string[] = []; // Initialize breadcrumb array
    const breadcrumbLinks = $(".r2CdBx a.R0cyWM");

    breadcrumbLinks.each((index, element) => {
      breadcrumb.push(sanitizeText($(element).text())); // Add sanitized breadcrumb text
    });

    // Log the breadcrumb
    console.log("Extracted Breadcrumb:", breadcrumb.join(" > "));

    // Use the second breadcrumb item as the category, fallback to "Unknown Category" if unavailable
    const category = breadcrumb[1] || "Unknown Category";

    // Extract and sanitize product details
    const title = sanitizeText($("span.VU-ZEz").text());
    const currentPriceText = sanitizeText($("div.Nx9bqj.CxhGGd").text());
    const originalPriceText = sanitizeText($("div.yRaY8j").first().text().replace(/₹|,/g, ""));
    const discountRateText = sanitizeText($("div.UkUFwK.WW8yVX span").text());
    const description = sanitizeText($("div.cPHDOP.col-12-12 div._4gvKMe p").text());
    const outOfStock = $("div._16FRp0").text().toLowerCase().includes("out of stock");

    // Extract stars (rating)
    const starsText = sanitizeText($("div.XQDdHH").first().text());
    const stars = parseFloat(starsText) || 0;

    // Extract reviews count
    const reviewsText = sanitizeText($("span.Wphh3N span").last().text());
    const reviewsCountMatch = reviewsText.match(/(\d{1,3}(?:,\d{3})*)/); // Match numbers with commas
    const reviewsCount = reviewsCountMatch ? parseInt(reviewsCountMatch[1].replace(/,/g, ""), 10) : 0;

    // Log extracted values for debugging
    console.log("Stars:", stars);
    console.log("Reviews Count:", reviewsCount);

    // Extract image URL
    let imageElement = $("img._53J4C-.utBuJY");
    let image = "";

    if (imageElement.length > 0) {
      // Use the `src` attribute
      image = imageElement.attr("src") || "";

      // Check for higher resolution image in `srcset`
      const srcset = imageElement.attr("srcset");
      if (srcset) {
        const srcsetParts = srcset.split(",");
        const highResImage = srcsetParts.find((part) => part.includes("2x"));
        if (highResImage) {
          image = highResImage.split(" ")[0].trim();
        }
      }
    } else {
      // Fallback to an alternative selector if no image is found
      imageElement = $("img.DByuf4.IZexXJ.jLEJ7H");
      if (imageElement.length > 0) {
        image = imageElement.attr("src") || "";

        const srcset = imageElement.attr("srcset");
        if (srcset) {
          const srcsetParts = srcset.split(",");
          const highResImage = srcsetParts.find((part) => part.includes("2x"));
          if (highResImage) {
            image = highResImage.split(" ")[0].trim();
          }
        }
      }
    }

    // Log the image URL
    if (image) {
      console.log("Image URL:", image);
    } else {
      console.log("No image found");
    }

    // Parse and validate numeric values
    const currency = "₹";
    const currentPrice = parseFloat(currentPriceText.replace(/[^\d.]/g, "")) || 0;
    const originalPrice = parseFloat(originalPriceText.replace(/[^\d.]/g, "")) || 0;
    const validatedOriginalPrice = originalPrice >= currentPrice ? originalPrice : 0;

     // Calculate price history
     const priceHistory: PriceHistoryItem[] = [
      { price: currentPrice, date: new Date().toISOString() },
      ...(validatedOriginalPrice ? [{ price: validatedOriginalPrice, date: new Date().toISOString() }] : []),
    ];

      
    // Calculate price statistics
    const lowestPrice = Math.min(...priceHistory.map((item) => item.price));
    const highestPrice = Math.max(...priceHistory.map((item) => item.price));
    const averagePrice = (lowestPrice + highestPrice) / 2 || 0;

    // Construct the final product data object
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
      reviewsCount,
      stars,
      isOutOfStock: outOfStock,
      description,
      lowestPrice,
      highestPrice,
      averagePrice,
    };

    // Log the final scraped data for debugging
    console.log("Scraped Data:", productData);

    return productData;
  } catch (error) {
    console.error("Error occurred while scraping Flipkart:", error);
    return null;
  }
}
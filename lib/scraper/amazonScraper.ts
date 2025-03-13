"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { ScrapedProduct, PriceHistoryItem } from "./productInterfaces"; // Import shared interfaces
import slugify from "slugify"; // Import slugify for generating slugs

dotenv.config();

// Function to map Amazon country domains to currency symbols
function getCurrencyFromDomain(url: string): string {
  if (url.includes("amazon.in")) return "₹";
  if (url.includes("amazon.co.uk")) return "£";
  if (url.includes("amazon.de")) return "€";
  if (url.includes("amazon.fr")) return "€";
  if (url.includes("amazon.com")) return "$";
  if (url.includes("amazon.ca")) return "$";
  if (url.includes("amazon.au")) return "A$";
  return "$";
}

// Function to sanitize a string and remove invalid UTF-8 characters
function sanitizeText(text: string): string {
  return text.replace(/[^\x00-\x7F]/g, "").trim();
}

export async function scrapeAmazonProduct(url: string): Promise<ScrapedProduct | null> {
  if (!url) {
    console.log("URL is not provided. Exiting scrape function.");
    return null;
  }

  const apiUrl = `https://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;
  console.log("Scraper API URL:", apiUrl);

  try {
    // Fetch the webpage via ScraperAPI
    const response = await axios.get(apiUrl);
    const responseBody = response.data;
    const $ = cheerio.load(responseBody);

    // Extract and sanitize product details
    const title = sanitizeText($("#productTitle").text());
    const slug = slugify(title, { lower: true, strict: true }); // Generate slug from title

    const currentPriceText = sanitizeText($(".priceToPay span.a-price-whole").text());
    const originalPriceText = sanitizeText(
      $("#priceblock_ourprice, .a-price.a-text-price span.a-offscreen:not([aria-hidden='true']), #listPrice, #priceblock_dealprice, .a-size-base.a-color-price")
        .filter(function () {
          return $(this).css("display") !== "none" && $(this).css("visibility") !== "hidden";
        })
        .first()
        .text()
        .replace(/[$,₹]/g, "")
    );

    const discountRateText = sanitizeText($(".savingsPercentage").text().replace(/[-%]/g, ""));
    const description = sanitizeText($("#productDescription").text() || $("#feature-bullets").text());

    const outOfStock = sanitizeText($("#availability span").text()).toLowerCase().includes("currently unavailable");

    // Extract high-quality image URLs
    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";
    const imageUrls = Object.keys(JSON.parse(images));
    const image = imageUrls.length > 0 ? imageUrls[0] : "";

    // Extract currency symbol based on URL
    const currency = getCurrencyFromDomain(url);
    const currentPrice = parseFloat(currentPriceText.replace(/[^\d.]/g, "")) || 0;
    const originalPrice = parseFloat(originalPriceText.replace(/[^\d.]/g, "")) || 0;

    // Validate original price
    const validatedOriginalPrice = originalPrice >= currentPrice ? originalPrice : 0;

    // Construct price history
    const priceHistory: PriceHistoryItem[] = [
      { price: currentPrice, date: new Date().toISOString() },
      ...(validatedOriginalPrice ? [{ price: validatedOriginalPrice, date: new Date().toISOString() }] : []),
    ];

    // Determine price statistics
    const lowestPrice = Math.min(...priceHistory.map((item) => item.price));
    const highestPrice = Math.max(...priceHistory.map((item) => item.price));
    const averagePrice = (lowestPrice + highestPrice) / 2 || 0;

    // Scrape the category
    let category = $("ul.a-unordered-list.a-horizontal.a-size-small a.a-link-normal.a-color-tertiary").first().text().trim();
    if (!category) {
      category = "Unknown Category";
    }

    const reviewsText = sanitizeText($("#acrCustomerReviewText").text());
    const reviewsCount = parseInt(reviewsText.replace(/,/g, ""), 10) || 0;

    // Extract ratings
    const starsText = sanitizeText($("span.a-icon-alt").text());
    const stars = parseFloat(starsText.split(" ")[0]) || 0;

    // Construct final product data
    const productData: ScrapedProduct = {
      url,
      slug, // Include slug
      currency,
      image,
      title,
      currentPrice: currentPrice || validatedOriginalPrice,
      originalPrice: validatedOriginalPrice || currentPrice,
      priceHistory,
      discountRate: discountRateText ? parseInt(discountRateText, 10) : 0,
      category,
      reviewsCount,
      stars,
      isOutOfStock: outOfStock,
      description,
      lowestPrice,
      highestPrice,
      averagePrice,
    };

    console.log("Final Scraped Product Data:", productData);
    return productData;
  } catch (error) {
    console.error("Error occurred while scraping Amazon:", error);
    return null;
  }
}

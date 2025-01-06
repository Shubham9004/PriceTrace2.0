"use server";


import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { ScrapedProduct, PriceHistoryItem } from "./productInterfaces"; // Import shared interfaces


dotenv.config();


// Function to map Amazon country domains to currency symbols
function getCurrencyFromDomain(url: string): string {
  if (url.includes("amazon.in")) return "₹"; // Amazon India
  if (url.includes("amazon.co.uk")) return "£"; // Amazon UK
  if (url.includes("amazon.de")) return "€"; // Amazon Germany
  if (url.includes("amazon.fr")) return "€"; // Amazon France
  if (url.includes("amazon.com")) return "$"; // Amazon US (default)
  if (url.includes("amazon.ca")) return "$"; // Amazon Canada
  if (url.includes("amazon.au")) return "A$"; // Amazon Australia
  return "$"; // Default to dollar if the country is not listed
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
  console.log("Scraper API URL:", apiUrl); // Debugging API URL


  try {
    // Fetch the webpage via ScraperAPI
    const response = await axios.get(apiUrl);
    console.log("HTTP Response Status:", response.status); // Check HTTP response status
    console.log("Response Body Length:", response.data.length); // Check response content length


    const responseBody = response.data;
    const $ = cheerio.load(responseBody);


    // Extract and sanitize product details
    const title = sanitizeText($("#productTitle").text());
    console.log("Extracted Title:", title); // Log the title


    const currentPriceText = sanitizeText($(".priceToPay span.a-price-whole").text());
    console.log("Extracted Current Price Text:", currentPriceText); // Log current price text


    const originalPriceText = sanitizeText(
      $(
        "#priceblock_ourprice, .a-price.a-text-price span.a-offscreen:not([aria-hidden='true']), #listPrice, #priceblock_dealprice, .a-size-base.a-color-price"
      )
        .filter(function () {
          return $(this).css("display") !== "none" && $(this).css("visibility") !== "hidden";
        })
        .first()
        .text()
        .replace(/[$,₹]/g, "") // Also handles ₹ if scraping Indian prices
    );
    
    console.log("Extracted Original Price Text:", originalPriceText); // Log original price text


    const discountRateText = sanitizeText($(".savingsPercentage").text().replace(/[-%]/g, ""));
    console.log("Extracted Discount Rate Text:", discountRateText); // Log discount rate text


    const description = sanitizeText($("#productDescription").text() || $("#feature-bullets").text());
    console.log("Extracted Description:", description);    


    const outOfStock = sanitizeText($("#availability span").text()).toLowerCase().includes("currently unavailable");
    console.log("Is Product Out of Stock?:", outOfStock); // Log stock status


    // Extract high-quality image URLs
    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";
    const imageUrls = Object.keys(JSON.parse(images));
    const image = imageUrls.length > 0 ? imageUrls[0] : "";
    console.log("Extracted Image URL:", image); // Log image URL


    // Extract currency symbol based on URL (updated logic)
    const currency = getCurrencyFromDomain(url);
    console.log("Determined Currency:", currency); // Log currency based on URL

    const currentPrice = parseFloat(currentPriceText.replace(/[^\d.]/g, "")) || 0;
    console.log("Parsed Current Price:", currentPrice); // Log parsed current price


    const originalPrice = parseFloat(originalPriceText.replace(/[^\d.]/g, "")) || 0;
    console.log("Parsed Original Price:", originalPrice); // Log parsed original price


    // Validate original price
    const validatedOriginalPrice = originalPrice >= currentPrice ? originalPrice : 0;
    console.log("Validated Original Price:", validatedOriginalPrice); // Log validated original price


    // Calculate price history with only current price
    const priceHistory: PriceHistoryItem[] = [
    { price: currentPrice, date: new Date().toISOString() },
    ];
    console.log("Constructed Price History:", priceHistory); // Log price history

    // Determine price statistics
    const lowestPrice = Math.min(...priceHistory.map((item) => item.price));
    const highestPrice = Math.max(...priceHistory.map((item) => item.price));
    const averagePrice = (lowestPrice + highestPrice) / 2 || 0;


    console.log("Lowest Price:", lowestPrice); // Log lowest price
    console.log("Highest Price:", highestPrice); // Log highest price
    console.log("Average Price:", averagePrice); // Log average price


   // Scrape the category
   let category = $("ul.a-unordered-list.a-horizontal.a-size-small a.a-link-normal.a-color-tertiary").first().text().trim();
   console.log("Extracted Category:", category);

   // Fallback if category is not extracted
   if (!category) {
     category = "Unknown Category"; // Fallback to default category if not found
     console.log("Category not found, using fallback:", category);
   }
   
    const reviewsText = sanitizeText($("#acrCustomerReviewText").text());
    console.log("Raw Reviews Text:", reviewsText);
    const reviewsCount = parseInt(reviewsText.replace(/,/g, ""), 10) || 0;
    console.log("Parsed Reviews Count:", reviewsCount);


    // Extract ratings
    const starsText = sanitizeText($("span.a-icon-alt").text());
    const stars = parseFloat(starsText.split(" ")[0]) || 0;


    // Construct final product data
    const productData: ScrapedProduct = {
      url,
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


    console.log("Final Scraped Product Data:", productData); // Log the final product data
    return productData;
  } catch (error) {
    console.error("Error occurred while scraping Amazon:", error);
    return null;
  }
}
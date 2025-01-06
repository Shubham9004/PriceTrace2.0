"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct, scrapeFlipkartProduct, scrapeMeeshoProduct } from "../scraper"; // Import Meesho scraper
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

// Modified function to handle Amazon, Flipkart, and Meesho
export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    connectToDB();

    // Detect platform based on the URL
    const platform = getPlatformFromUrl(productUrl);

    if (!platform) {
      throw new Error("Unsupported platform");
    }

    // Scrape product based on the platform (Amazon, Flipkart, or Meesho)
    let scrapedProduct;
    if (platform === "amazon") {
      scrapedProduct = await scrapeAmazonProduct(productUrl);
    } else if (platform === "flipkart") {
      scrapedProduct = await scrapeFlipkartProduct(productUrl);
    } else if (platform === "meesho") {
      scrapedProduct = await scrapeMeeshoProduct(productUrl);
    }

    if (!scrapedProduct) return;

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: calculateLowestPrice(updatedPriceHistory),
        highestPrice: calculateHighestPrice(updatedPriceHistory),
        averagePrice: calculateAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}

// Function to calculate the lowest price from price history
function calculateLowestPrice(priceHistory: any[]): number {
  const prices = priceHistory.map(item => item.price);
  return Math.min(...prices);
}

// Function to calculate the highest price from price history
function calculateHighestPrice(priceHistory: any[]): number {
  const prices = priceHistory.map(item => item.price);
  return Math.max(...prices);
}

// Function to calculate the average price from price history
function calculateAveragePrice(priceHistory: any[]): number {
  const prices = priceHistory.map(item => item.price);
  const total = prices.reduce((acc, curr) => acc + curr, 0);
  return prices.length ? total / prices.length : 0;
}

// Function to determine the platform based on the URL
function getPlatformFromUrl(url: string): string | null {
  if (url.includes("amazon.com") || url.includes("amazon.in")) {
    return "amazon";
  } else if (url.includes("flipkart.com")) {
    return "flipkart";
  } else if (url.includes("meesho.com")) {
    return "meesho";
  }
  return null;
}

// Other functions remain unchanged
export async function getProductById(productId: string) {
  try {
    connectToDB();

    const product = await Product.findOne({ _id: productId });

    if (!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    connectToDB();

    const products = await Product.find();

    return products;
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectToDB();

    // Find the current product by its ID
    const currentProduct = await Product.findById(productId);
    
    if (!currentProduct) return null;

    // Extract the category of the current product
    const productCategory = currentProduct.category;

    // Find products in the same category across all platforms
    let similarProducts = await Product.find({
      category: productCategory,  // Filter by the same category
      _id: { $ne: productId },    // Exclude the current product
    }).limit(6); // Limit to 3 similar products

    // If no similar products in the same category, fallback to other products
    if (similarProducts.length === 0) {
      similarProducts = await Product.find({
        _id: { $ne: productId }, // Exclude the current product
      }).limit(6); // Limit to 3 random products
    }

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProductWithAlert(
  productId: string,
  userEmail: string,
  targetPrice: number
) {
  try {
    connectToDB();

    // Find the product by its ID
    const product = await Product.findById(productId);

    if (!product) throw new Error("Product not found");

    // Check if the user already exists
    const userExists = product.users.some((user: User) => user.email === userEmail);

    if (!userExists) {
      // Add user with targetPrice
      product.users.push({ email: userEmail, targetPrice });

      // Save the updated product
      await product.save();

      // Send a welcome email
      const emailContent = await generateEmailBody(product, "WELCOME");
      await sendEmail(emailContent, [userEmail]);
    } else {
      // If the user exists, update their targetPrice
      const userIndex = product.users.findIndex(
        (user: User) => user.email === userEmail
      );
      product.users[userIndex].targetPrice = targetPrice;

      // Save the updated product
      await product.save();
    }
  } catch (error) {
    console.error("Error adding/updating user with alert:", error);
    throw new Error("Failed to add/update user with alert");
  }
}
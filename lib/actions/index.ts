"use server";

import { revalidatePath } from "next/cache";
import ProductModel from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct, scrapeFlipkartProduct, scrapeMeeshoProduct } from "../scraper";
import { generateEmailBody, sendEmail } from "../nodemailer";
import slugify from "slugify";
import { Product, User } from "@/types";

// ✅ Scrape and store product in database
export async function scrapeAndStoreProduct(productUrl: string): Promise<void> {
  if (!productUrl) return;

  try {
    await connectToDB();
    const platform = getPlatformFromUrl(productUrl);
    if (!platform) return;

    const scrapedProduct = await scrapeProduct(platform, productUrl);
    if (!scrapedProduct) return;

    const slug = slugify(scrapedProduct.title, { lower: true, strict: true });
    const existingProduct = await ProductModel.findOne({ url: scrapedProduct.url }).lean() as Product | null;

    const priceHistory = existingProduct
      ? [...existingProduct.priceHistory, { price: scrapedProduct.currentPrice }]
      : [{ price: scrapedProduct.currentPrice }];

    const productData: Product = {
      ...scrapedProduct,
      slug: existingProduct?.slug || slug,
      originalPrice: existingProduct?.originalPrice || scrapedProduct.originalPrice,
      priceHistory,
      lowestPrice: calculateLowestPrice(priceHistory),
      highestPrice: calculateHighestPrice(priceHistory),
      averagePrice: calculateAveragePrice(priceHistory),
    };

    const updatedProduct = await ProductModel.findOneAndUpdate(
      { url: scrapedProduct.url },
      productData,
      { upsert: true, new: true }
    ).lean() as Product;

    if (updatedProduct) {
      revalidatePath(`/products/${updatedProduct.slug}`);
    }
  } catch (error) {
    throw new Error("Failed to scrape and store product.");
  }
}

// ✅ Get all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    await connectToDB();
    return (await ProductModel.find().lean()) as Product[];
  } catch {
    return [];
  }
}

// ✅ Get similar products based on category
export async function getSimilarProducts(productSlug: string): Promise<Product[]> {
  try {
    await connectToDB();

    const currentProduct = await ProductModel.findOne({ slug: productSlug }).lean() as Product | null;
    if (!currentProduct) return [];

    const similarProducts = await ProductModel.find({
      category: currentProduct.category,
      slug: { $ne: productSlug },
    }).limit(6).lean() as Product[];

    return similarProducts.length
      ? similarProducts
      : (await ProductModel.find({ slug: { $ne: productSlug } }).limit(6).lean()) as Product[];
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    await connectToDB();

    const product = await ProductModel.findOne({ slug })
      .select("_id url slug currency image title currentPrice originalPrice priceHistory discountRate category reviewsCount stars isOutOfStock description lowestPrice highestPrice averagePrice")
      .lean();

    if (!product || !("_id" in product)) return null; // Explicit check

    return { ...product, _id: String(product._id) } as Product;
  } catch (error) {
    throw new Error(`Failed to fetch product by slug: ${slug}`);
  }
}

// ✅ Add user email for price alert
export async function addUserEmailToProductWithAlert(productSlug: string, userEmail: string, targetPrice: number): Promise<void> {
  try {
    await connectToDB();

    const product = await ProductModel.findOne({ slug: productSlug });
    if (!product) return;

    const userIndex = product.users?.findIndex((user: User) => user.email === userEmail);
    if (userIndex !== -1) {
      product.users[userIndex].targetPrice = targetPrice;
    } else {
      product.users = [...(product.users || []), { email: userEmail, targetPrice }];
    }

    await product.save();
    await sendEmail(await generateEmailBody(product, "WELCOME"), [userEmail]);
  } catch {
    throw new Error("Failed to add/update user for price alerts.");
  }
}

// ✅ Helper functions for price calculations
const calculateLowestPrice = (history: { price: number }[]) => Math.min(...history.map(h => h.price));
const calculateHighestPrice = (history: { price: number }[]) => Math.max(...history.map(h => h.price));
const calculateAveragePrice = (history: { price: number }[]) =>
  history.reduce((sum, h) => sum + h.price, 0) / history.length || 0;

// ✅ Detect platform from URL
const getPlatformFromUrl = (url: string): string | null => {
  if (url.includes("amazon.com") || url.includes("amazon.in")) return "amazon";
  if (url.includes("flipkart.com")) return "flipkart";
  if (url.includes("meesho.com")) return "meesho";
  return null;
};

// ✅ Scrape product based on platform
async function scrapeProduct(platform: string, url: string): Promise<Product | null> {
  switch (platform) {
    case "amazon":
      return await scrapeAmazonProduct(url);
    case "flipkart":
      return await scrapeFlipkartProduct(url);
    case "meesho":
      return await scrapeMeeshoProduct(url);
    default:
      return null;
  }
}
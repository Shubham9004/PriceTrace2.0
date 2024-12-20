"use server";

import { scrapeAmazonProduct } from './amazonScraper';
import { scrapeFlipkartProduct } from './flipkartScraper';
import { scrapeMeeshoProduct } from './meeshoScraper';  // Import Meesho scraper

// Centralized scrapeProduct function
export async function scrapeProduct(url: string) {
  const platform = getPlatformFromUrl(url);

  if (!platform) {
    throw new Error('Unsupported platform');
  }

  if (platform === 'amazon') {
    return await scrapeAmazonProduct(url);
  }
  if (platform === 'flipkart') {
    return await scrapeFlipkartProduct(url);
  }
  if (platform === 'meesho') {
    return await scrapeMeeshoProduct(url);  // Handle Meesho platform
  }

  throw new Error('Unsupported platform');
}

// Helper to detect the platform from URL
function getPlatformFromUrl(url: string): string | null {
  if (url.includes('amazon.com') || url.includes('amazon.in')) return 'amazon';
  if (url.includes('flipkart.com')) return 'flipkart';
  if (url.includes('meesho.com')) return 'meesho';  // Check for Meesho URL
  return null;
}

// Optionally export individual platform scrapers for direct usage
export { scrapeAmazonProduct, scrapeFlipkartProduct, scrapeMeeshoProduct };  // Export Meesho scraper

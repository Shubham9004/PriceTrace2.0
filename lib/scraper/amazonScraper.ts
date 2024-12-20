"use server";

import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';
import dotenv from 'dotenv';

dotenv.config();

// Function to map Amazon country domains to currency symbols
function getCurrencyFromDomain(url: string): string {
  if (url.includes('amazon.in')) return '₹';   // Amazon India
  if (url.includes('amazon.co.uk')) return '£';  // Amazon UK
  if (url.includes('amazon.de')) return '€';   // Amazon Germany
  if (url.includes('amazon.fr')) return '€';   // Amazon France
  if (url.includes('amazon.com')) return '$';   // Amazon US (default)
  if (url.includes('amazon.ca')) return '$';   // Amazon Canada
  if (url.includes('amazon.au')) return 'A$';  // Amazon Australia
  return '$';  // Default to dollar if the country is not listed
}

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  const apiUrl = `https://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;

  try {
    // Send GET request via ScraperAPI
    const response = await axios.get(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load the HTML content into Cheerio
    const $ = cheerio.load(response.data);

    const title = $('#productTitle').text().trim();
    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('.a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base')
    );

    const originalPrice = extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price')
    );

    const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

    const images =
      $('#imgBlkFront').attr('data-a-dynamic-image') ||
      $('#landingImage').attr('data-a-dynamic-image') ||
      '{}';

    const imageUrls = Object.keys(JSON.parse(images));

    // Get the currency from the page using extractCurrency()
    let currency = extractCurrency($('.a-price-symbol'));

    // If the extracted currency symbol is not found, fallback to the default based on the URL
    if (!currency) {
      currency = getCurrencyFromDomain(url);
    }

    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, '');
    const description = extractDescription($);

    // Extract ratings directly if available
    const ratingElement = $('span.a-size-base.a-color-base').text(); // Direct text extraction
    const rating = parseFloat(ratingElement) || 0; // Convert to number, fallback to 0 if invalid

    return {
      url,
      currency,
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'category',
      reviewsCount: 100, // Placeholder for review count
      stars: rating, // Parsed rating
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    };
  } catch (error) {
    console.error('Error occurred while scraping Amazon:', error);
  }
}
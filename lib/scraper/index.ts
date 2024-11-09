"use server";

import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  // Prepare the data for ScraperAPI
  let data = JSON.stringify({
    "url": url,
    "httpResponseBody": true
  });

  // Configuration for the Axios request to ScraperAPI
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.proxyscrape.com/v3/accounts/freebies/scraperapi/request', // ScraperAPI endpoint
    headers: { 
      'Content-Type': 'application/json', 
      'X-Api-Key': process.env.SCRAPER_API_KEY // API key from .env file
    },
    data: data
  };

  try {
    // Fetch the product page using ScraperAPI
    const response = await axios.request(config);
    
    // Check if the response contains browser-rendered HTML or raw HTTP response body
    const responseBody = response.data.data.browserHtml 
      ? response.data.data.browserHtml 
      : Buffer.from(response.data.data.httpResponseBody, 'base64').toString();

    const $ = cheerio.load(responseBody);

    // Extract the product title
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
    const currency = extractCurrency($('.a-price-symbol'));
    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");
    const description = extractDescription($);

    // Construct data object with scraped information
    const data = {
      url,
      currency: currency || '$',
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'category',
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    };

    return data;
  } catch (error) {
    console.error("Error occurred:", error);
  }
}
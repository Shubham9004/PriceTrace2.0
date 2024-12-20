import { PriceHistoryItem, Product, NotificationType, User } from "@/types";

// Define Notification with the imported NotificationType
const Notification: { [key: string]: NotificationType } = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
  TARGET_PRICE_MET: 'TARGET_PRICE_MET', // New notification type
};

const THRESHOLD_PERCENTAGE = 45;

// Utility to sanitize strings for MongoDB
export function sanitizeString(input: string): string {
  try {
    return input.replace(/[^\x00-\x7F]/g, "").trim(); // Removes non-UTF-8 characters
  } catch (error) {
    console.error("Failed to sanitize string:", input, error);
    return "";
  }
}

// Extracts and returns the price from a list of possible elements.
export function extractPrice(...elements: any) {
  for (const element of elements) {
    const priceText = sanitizeString(element.text().trim());

    if (priceText) {
      const cleanPrice = priceText.replace(/[^\d.]/g, "");

      let firstPrice;

      if (cleanPrice) {
        firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
      }

      return firstPrice || cleanPrice;
    }
  }

  return '';
}

// Extracts and returns the currency symbol from an element.
export function extractCurrency(element: any) {
  const currencyText = sanitizeString(element.text().trim().slice(0, 1));
  return currencyText ? currencyText : "";
}

// Extracts description from two possible elements from Amazon.
export function extractDescription($: any) {
  const selectors = [
    ".a-unordered-list .a-list-item",
    ".a-expander-content p",
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      const textContent = elements
        .map((_: any, element: any) => sanitizeString($(element).text().trim()))
        .get()
        .join("\n");
      return textContent;
    }
  }

  return ""; // If no matching elements were found
}

export function getHighestPrice(priceList: PriceHistoryItem[]) {
  let highestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
}

export function getLowestPrice(priceList: PriceHistoryItem[]) {
  let lowestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

// Determine if the target price is met and return the appropriate notification type
export const getEmailNotifType = (
  scrapedProduct: Product,
  currentProduct: Product
): NotificationType | null => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  // Check if the scraped price is lower than the lowest price in the history
  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE;
  }

  // Check if the product is now back in stock
  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK;
  }

  // Check if the discount rate exceeds the threshold percentage
  if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
    console.log(
      `Scraped Discount Rate: ${scrapedProduct.discountRate}, Threshold Percentage: ${THRESHOLD_PERCENTAGE}`
    );
    return Notification.THRESHOLD_MET;
  } 

  // Notify if target price is met or below, only if users are present
  if (currentProduct.users) {
    for (const user of currentProduct.users) {
      // Log the user's target price and the current price
      console.log(
        `User Target Price: ${user.targetPrice}, Scraped Price: ${scrapedProduct.currentPrice}`
      );

      // Check if targetPrice is defined for the user
      if (user.targetPrice && scrapedProduct.currentPrice <= user.targetPrice) {
        return Notification.TARGET_PRICE_MET; // New notification type
      }
    }
  }

  return null;
};

// Format numbers for display
export const formatNumber = (num: number = 0) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
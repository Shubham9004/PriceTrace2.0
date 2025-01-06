import {Product, NotificationType} from "@/types";

// Define Notification with the imported NotificationType
const Notification: { [key: string]: NotificationType } = {
  WELCOME: "WELCOME",
  CHANGE_OF_STOCK: "CHANGE_OF_STOCK",
  LOWEST_PRICE: "LOWEST_PRICE",
  THRESHOLD_MET: "THRESHOLD_MET",
  TARGET_PRICE_MET: "TARGET_PRICE_MET", // New notification type
};

const THRESHOLD_PERCENTAGE = 45;

// Determine if the target price is met and return the appropriate notification type
export const getEmailNotifType = (
  scrapedProduct: Product,
  currentProduct: Product
): NotificationType | null => {
  let lowestPrice = currentProduct.priceHistory[0]?.price; // Start with the first price in history

  // Iterate through the price history to find the lowest price
  for (const priceItem of currentProduct.priceHistory) {
    if (priceItem.price < lowestPrice) {
      lowestPrice = priceItem.price;
    }
  }

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

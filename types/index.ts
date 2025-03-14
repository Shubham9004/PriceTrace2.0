export type PriceHistoryItem = {
  price: number;
};

export type User = {
  email: string;
  targetPrice?: number; // Optional target price for the user
  notified?: boolean; // Optional property
};

export type Product = {
  _id?: string;
  url: string;
  slug: string;
  currency: string;
  image: string;
  title: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: PriceHistoryItem[] | [];
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  discountRate: number;
  description: string;
  category: string;
  reviewsCount: number;
  stars: number;
  isOutOfStock: Boolean;
  users?: User[]; // Array of users who are tracking this product, with optional target prices
};

export type NotificationType =
  | "WELCOME"
  | "CHANGE_OF_STOCK"
  | "LOWEST_PRICE"
  | "THRESHOLD_MET"
  | "TARGET_PRICE_MET"; // New notification type for target price met

export type EmailContent = {
  subject: string;
  body: string;
};

export type EmailProductInfo = {
  title: string;
  url: string;
  currentPrice: number; // Add currentPrice here
  image?: string; // Optional field, you can add other fields as needed
}; 
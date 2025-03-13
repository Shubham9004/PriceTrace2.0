// productInterfaces.ts
export interface PriceHistoryItem {
    price: number;
    date: string; // ISO date string
  }
  
  export interface ScrapedProduct {
    url: string;
    currency: string;
    image: string;
    title: string;
    currentPrice: number;
    originalPrice: number;
    priceHistory: PriceHistoryItem[];
    discountRate: number;
    category: string;
    reviewsCount: number;
    stars: number;
    isOutOfStock: boolean;
    description: string;
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    slug : string;
  }
  
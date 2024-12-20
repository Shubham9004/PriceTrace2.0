"use client";

import { scrapeAndStoreProduct } from '@/lib/actions';
import { FormEvent, useState } from 'react';

// Validate Amazon, Flipkart, or Meesho product URLs
const isValidProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    // Check for Amazon, Flipkart, or Meesho domains
    if (
      hostname.includes('amazon.com') || 
      hostname.includes('amazon.') || 
      hostname.endsWith('amazon') ||
      hostname.includes('flipkart.com') || 
      hostname.includes('flipkart.') ||
      hostname.includes('meesho.com') || 
      hostname.includes('meesho.')
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
};

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidLink = isValidProductURL(searchPrompt);

    if (!isValidLink) {
      return alert('Please provide a valid Amazon, Flipkart, or Meesho product link');
    }

    try {
      setIsLoading(true);

      // Scrape the product page
      const product = await scrapeAndStoreProduct(searchPrompt);
      console.log('Product scraped successfully:', product);
    } catch (error) {
      console.error('Error scraping product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter Amazon, Flipkart, or Meesho product link"
        className="searchbar-input"
      />

      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchPrompt === ''}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

export default Searchbar;

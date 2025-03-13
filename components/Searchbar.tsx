"use client";

import { scrapeAndStoreProduct } from "@/lib/actions";
import { FormEvent, useState, useEffect } from "react";

// Utility function to validate URLs for supported platforms
const isValidProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname.replace("www.", ""); // Normalize URL
    return (
      hostname.includes("amazon.") ||
      hostname.includes("flipkart.") ||
      hostname.includes("meesho.")
    );
  } catch {
    return false;
  }
};

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const placeholderTexts = [
    "Enter an Amazon link",
    "Enter a Flipkart link",
    "Enter a Meesho link",
  ];

  useEffect(() => {
    let typingInterval: NodeJS.Timeout | null = null;
    if (isTyping) {
      let currentText = "";
      let isDeleting = false;
      let loopIndex = 0;
      let charIndex = 0;

      const typeEffect = () => {
        const fullText = placeholderTexts[loopIndex % placeholderTexts.length];

        if (!isDeleting) {
          currentText = fullText.substring(0, charIndex + 1);
          charIndex++;
        } else {
          currentText = fullText.substring(0, charIndex - 1);
          charIndex--;
        }

        setPlaceholder(currentText);

        if (!isDeleting && charIndex === fullText.length) {
          setTimeout(() => (isDeleting = true), 1000);
        } else if (isDeleting && charIndex === 0) {
          isDeleting = false;
          loopIndex++;
        }

        typingInterval = setTimeout(typeEffect, isDeleting ? 75 : 150);
      };

      typeEffect();
    }

    return () => {
      if (typingInterval) clearTimeout(typingInterval);
    };
  }, [isTyping]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidProductURL(searchPrompt)) {
      alert("Please provide a valid Amazon, Flipkart, or Meesho product link");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Sending URL to scrapeAndStoreProduct:", searchPrompt);
      await scrapeAndStoreProduct(searchPrompt); // ✅ Send full URL
    } catch (error) {
      console.error("Error scraping product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = () => {
    if (!searchPrompt) {
      setTimeout(() => setIsTyping(true), 200); // Restart animation with a slight delay
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder={isTyping ? placeholder : ""}
        className="searchbar-input"
        onFocus={() => setIsTyping(false)}
        onBlur={handleBlur}
      />

      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchPrompt === ""}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default Searchbar;

"use client";

import Image from "next/image";

type ShareButtonProps = {
  title: string;
  url: string;  // Make sure to pass the correct product URL here
};

const ShareButton = ({ title, url }: ShareButtonProps) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title,
          text: `Check out this product: ${title}`,
          url, // Share the correct product link, not the Amazon link
        })
        .then(() => console.log("Content shared successfully!"))
        .catch((error) => console.error("Error sharing content:", error));
    } else {
      // Fallback for unsupported browsers: Copy the link to clipboard
      navigator.clipboard
        .writeText(url)
        .then(() => alert("Link copied to clipboard!"))
        .catch((error) => console.error("Error copying to clipboard:", error));
    }
  };

  return (
    <button onClick={handleShare} className="p-2 bg-white-200 rounded-10 flex items-center">
      <Image src="/assets/icons/share.svg" alt="share" width={20} height={20} />
    </button>
  );
};

export default ShareButton;

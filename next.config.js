/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  images: {
    domains: [
      'm.media-amazon.com',
      'rukminim2.flixcart.com',
      'images.meesho.com',  // Add Meesho's image domain here
    ], // Allow the specific Flipkart, Amazon, and Meesho subdomains
  },
};

module.exports = nextConfig;

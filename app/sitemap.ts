import { MetadataRoute } from "next";

export const dynamic = "force-dynamic"; // Ensure the route is dynamically generated

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.pricetrace.tech"; // Change this for production

  try {
    const response = await fetch(`${siteUrl}/api/sitemap-products`);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch products: ${response.status} ${response.statusText}`);
      return [];
    }

    const products: { slug: string; lastModified: string }[] = await response.json();

    const dynamicUrls = products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: product.lastModified || new Date().toISOString(),
    }));

    const staticUrls = [
      { url: "/", lastModified: new Date().toISOString() },
      { url: "/about-us", lastModified: new Date().toISOString() },
      { url: "/services", lastModified: new Date().toISOString() },
      { url: "/contact-us", lastModified: new Date().toISOString() },
      { url: "/privacy-policy", lastModified: new Date().toISOString() },
      { url: "/terms-and-services", lastModified: new Date().toISOString() },
    ].map((page) => ({
      url: `${siteUrl}${page.url}`,
      lastModified: page.lastModified,
    }));

    return [...staticUrls, ...dynamicUrls];
  } catch (error: any) {
    console.error("❌ Sitemap generation error:", error);
    return [];
  }
}

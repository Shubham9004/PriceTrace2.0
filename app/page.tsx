import Searchbar from "@/components/Searchbar";
import Image from "next/image";
import { getAllProducts } from "@/lib/actions";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import Head from "next/head";

// Mark the page as dynamic
export const dynamic = "force-dynamic"; // Forces dynamic rendering

const Home = async () => {
  try {
    // Fetch all products dynamically
    const allProducts: Product[] = await getAllProducts();

    return (
      <>
        {/* SEO Metadata */}
        <Head>
          <title>PriceTrace - Track Product Prices & Save Money</title>
          <meta name="description" content="Track product prices effortlessly and save money on your online shopping. Find the best deals and price history on PriceTrace." />
          <meta name="keywords" content="Pricetrace, keepa amazon price tracker, online product price tracker, amazon price history tracker, amazon product price history, amazon product price tracker" />
          <meta name="author" content="PriceTrace Team" />
          <meta property="og:title" content="PriceTrace - Track Product Prices & Save Money" />
          <meta property="og:description" content="Track product prices effortlessly and save money on your online shopping." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.pricetrace.com" />
          <meta property="og:image" content="/assets/images/seo-image.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="PriceTrace - Track Product Prices & Save Money" />
          <meta name="twitter:description" content="Track product prices effortlessly and save money on your online shopping." />
          <meta name="twitter:image" content="/assets/images/seo-image.png" />
        </Head>

        {/* Hero Section */}
        <section className="px-8 md:px-24 py-16 bg-gray-50">
          <div className="flex flex-col items-center space-y-4 text-center max-w-lg mx-auto">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <p>Your Personal Price Guide</p>
              <Image
                src="/assets/icons/arrow-right.svg"
                alt="Arrow pointing right"
                width={16}
                height={16}
              />
            </div>

            <h1 className="text-4xl font-bold leading-tight text-gray-800">
              Discover Deals with <span>Price</span>
              <span className="text-primary">Trace</span>
            </h1>

            <p className="text-gray-600 text-lg">
              Unlock Savings with Real-Time Price Tracking and Tailored Shopping Insights.
            </p>

            {/* Centered Searchbar */}
            <div className="w-full flex justify-center mt-4">
              <Searchbar />
            </div>
          </div>
        </section>

        {/* Trending Deals Section */}
        <section className="px-8 md:px-24 py-16 bg-white">
          <h2 className="text-3xl font-semibold text-center mb-8">
            Trending <span className="text-[#0000FF]">Deals</span>
          </h2>

          {/* Products Grid */}
          {allProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No products available.</p>
          )}
        </section>
      </>
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return <p className="text-center text-red-500">Failed to load products. Please try again later.</p>;
  }
};

export default Home;
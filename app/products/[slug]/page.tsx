import Modal from "@/components/Modal";
import PriceInfoCard from "@/components/PriceInfoCard";
import ProductCard from "@/components/ProductCard";
import ShareButton from "@/components/ShareButton";
import { getProductBySlug, getSimilarProducts } from "@/lib/actions"; // Fixed import
import { formatNumber } from "@/lib/utils";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import { Metadata } from "next";


type Props = {
  params: { slug: string };
};


export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "This Product is No Longer Available | Price Tracker",
      description: "The product you are looking for is no longer available. Discover similar products and track their prices.",
      alternates: { canonical: "https://yourwebsite.com/products" },
      robots: "noindex, follow", // Prevents indexing but allows crawling of similar products
      openGraph: {
        title: "Product No Longer Available",
        description: "Check out other trending products with price tracking and alerts.",
        url: `https://yourwebsite.com/products/${slug}`,
        images: [{ url: "/assets/icons/not-found.svg", width: 800, height: 600, alt: "Product Unavailable" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Product No Longer Available",
        description: "Find similar products with price alerts and history tracking.",
        images: ["/assets/icons/not-found.svg"],
      },
    };
  }

  return {
    title: `${product.title} | Best Price & Alerts`,
    description: `Track the price history of ${product.title}. Current price: ${product.currency} ${product.currentPrice}. Get price drop alerts now!`,
    alternates: { canonical: `https://yourwebsite.com/products/${slug}` },
    openGraph: {
      title: product.title,
      description: `Track the price history of ${product.title}. Get price alerts now!`,
      url: `https://yourwebsite.com/products/${slug}`,
      images: [{ url: product.image, width: 800, height: 600, alt: product.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: `Track ${product.title} price history and get alerts for price drops!`,
      images: [product.image],
    },
  };
}


const ProductDetails = async ({ params: { slug } }: Props) => {
  const product: Product | null = await getProductBySlug(slug);


  if (!product) {
    redirect("/");
    return null;
  }


  const similarProducts: Product[] = (await getSimilarProducts(slug)) ?? [];


  return (
    <div className="product-container">
      <div className="flex gap-28 xl:flex-row flex-col">
        {/* Product Image */}
        <div className="product-image">
          <Image
            src={product.image}
            alt={product.title}
            width={580}
            height={400}
            className="mx-auto"
          />
        </div>


        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] text-secondary font-semibold">
                {product.title}
              </p>
              <Link
                href={product.url}
                target="_blank"
                className="text-base text-black opacity-50"
              >
                Visit Product
              </Link>
            </div>


            <div className="flex items-center gap-3">
              <div className="product-hearts">
                <Image
                  src="/assets/icons/red-heart.svg"
                  alt="heart"
                  width={20}
                  height={20}
                />
                <p className="text-base font-semibold text-[#D46F77]">
                  {product.reviewsCount}
                </p>
              </div>


              {/* Share Button */}
              <ShareButton title={product.title} url={product.url} />


              <div className="p-2 bg-white-200 rounded-10">
                <Image
                  src="/assets/icons/bookmark.svg"
                  alt="bookmark"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>


          <div className="product-info">
            <div className="flex flex-col gap-2">
              <p className="text-[34px] text-secondary font-bold">
                {product.currency} {formatNumber(product.currentPrice)}
              </p>
              <p className="text-[21px] text-black opacity-50 line-through">
                {product.currency} {formatNumber(product.originalPrice)}
              </p>
            </div>


            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="product-stars">
                  <Image
                    src="/assets/icons/star.svg"
                    alt="star"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-primary-orange font-semibold">
                    {product.stars || "N/A"}
                  </p>
                </div>


                <div className="product-reviews">
                  <Image
                    src="/assets/icons/comment.svg"
                    alt="comment"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-secondary font-semibold">
                    {product.reviewsCount} Reviews
                  </p>
                </div>
              </div>


              <p className="text-sm text-black opacity-50">
                <span className="text-primary-green font-semibold">93% </span> of
                buyers have recommended this.
              </p>
            </div>
          </div>


          <div className="my-7 flex flex-col gap-5">
            <div className="flex gap-5 flex-wrap">
              <PriceInfoCard
                title="Current Price"
                iconSrc="/assets/icons/price-tag.svg"
                value={`${product.currency} ${formatNumber(product.currentPrice)}`}
              />
              <PriceInfoCard
                title="Average Price"
                iconSrc="/assets/icons/chart.svg"
                value={`${product.currency} ${formatNumber(product.averagePrice)}`}
              />
              <PriceInfoCard
                title="Highest Price"
                iconSrc="/assets/icons/arrow-up.svg"
                value={`${product.currency} ${formatNumber(product.highestPrice)}`}
              />
              <PriceInfoCard
                title="Lowest Price"
                iconSrc="/assets/icons/arrow-down.svg"
                value={`${product.currency} ${formatNumber(product.lowestPrice)}`}
              />
            </div>
          </div>


          <Modal productId={slug} />
        </div>
      </div>


      {/* Price History Chart in its own container */}
      <div className="chart-container my-10">
        <h3 className="text-2xl text-secondary font-semibold">Price History</h3>
        <PriceHistoryChart productId={slug} />
      </div>


      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-5">
          <h3 className="text-2xl text-secondary font-semibold">
            Product Description
          </h3>
          <div className="flex flex-col gap-4">
            {product?.description?.split("\n")}
          </div>
        </div>


        <button className="btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px]">
          <Image
            src="/assets/icons/bag.svg"
            alt="check"
            width={22}
            height={22}
          />
          <Link href="/" className="text-base text-white">
            Buy Now
          </Link>
        </button>
      </div>


      {similarProducts && similarProducts.length > 0 && (
        <div className="py-14 flex flex-col gap-2 w-full">
          <p className="section-text">Similar Products</p>
          <div className="flex flex-wrap gap-10 mt-7 w-full">
            {similarProducts.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


export default ProductDetails;
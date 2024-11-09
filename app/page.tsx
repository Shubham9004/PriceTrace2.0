import HeroCarousel from "@/components/HeroCarousel";
import Searchbar from "@/components/Searchbar";
import Image from "next/image";
import { getAllProducts } from "@/lib/actions";
import ProductCard from "@/components/ProductCard";


const Home = async () => {
  const allProducts = await getAllProducts();


  return (
    <>
      <section className="px-8 md:px-24 py-28 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center">
          <div className="text-center md:text-left max-w-lg space-y-6">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-600">
              <p>Your Personal Price Guide</p>
              <Image
                src="/assets/icons/arrow-right.svg"
                alt="arrow pointing right"
                width={16}
                height={16}
              />
            </div>


            <h1 className="text-4xl font-bold leading-snug text-gray-800">
              Discover Deals with 
              <span> Price</span> 
              <span className="text-primary">Trace</span>
            </h1>



            <p className="text-gray-600 text-lg">
              Unlock Savings with Real-Time Price Tracking and Tailored Shopping Insights.
            </p>


            <Searchbar />
          </div>


          <div className="w-full md:w-2/5">
            <HeroCarousel />
          </div>
        </div>
      </section>


      <section className="px-8 md:px-24 py-20 bg-white">
        <h2 className="text-3xl font-semibold text-center mb-10">
          Trending <span className="text-[#0000FF]">Deals</span>
        </h2>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {allProducts?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
};


export default Home;




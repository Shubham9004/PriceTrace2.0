import Head from "next/head";

const AboutUs = () => {
    return (
      <>
        {/* SEO Metadata */}
        <Head>
          <title>About Us - PriceTrace</title>
          <meta name="description" content="Learn more about PriceTrace, our journey, and how we help you track product prices effortlessly to save money." />
          <meta name="keywords" content="Pricetrace, about PriceTrace, price tracking, online shopping deals, Amazon price tracker, Flipkart price tracker, Meesho price tracker" />
          <meta name="author" content="Shubham Rajendra Borde" />
          <meta property="og:title" content="About Us - PriceTrace" />
          <meta property="og:description" content="Learn more about PriceTrace and how we make shopping smarter by tracking product prices for you." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.pricetrace.tech/about" />
          <meta property="og:image" content="/assets/images/about-us.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="About Us - PriceTrace" />
          <meta name="twitter:description" content="Learn more about PriceTrace and how we make shopping smarter by tracking product prices for you." />
          <meta name="twitter:image" content="/assets/images/about-us.png" />
        </Head>

        <section className="px-8 md:px-24 py-28 bg-gradient-to-r from-blue-50 via-gray-100 to-white">
          <div className="flex flex-col items-center space-y-10 text-center max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <p>Our Journey to Smarter Shopping</p>
            </div>
    
            <h1 className="text-4xl font-extrabold leading-tight text-gray-800">
              About Us
            </h1>
    
            <p className="text-gray-600 text-lg md:text-xl mb-6">
              Hey, I’m <span className="font-semibold text-primary">Shubham Rajendra Borde</span>, the founder of <span className="font-semibold">PriceTrace</span>. What began as a simple way for me to track prices turned into a mission to help you shop smarter and save more money. 
            </p>
    
            <p className="text-gray-600 text-lg md:text-xl mb-6">
              At PriceTrace, we believe shopping should be easy. We track product prices from popular e-commerce platforms like Amazon, Flipkart, and Meesho, bringing you the best deals right at your fingertips. And we’re just getting started – there are many more platforms on the way!
            </p>
    
            <p className="text-gray-600 text-lg md:text-xl mb-6">
              I’ve always believed in making things simpler, and that’s what PriceTrace is all about – easy navigation, smart recommendations, and helping you make the best purchasing decisions without the stress.
            </p>
    
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-3xl mx-auto mb-8">
              <p className="text-gray-600 text-lg md:text-xl mb-4">
                PriceTrace gives you the power to set a target price for any product. Once the price drops to your target, we’ll send you an email. No more constant checking – let us do the work, so you can make your move when the time is right.
              </p>
            </div>
    
            <p className="text-gray-600 text-lg md:text-xl mb-6">
              Thank you for choosing PriceTrace. I’m excited to help you make smarter shopping decisions, save more, and enjoy a seamless shopping experience. Let’s make every purchase a great one!
            </p>
          </div>
        </section>
      </>
    );
  };
  
  export default AboutUs;
'use client';

const ServicesPage = () => {
  return (
    <section className="px-8 md:px-24 py-28 bg-gradient-to-b from-gray-50 to-gray-200">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-8">Discover Our Premium Services</h1>
        <p className="text-xl text-gray-700 mb-16">
          Unlock a world of convenience and smarter shopping with our tailored solutions. Whether you want to track prices, analyze trends, or receive personalized alerts, our services are designed to empower your shopping journey.
        </p>
        <div className="space-y-12">
          <div className="bg-white p-8 rounded-lg shadow-lg transition transform hover:scale-105">
            <h3 className="text-3xl font-bold text-primary mb-6">Price Tracking Alerts</h3>
            <p className="text-gray-600 mb-6">
              Stay ahead of the market with real-time price updates. Receive instant notifications via email when the cost of your favorite products drops. Make informed purchasing decisions and secure the best deals effortlessly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg transition transform hover:scale-105">
            <h3 className="text-3xl font-bold text-primary mb-6">Product Price History Analysis</h3>
            <p className="text-gray-600 mb-6">
              Dive into comprehensive price history data. Our interactive charts and trend analysis provide valuable insights into pricing patterns, helping you predict the best times to buy and avoid overpaying.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg transition transform hover:scale-105">
            <h3 className="text-3xl font-bold text-primary mb-6">Personalized Recommendations</h3>
            <p className="text-gray-600 mb-6">
              Discover products tailored to your interests and needs. Our AI-driven recommendations ensure you find the perfect deals, making your shopping experience more efficient and enjoyable.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg transition transform hover:scale-105">
            <h3 className="text-3xl font-bold text-primary mb-6">Email Alerts for Target Price</h3>
            <p className="text-gray-600 mb-6">
              Set your desired price for any product, and we'll notify you the moment it matches. Save time and money by letting us track prices for you and ensuring you never miss an opportunity.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg transition transform hover:scale-105">
            <h3 className="text-3xl font-bold text-primary mb-6">Price Comparison Insights</h3>
            <p className="text-gray-600 mb-6">
              Compare prices across multiple retailers instantly. Find the best deals with ease and ensure you are getting the most value for your money every time you shop.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg transition transform hover:scale-105">
            <h3 className="text-3xl font-bold text-primary mb-6">Exclusive Deal Alerts</h3>
            <p className="text-gray-600 mb-6">
              Be the first to know about exclusive deals and discounts. Our alert system ensures you never miss limited-time offers, saving you money on your favorite products.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesPage;

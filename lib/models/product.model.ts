import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true }, // Added slug field
    currency: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    priceHistory: [
      {
        price: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    lowestPrice: { type: Number },
    highestPrice: { type: Number },
    averagePrice: { type: Number },
    discountRate: { type: Number },
    description: { type: String },
    category: { type: String },
    reviewsCount: { type: Number },
    stars: { type: Number, required: false, default: 0 },
    isOutOfStock: { type: Boolean, default: false },
    users: [
      {
        email: { type: String, required: true },
        targetPrice: { type: Number, required: false }, // Optional targetPrice field
        notified: { type: Boolean, default: false }, // Add notified field with default value false
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
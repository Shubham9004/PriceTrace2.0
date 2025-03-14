import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  return (
    <div className="product-card">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="product-card_img-container">
          <Image 
            src={product.image}
            alt={product.title}
            width={200}
            height={200}
            className="product-card_img"
          />
        </div>
      </Link>

      <div className="flex flex-col gap-3">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="product-title">{product.title}</h3>
        </Link>

        <div className="flex justify-between">
          <p className="text-black opacity-50 text-lg capitalize">
            {product.category}
          </p>

          <p className="text-black text-lg font-semibold">
            <span>{product.currency}</span>
            <span>{product.currentPrice}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

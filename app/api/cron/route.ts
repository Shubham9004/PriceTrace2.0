import { NextResponse } from "next/server";
import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { scrapeAmazonProduct, scrapeFlipkartProduct, scrapeMeeshoProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { User } from '@/types';

export const maxDuration = 60; // This function can run for a maximum of 300 seconds
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    console.log("Connecting to database...");
    await connectToDB(); // Connect to the database

    console.log("Fetching products from the database...");
    const products = await Product.find({}); // Fetch all products from the database

    if (!products || products.length === 0) {
      console.error("No products fetched from the database.");
      throw new Error("No product fetched");
    }
    console.log(`Total products fetched: ${products.length}`);

    // ======================== 1 SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        console.log(`Processing product: ${currentProduct.title}, URL: ${currentProduct.url}`);
        let scrapedProduct = null;

        try {
          if (currentProduct.url.includes("amazon")) {
            console.log("Scraping Amazon product...");
            scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
          } else if (currentProduct.url.includes("flipkart")) {
            console.log("Scraping Flipkart product...");
            scrapedProduct = await scrapeFlipkartProduct(currentProduct.url);
          } else if (currentProduct.url.includes("meesho")) {
            console.log("Scraping Meesho product...");
            scrapedProduct = await scrapeMeeshoProduct(currentProduct.url);
          }

          if (!scrapedProduct) {
            console.error(`Scraping failed for product: ${currentProduct.url}`);
            return;
          }

          console.log("Scraping successful:", scrapedProduct);
        } catch (scrapeError) {
          console.error(`Error scraping product: ${currentProduct.url}`, scrapeError);
          return;
        }

        // Update product price history
        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          {
            price: scrapedProduct.currentPrice,
          },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        console.log("Updating product in database...");
        const updatedProduct = await Product.findOneAndUpdate(
          { url: product.url },
          product,
          { new: true }
        );

        if (!updatedProduct) {
          console.error(`Failed to update product in database: ${product.url}`);
          return;
        }

        console.log(`Product updated successfully: ${updatedProduct.title}`);

        // ======================== 2 CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
        const emailNotifType: ReturnType<typeof getEmailNotifType> | null = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );

        console.log("Email notification type:", emailNotifType);

        if (emailNotifType && updatedProduct?.users?.length > 0) {
          console.log(`Preparing email for product: ${updatedProduct.title}`);
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
            currentPrice: updatedProduct.currentPrice,
            targetPrice: updatedProduct.users[0]?.targetPrice,  // Ensure targetPrice is passed
          };

          console.log("Product info for email:", productInfo);

          try {
            const emailContent = await generateEmailBody(product, emailNotifType);
            const userEmails = updatedProduct.users.map((user: User) => user.email);
            console.log("Sending email to users:", userEmails);
            await sendEmail(emailContent, userEmails);
            console.log("Email sent successfully.");
          } catch (emailError) {
            console.error(`Failed to send email for product: ${updatedProduct.title}`, emailError);
          }
        }

// ======================== 3 CHECK FOR TARGET PRICE NOTIFICATIONS
if (updatedProduct?.users) {
  for (const user of updatedProduct.users as User[]) {
    console.log(`Checking target price for user: ${user.email}`);
    if (user.targetPrice && user.targetPrice > 0 && scrapedProduct.currentPrice <= user.targetPrice) {
      console.log(`Target price met for user: ${user.email}, Product: ${updatedProduct.title}`);
      const productInfo = {
        title: updatedProduct.title,
        url: updatedProduct.url,
        currentPrice: updatedProduct.currentPrice,
        targetPrice: user.targetPrice,  // Ensure targetPrice is passed
      };
      try {
        const emailContent = await generateEmailBody(product, "TARGET_PRICE_MET");
        console.log(`Sending threshold met email to: ${user.email}`);
        await sendEmail(emailContent, [user.email]);
        console.log("Threshold email sent successfully.");
      } catch (thresholdEmailError) {
        console.error(`Failed to send threshold email for user: ${user.email}`, thresholdEmailError);
      }
    } else {
      console.log(`Target price not met for user: ${user.email}`);
    }
      }
        }

        return updatedProduct;
      })
    );

    console.log("All products processed successfully.");

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });
  } catch (error: any) {
    console.error("An error occurred during processing:", error);
    return NextResponse.json({
      message: `Failed to get all products: ${error.message}`,
      status: "error",
    });
  }
}
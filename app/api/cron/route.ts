import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { scrapeAmazonProduct, scrapeFlipkartProduct, scrapeMeeshoProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { getEmailNotifType } from "@/lib/utils";
import { User } from "@/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find({});
    if (!products.length) throw new Error("No products available.");

    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        let scrapedData = null;

        try {
          if (product.url.includes("amazon")) {
            scrapedData = await scrapeAmazonProduct(product.url);
          } else if (product.url.includes("flipkart")) {
            scrapedData = await scrapeFlipkartProduct(product.url);
          } else if (product.url.includes("meesho")) {
            scrapedData = await scrapeMeeshoProduct(product.url);
          }

          if (!scrapedData) return;
        } catch {
          return;
        }

        const updatedPriceHistory = [
          ...product.priceHistory,
          { price: scrapedData.currentPrice },
        ];

        const updatedProduct = await Product.findOneAndUpdate(
          { slug: product.slug },
          { ...scrapedData, priceHistory: updatedPriceHistory },
          { new: true }
        );

        if (!updatedProduct) return;

        const emailNotifType = getEmailNotifType(scrapedData, product);
        if (emailNotifType && updatedProduct.users?.length) {
          try {
            const emailContent = await generateEmailBody(updatedProduct, emailNotifType);
            const userEmails = updatedProduct.users.map((user: User) => user.email);
            await sendEmail(emailContent, userEmails);
          } catch {}
        }

        if (updatedProduct.users) {
          for (const user of updatedProduct.users as User[]) {
            if (
              user.targetPrice &&
              user.targetPrice > 0 &&
              scrapedData.currentPrice <= user.targetPrice
            ) {
              try {
                const emailContent = await generateEmailBody(updatedProduct, "TARGET_PRICE_MET");
                await sendEmail(emailContent, [user.email]);
              } catch {}
            }
          }
        }

        return updatedProduct;
      })
    );

    return NextResponse.json({ message: "Ok", data: updatedProducts });
  } catch (error: any) {
    return NextResponse.json({ message: `Failed: ${error.message}`, status: "error" });
  }
}
import { NextResponse } from "next/server";

const API_URL = "https://www.pricetrace.tech/api/alerts";
const API_KEY = process.env.PRICE_TRACE_API_KEY || "";

// ✅ Ensures dynamic execution & fresh API calls
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();

    console.log("🔹 Forwarding request to:", API_URL);
    console.log("📦 Request Body:", requestBody);

    // ✅ Secure API key usage (server-side only)
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log("✅ Proxy Response:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Proxy Error:", error);
    return NextResponse.json({ success: false, error: "Proxy error" }, { status: 500 });
  }
}

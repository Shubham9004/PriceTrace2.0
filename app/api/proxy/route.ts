import { NextResponse } from "next/server";

const API_URL = "https://www.pricetrace.tech/api/alerts";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

export async function POST(req: Request) {
  try {
    const requestBody = await req.json();

    // Make request from the server (not exposing API key)
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY, // Using API key on server-side only
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ success: false, error: "Proxy error" }, { status: 500 });
  }
}

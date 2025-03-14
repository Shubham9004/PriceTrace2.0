// app/robots.txt.ts

export async function GET() {
    const robots = `
  User-agent: *
  Allow: /
  
  # Block API endpoints and sensitive pages
  Disallow: /api/
  Disallow: /admin/
  Disallow: /login/
  
  Sitemap: https://yourwebsite.com/sitemap.xml
  `;
    return new Response(robots.trim(), {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
  
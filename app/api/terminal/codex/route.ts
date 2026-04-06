import { NextRequest, NextResponse } from "next/server";
import { getInitialBlogEntries, getBlogEntryBySlug } from "@/lib/blog";
import { jsonSecurityHeaders } from "@/lib/json-security-headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    if (action === "list") {
      const blogEntries = await getInitialBlogEntries(200);
      const posts = blogEntries.map((entry) => ({
        title: entry.title || "Untitled",
        slug: entry.slug,
        date: entry.date || "",
        updated: entry.updated || entry.date || "",
        excerpt: entry.description || "",
        hashtags: entry.hashtags || [],
      }));
      return NextResponse.json({ posts }, { headers: jsonSecurityHeaders() });
    }

    if (action === "post") {
      const slug = searchParams.get("slug");
      if (!slug) {
        return NextResponse.json({ error: "Slug parameter required" }, { status: 400, headers: jsonSecurityHeaders() });
      }

      const entry = await getBlogEntryBySlug(slug);
      if (!entry) {
        return NextResponse.json({ error: "Post not found" }, { status: 404, headers: jsonSecurityHeaders() });
      }

      const post = {
        title: entry.title || "Untitled",
        slug: entry.slug,
        date: entry.date || "",
        updated: entry.updated || entry.date || "",
        excerpt: entry.description || "",
        hashtags: entry.hashtags || [],
        content: "",
      };
      return NextResponse.json({ post }, { headers: jsonSecurityHeaders() });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400, headers: jsonSecurityHeaders() });
  } catch (error) {
    console.error("Blog API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: jsonSecurityHeaders() });
  }
}

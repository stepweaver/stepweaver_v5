import type { Project } from "../projects.schema";

export const soapStache: Project = {
  slug: "soap-stache",
  title: "Soap Stache",
  description: "E-commerce storefront for artisan grooming products with product catalog and checkout.",
  status: "live",
  tags: ["E-commerce", "Web", "Next.js"],
  keywords: ["e-commerce", "grooming", "products", "checkout"],
  imageUrl: "/images/soap_stache.webp",
  builtFor: "Soap Stache brand",
  solved: "Online product sales",
  delivered: ["Product catalog", "Shopping cart", "Checkout flow", "Mobile-first design"],
  cardDescription: "Artisan grooming e-commerce",
  cardBuiltFor: "Soap Stache",
  cardSolved: "Online sales",
  cardDelivered: ["Product catalog", "Cart", "Checkout"],
  sections: [
    { id: "overview", title: "Overview", type: "overview", content: "An e-commerce storefront for artisan grooming products featuring a product catalog, shopping cart, and streamlined checkout." },
    { id: "problem", title: "The Problem", type: "problem", bullets: ["No online sales channel", "Manual order processing", "Limited product visibility"] },
    { id: "solution", title: "The Solution", type: "solution", bullets: ["Full e-commerce storefront", "Product catalog with images", "Shopping cart and checkout", "Mobile-first responsive design"] },
    { id: "features", title: "Key Features", type: "features", bullets: ["Product catalog", "Shopping cart", "Checkout flow", "Mobile-first design", "Image optimization"] },
    { id: "outcome", title: "Outcome", type: "outcome", content: "Enabled online sales with a clean, mobile-first e-commerce experience." },
    { id: "tech-stack", title: "Tech Stack", type: "tech-stack", techStack: [{ name: "Next.js", category: "Framework" }, { name: "React", category: "Library" }, { name: "Tailwind CSS", category: "Styling" }] },
  ],
};

export default soapStache;

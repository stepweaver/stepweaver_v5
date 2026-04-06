import type { Project } from "../projects.schema";

export const lambdaHeatingAir: Project = {
  slug: "lambda-heating-air",
  title: "Lambda Heating & Air",
  description: "HVAC service company website with online booking, service area pages, and lead capture.",
  status: "live",
  tags: ["Web", "HVAC", "Booking"],
  keywords: ["hvac", "booking", "service", "lead-capture"],
  imageUrl: "/images/lambda_heating_air.webp",
  builtFor: "Lambda Heating & Air",
  solved: "Online booking and lead generation",
  delivered: ["Service booking system", "Service area pages", "Lead capture forms", "SEO optimization"],
  cardDescription: "HVAC company website with booking",
  cardBuiltFor: "Lambda Heating & Air",
  cardSolved: "Online booking",
  cardDelivered: ["Booking system", "Service pages", "Lead capture"],
  sections: [
    { id: "overview", title: "Overview", type: "overview", content: "A full-service website for an HVAC company featuring online booking, service area pages, and lead capture forms." },
    { id: "problem", title: "The Problem", type: "problem", bullets: ["No online booking capability", "Poor online visibility", "Manual lead tracking"] },
    { id: "solution", title: "The Solution", type: "solution", bullets: ["Online booking integration", "Service area pages with SEO", "Automated lead capture"] },
    { id: "features", title: "Key Features", type: "features", bullets: ["Online booking system", "Service area pages", "Lead capture forms", "Mobile-responsive design", "SEO optimization"] },
    { id: "outcome", title: "Outcome", type: "outcome", content: "Enabled online booking and improved lead generation for the HVAC business." },
    { id: "tech-stack", title: "Tech Stack", type: "tech-stack", techStack: [{ name: "Next.js", category: "Framework" }, { name: "React", category: "Library" }, { name: "Tailwind CSS", category: "Styling" }] },
  ],
};

export default lambdaHeatingAir;

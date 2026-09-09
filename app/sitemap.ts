import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://impact-technologies.com";

  const routes = [
    "",
    "/solutions",
    "/solutions/ai-agents",
    "/solutions/automation",
    "/solutions/software",
    "/products",
    "/projects",
    "/projects/restaurant-technology-platform",
    "/projects/lead-crm-automation-engine",
    "/projects/enterprise-knowledge-agent",
    "/start-a-project",
    "/about",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/solutions") || route === "/start-a-project" ? 0.9 : 0.8,
  }));
}

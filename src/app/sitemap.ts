import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/browse`,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/login`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteConfig.url}/register`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/seller-verification`,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  if (!process.env.MONGODB_URI) {
    return staticRoutes;
  }

  try {
    await connectToDatabase();

    const listings = await ListingModel.find({
      isActive: true,
      status: "approved",
    })
      .select("_id updatedAt")
      .sort({ updatedAt: -1 })
      .limit(5000)
      .lean();

    const listingRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
      url: `${siteConfig.url}/listings/${String(listing._id)}`,
      lastModified: listing.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [...staticRoutes, ...listingRoutes];
  } catch {
    return staticRoutes;
  }
}

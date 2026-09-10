import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@staybnb/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};

export default nextConfig;

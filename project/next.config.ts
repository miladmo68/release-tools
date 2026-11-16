import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_PAGES === "true" ? "/ivory-arc-wedding-studio" : "",
  env: { NEXT_PUBLIC_ASSET_BASE: process.env.GITHUB_PAGES === "true" ? "/ivory-arc-wedding-studio" : "" },
  images: { unoptimized: true },
  trailingSlash: true
};

export default nextConfig;

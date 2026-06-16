import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/emshub",
  images: { unoptimized: true },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@rotaract/components",
    "@rotaract/members",
    "@rotaract/settings",
  ],
};

export default nextConfig;

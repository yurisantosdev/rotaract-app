const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@rotaract/finance",
    "@rotaract/components",
    "@rotaract/settings",
    "@rotaract/members",
    "@rotaract/calendar",
    "@rotaract/notices",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

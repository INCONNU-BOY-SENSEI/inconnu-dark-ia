/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.SERVER_URL || "http://server:4000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

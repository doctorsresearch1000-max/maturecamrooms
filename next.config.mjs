/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.maturecamrooms.com" }],
        destination: "https://maturecamrooms.com/:path*",
        permanent: true,
      },
      {
        source: "/cougar",
        destination: "/category/mature",
        permanent: true,
      },
      {
        source: "/mom",
        destination: "/category/mature",
        permanent: true,
      },
    ];
  },
  images: {
    // Cloudflare Pages (next-on-pages) serves remote CDN thumbs directly.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imagetransform.icfcdn.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;

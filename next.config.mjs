/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s1.cdn.autoevolution.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;

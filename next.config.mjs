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
  allowedDevOrigins: ['172.20.10.2', '192.168.1.75'],
};

export default nextConfig;

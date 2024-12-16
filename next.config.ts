import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ylhbfcxmd5n846ls.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;

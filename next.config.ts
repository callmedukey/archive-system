import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "e4h7a1ylas.ufs.sh",
        pathname: "/f/*",
      },
    ],
  },
};

export default nextConfig;

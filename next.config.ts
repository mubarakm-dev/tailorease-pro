import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "svvwvpscaobelploclpb.supabase.co",
      },
    ],
  },
  experimental: {
    serverActionsBodySizeLimit: "50mb",
  },
};

export default nextConfig;

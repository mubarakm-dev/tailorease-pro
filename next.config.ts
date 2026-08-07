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
  serverActions: {
    bodySizeLimit: "50mb",
  },
};

export default nextConfig;

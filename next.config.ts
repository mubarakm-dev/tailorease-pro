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
};

export default nextConfig;

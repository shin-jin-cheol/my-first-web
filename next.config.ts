import type { NextConfig } from "next";

const supabaseImageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseImageUrlObject = supabaseImageUrl ? new URL(supabaseImageUrl) : null;

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = supabaseImageUrlObject
  ? [
      {
        protocol: supabaseImageUrlObject.protocol.replace(":", "") as "http" | "https",
        hostname: supabaseImageUrlObject.hostname,
        port: supabaseImageUrlObject.port,
        pathname: "/storage/v1/object/public/**",
      },
    ]
  : [];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 86, 88],
  },
  reactStrictMode: true,
  serverExternalPackages: [
    "@sparticuz/chromium",
    "playwright",
    "playwright-core",
  ],
  outputFileTracingIncludes: {
    "/api/mi-reserva/adventure-pass": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },
};

export default nextConfig;

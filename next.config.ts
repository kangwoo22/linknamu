import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 같은 와이파이의 휴대폰에서 개발 서버(npm run dev)에 접속해 확인할 때 필요 (개발 모드 전용)
  allowedDevOrigins: ["192.168.200.122"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

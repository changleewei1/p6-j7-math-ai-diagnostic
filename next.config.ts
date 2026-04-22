import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // 上層目錄若另有 lockfile，避免誤判 workspace 根；Vercel 上 cwd 即倉庫根目錄
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;

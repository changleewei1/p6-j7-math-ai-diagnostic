import type { NextConfig } from "next";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  // 上層目錄若另有 lockfile，避免誤判 workspace 根；本機 dev 若曾從 Desktop 父層推斷，需鎖專案根並固定 tailwind 解析
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: path.join(projectRoot, "node_modules/tailwindcss"),
    },
  },
};

export default nextConfig;

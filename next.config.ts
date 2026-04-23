import type { NextConfig } from "next";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 專案根＝本檔所在目錄；勿用 process.cwd()（在 Desktop 上層執行時會錯）
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const projectNodeModules = path.join(projectRoot, "node_modules");
const require = createRequire(path.join(projectRoot, "package.json"));

const twPackageDir = path.dirname(require.resolve("tailwindcss/package.json"));
const twIndexCssAbs = path.join(twPackageDir, "index.css");

// Turbopack 不接受以絕對路徑當成 alias 目標（曾出現 `.\/Users\/...` server-relative 錯誤）；用相對於專案根
const twNodeRel = "./node_modules/tailwindcss" as const;
const twIndexRel = "./node_modules/tailwindcss/index.css" as const;

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      // 有請求在錯誤的 description root（家目錄 package.json 的 ./Desktop）下仍要命中本專案
      tailwindcss: twNodeRel,
      "tailwindcss/index.css": twIndexRel,
    },
  },
  webpack: (config) => {
    const prev = config.resolve?.alias;
    const base =
      prev && !Array.isArray(prev) && typeof prev === "object"
        ? (prev as Record<string, string | string[] | false | undefined | unknown>)
        : {};
    // 明確以「套件目錄」作為 `tailwindcss` 別名，避免只指到主檔 .mjs 導致子路徑解析怪異
    const nextAlias = {
      ...base,
      tailwindcss: twPackageDir,
      "tailwindcss/index.css": twIndexCssAbs,
    };

    const prevModules = config.resolve?.modules;
    const modules: string[] = [
      projectNodeModules,
      ...(Array.isArray(prevModules) && prevModules.length > 0
        ? prevModules
        : [path.join(projectRoot, "node_modules"), "node_modules"]),
    ];
    if (!modules.includes("node_modules")) {
      modules.push("node_modules");
    }

    config.resolve = {
      ...config.resolve,
      modules,
      /**
       * 家目錄若存在 /Users/.../package.json 且含 `./Desktop` 等路徑，部分解析會把 context 掛在 Desktop。
       * 把「專案內的 node_modules」放進 roots，可讓相對/向上解析仍先落回專案依賴。
       */
      roots: [projectRoot, ...(config.resolve?.roots || [])].filter(
        (p, i, a) => a.indexOf(p) === i,
      ) as [string, ...string[]],
      alias: nextAlias,
    };
    return config;
  },
};

export default nextConfig;

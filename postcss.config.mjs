import path from "node:path";
import { fileURLToPath } from "node:url";

// 專案根 = 本檔所在目錄（不可依賴 process.cwd 或上層 npm workspaces）
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const config = {
  plugins: {
    "@tailwindcss/postcss": {
      base: projectRoot,
    },
  },
};

export default config;

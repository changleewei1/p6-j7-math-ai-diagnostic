import { z } from "zod";

const uuid = z.string().uuid();

/** 路徑參數通用 UUID 驗證 */
export function parseUuidParam(
  value: string | undefined,
  message: string = "無效的識別碼",
) {
  return z.string().uuid(message).parse(value);
}

export { uuid as uuidStringSchema };

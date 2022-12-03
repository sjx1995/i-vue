/*
 * @Description: rollup 配置
 * @Author: Sunly
 * @Date: 2022-12-03 13:16:00
 */
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };

export default {
  input: "./src/index.ts",
  output: [
    {
      format: "cjs",
      file: pkg.main,
    },
    {
      format: "es",
      file: pkg.module,
    },
  ],
  plugins: [typescript()],
};

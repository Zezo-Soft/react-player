import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";

export default defineConfig({
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "es",
    name: "zezo-react-player",
  },
  external: [
    "react",
    "react-dom",
    "zustand",
    "zustand/react/shallow",
    "lucide-react",
    "hls.js",
    "react-icons/io",
    "screenfull",
    "react-icons/io5",
    "dashjs",
  ],
  plugins: [
    typescript({ tsconfig: "tsconfig.json" }),
    postcss({
      config: {
        path: "./postcss.config.js",
      },
      extensions: [".css"],
      // minimize: true,
      inject: {
        insertAt: "top",
      },
    }),
  ],
});

import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";

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
    "react-video-seek-slider",
    "lucide-react",
  ],
  plugins: [typescript({ tsconfig: "tsconfig.json" })],
});

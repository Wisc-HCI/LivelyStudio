import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { comlink } from "vite-plugin-comlink";
import svgr from "vite-plugin-svgr";
import wasmPack from 'vite-plugin-wasm-pack';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    comlink(),
    wasmPack('./puppeteer-rust')
  ],
  assetsInclude: ["**/*.gltf", "**/*.glb"],
  worker: {
    plugins: [comlink()],
  },
});

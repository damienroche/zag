import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"
import components from "vite-plugin-components"
import persist from "vite-plugin-optimize-persist"
import pkgConfig from "vite-plugin-package-config"
import pages from "vite-plugin-pages"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
  resolve: {
    alias: [
      {
        find: /^@zag-js\/(.*)$/,
        replacement: path.resolve(process.cwd(), "..", "..", "node_modules/@zag-js/$1/src"),
      },
    ],
  },
  plugins: [
    vue(),
    pages({
      pagesDir: "src/pages",
      extensions: ["vue", "ts", "tsx"],
    }),
    components({
      extensions: ["tsx", "vue", "ts"],
      dirs: ["./src/components"],
    }),
    pkgConfig(),
    persist(),
  ],
})

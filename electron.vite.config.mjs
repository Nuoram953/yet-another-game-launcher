import { defineConfig } from "electron-vite";
import { resolve } from "path";
import { viteStaticCopy } from 'vite-plugin-static-copy'
import react from "@vitejs/plugin-react";


export default defineConfig({
  main: {
    build: {
      outDir: "dist/main",
    },
    publicDir: resolve(__dirname, "public"),
    resolve: {
      alias: {
        "@main": resolve(__dirname, "src/main"),
        "@common": resolve(__dirname, "src/common"),
        "@preload": resolve(__dirname, "src/preload"),
      },
    },
    plugins: [
      // viteStaticCopy({
      //   targets: [
      //     {
      //       src: './public/yt-dlp',
      //       dest: '../bin'
      //     }
      //   ]
      // }),
    ]
  },
  preload: {
    build: {
      outDir: "dist/preload",
    },
    resolve: {
      alias: {
        "@common": resolve(__dirname, "src/common"),
        "@preload": resolve(__dirname, "src/preload"),
      },
    },
  },
  renderer: {
    build: {
      outDir: "dist/renderer",
    },
    publicDir: resolve(__dirname, "public"),
    resolve: {
      alias: {
        "@render": resolve(__dirname, "src/renderer"),
        "@common": resolve(__dirname, "src/common"),
        "@preload": resolve(__dirname, "src/preload"),
        "@hook": resolve(__dirname, "src/renderer/hooks"),
        "@component": resolve(__dirname, "src/renderer/components"),
      },
    },
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: resolve(__dirname, 'public'),
            dest: '.',
          }
        ],
      }),
    ],
    server: {
      port: 5173,
    },
  },
  build: {
    minify: true,
    sourcemap: true,
    reportCompressedSize: true,
  },
  logLevel: "info",
  plugins: [
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: './public/yt-dlp',
    //       dest: 'bin'
    //     }
    //   ]
    // }),
  ],
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import seoPlugin from "./vite-plugin-seo";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  assetsInclude: ['**/*.JPG', '**/*.JPEG', '**/*.PNG'],
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 75 },
    }),
    seoPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  // Keep 3D deps prebundled — a broken .vite/deps cache returns 504 and blanks /configurator
  optimizeDeps: {
    include: ["three", "@react-three/fiber", "@react-three/drei", "three-stdlib"],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Animations
          if (id.includes('node_modules/framer-motion/')) {
            return 'vendor-animations';
          }
          // 3D configurator (three.js) — loaded only on /configurator
          if (id.includes('node_modules/three/') || id.includes('node_modules/@react-three/') || id.includes('node_modules/three-stdlib/')) {
            return 'vendor-three';
          }
          // Supabase
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }
          // Data fetching
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-query';
          }
          // Radix UI components
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-radix';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2, drop_console: true, drop_debugger: true },
      mangle: true,
      format: { comments: false },
    },
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
  },
}));

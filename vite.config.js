import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const manifest = {
  theme_color: "#8936FF",
  background_color: "#2EC6FE",
  icons: [
    {
      purpose: "maskable",
      sizes: "512x512",
      src: "/smart/icon512_maskable.png", // укажите путь с учетом подкаталога
      type: "image/png",
    },
    {
      purpose: "any",
      sizes: "512x512",
      src: "/smart/icon512_rounded.png", // укажите путь с учетом подкаталога
      type: "image/png",
    },
  ],

  orientation: "any",
  display: "standalone",
  lang: "ru-RU",
  name: "Smart",
  start_url: "/smart/", // Убедитесь, что путь правильный
  screenshots: [
    {
      src: "/screenshot1.png",
      sizes: "1280x800",
      type: "image/png",
      form_factor: "wide",
    },
    {
      src: "/screenshot2.png",
      sizes: "640x1136",
      type: "image/png",
    },
  ],
};

export default defineConfig({
  base: "/smart/", // 👈 обязательно укажи путь как у репозитория
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,svg,woff2,woff}"],
      },
      manifest: manifest,
    }),
  ],
});

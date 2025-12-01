import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import officeAddin from "vite-plugin-office-addin";
import devCerts from "office-addin-dev-certs";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return {
    ca: httpsOptions.ca,
    key: httpsOptions.key,
    cert: httpsOptions.cert,
  };
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    officeAddin({
      devUrl: "https://localhost:3000",
      prodUrl: "https://www.contoso.com", // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  root: "src",
  build: {
    rollupOptions: {
      input: {
        taskpane: "/taskpane/taskpane.html",
        commands: "/commands/commands.html",
      },
    },
    outDir: "../dist",
    emptyOutDir: true,
  },
  server:
    mode !== "production" ? { https: await getHttpsOptions(), port: 3000 } : {},
  test: {
    globals: true,
    environment: "jsdom",
    root: "./",
    dir: "./tests",
  },
}));

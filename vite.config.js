import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const getVendorChunk = (id) => {
  if (!id.includes("node_modules")) {
    return undefined;
  }

  if (id.includes("react-dom") || id.includes("react-router-dom") || id.includes("react")) {
    return "vendor-react";
  }

  if (id.includes("@mui") || id.includes("@emotion")) {
    return "vendor-mui";
  }

  if (id.includes("antd") || id.includes("@ant-design")) {
    return "vendor-antd";
  }

  if (
    id.includes("/rc-table") ||
    id.includes("\\rc-table") ||
    id.includes("/rc-picker") ||
    id.includes("\\rc-picker")
  ) {
    return "vendor-antd-data";
  }

  if (
    id.includes("/rc-select") ||
    id.includes("\\rc-select") ||
    id.includes("/rc-menu") ||
    id.includes("\\rc-menu") ||
    id.includes("/rc-tree") ||
    id.includes("\\rc-tree")
  ) {
    return "vendor-antd-controls";
  }

  if (id.includes("/rc-") || id.includes("\\rc-") || id.includes("@rc-component")) {
    return "vendor-antd-rc";
  }

  if (id.includes("chart.js") || id.includes("react-chartjs-2")) {
    return "vendor-charts";
  }

  if (id.includes("firebase")) {
    return "vendor-firebase";
  }

  if (id.includes("bootstrap") || id.includes("react-bootstrap")) {
    return "vendor-bootstrap";
  }

  if (id.includes("react-icons")) {
    return "vendor-icons";
  }

  if (id.includes("@reduxjs") || id.includes("react-redux")) {
    return "vendor-state";
  }

  if (id.includes("axios")) {
    return "vendor-http";
  }

  if (id.includes("moment")) {
    return "vendor-date";
  }

  if (id.includes("xlsx")) {
    return "vendor-xlsx";
  }

  return "vendor";
};

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
      },
      output: {
        manualChunks: getVendorChunk,
      },
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    historyApiFallback: true,
  },
});

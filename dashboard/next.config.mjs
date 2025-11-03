/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Ensure Turbopack uses the dashboard folder as the workspace root.
  // This prevents Next from inferring the repository root when a top-level
  // lockfile exists and stops missing runtime chunk emission.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(__dirname, ".vercel", "output", "static");
const distDir = path.join(__dirname, "dist");

if (fs.existsSync(staticDir)) {
  fs.cpSync(staticDir, distDir, { recursive: true, force: true });
  console.log(`[copy-dist] Successfully copied static prerendered files from ${staticDir} to ${distDir}`);
} else {
  console.warn(`[copy-dist] Warning: ${staticDir} not found.`);
}

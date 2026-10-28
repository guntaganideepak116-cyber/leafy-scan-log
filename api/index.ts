import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../backend/src/server.js";

// Disable automatic body parsing so Multer can stream image uploads directly
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}

import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

// If SUPABASE_SERVICE_ROLE_KEY was mistakenly assigned the publishable key, fallback to SUPABASE_SECRET_KEY
if (process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("sb_publishable_") && process.env.SUPABASE_SECRET_KEY) {
  serviceKey = process.env.SUPABASE_SECRET_KEY;
}

if (!SUPABASE_URL || !serviceKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) must be configured.");
}

export const supabase = createClient(SUPABASE_URL, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

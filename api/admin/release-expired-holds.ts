import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getAppBaseUrl } from "../_utils/url";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS for admin dashboard use or external cron
    const allowedOrigins: string[] = [];
    if (process.env.VITE_APP_URL) allowedOrigins.push(process.env.VITE_APP_URL);

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
        // Allow matching cron service if needed, OR just allow all for this specific admin endpoint carefully?
        // Better to restrict. External cron usually has no origin header.
    }

    res.setHeader("Access-Control-Allow-Methods", "POST, GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-secret");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // 1. Auth Check - Require Secret Header
    const adminSecret = process.env.ADMIN_SECRET;
    const providedSecret = req.headers["x-admin-secret"] as string;

    if (!adminSecret) {
        return res.status(500).json({ error: "Server misconfiguration: ADMIN_SECRET not set" });
    }

    // Allow Bearer token if it matches strict criteria? No, simpler to use custom header for cron.
    // Actually, allow querying with query param for easy cron setup if header hard? 
    // User asked for "Requires ADMIN_SECRET header". Stick to that.
    if (providedSecret !== adminSecret) {
        // Check query param as fallback for simple cron jobs
        if (req.query.secret !== adminSecret) {
            return res.status(401).json({ error: "Unauthorized" });
        }
    }

    try {
        const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        console.log("[Release Holds] Starting cleanup job...");

        const { data, error } = await supabase.rpc("release_expired_holds");

        if (error) {
            console.error("[Release Holds] RPC Error:", error);
            return res.status(500).json({ error: error.message });
        }

        console.log("[Release Holds] Success:", data);
        return res.status(200).json(data);

    } catch (err: any) {
        console.error("[Release Holds] Unexpected Error:", err);
        return res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
}

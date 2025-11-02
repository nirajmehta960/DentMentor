import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("[mark-read] Request received");

    if (req.method !== "POST") {
        console.log("[mark-read] Method not allowed:", req.method);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { sessionId } = req.body;
        console.log("[mark-read] Session ID:", sessionId);

        if (!sessionId) {
            return res.status(400).json({ error: "Missing session ID" });
        }

        // Check Auth
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("[mark-read] No auth header");
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Initialize user-scoped client
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        console.log("[mark-read] Supabase Config Check:", {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
            urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 10) : 'N/A'
        });

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error("Missing Supabase configuration");
        }

        const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: { Authorization: authHeader }
            },
            auth: { persistSession: false }
        });

        // Get User ID (for reliable `recipient_id` check)
        const { data: { user }, error: userError } = await userSupabase.auth.getUser();
        if (userError || !user) {
            console.error("[mark-read] Auth Error:", userError);
            return res.status(401).json({ error: "Unauthorized" });
        }

        console.log("[mark-read] User authenticated:", user.id);

        // Update messages
        const { data, error } = await userSupabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("session_id", sessionId)
            .eq("recipient_id", user.id)
            .is("read_at", null)
            .select();

        if (error) {
            console.error("[mark-read] Update Error:", error);
            return res.status(500).json({ error: "Failed to mark messages as read" });
        }

        const count = data?.length || 0;
        console.log("[mark-read] Update success. Count:", count);
        return res.status(200).json({ success: true, count });

    } catch (err: any) {
        console.error("[mark-read] Internal Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

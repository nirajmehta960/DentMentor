import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: "Missing session ID" });
        }

        // Check Auth
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Initialize user-scoped client
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Update messages
        const { error } = await userSupabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("session_id", sessionId)
            .eq("recipient_id", user.id)
            .is("read_at", null);

        if (error) {
            console.error("Update Error:", error);
            return res.status(500).json({ error: "Failed to mark messages as read" });
        }

        return res.status(200).json({ success: true });

    } catch (err: any) {
        console.error("API Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

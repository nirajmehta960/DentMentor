import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { sessionId, text } = req.body;

        // 1. Validation
        if (!sessionId) {
            return res.status(400).json({ error: "Missing session ID" });
        }

        if (!text || typeof text !== "string") {
            return res.status(400).json({ error: "Message text is required" });
        }

        const trimmedText = text.trim();
        if (trimmedText.length === 0 || trimmedText.length > 2000) {
            return res.status(400).json({ error: "Message must be between 1 and 2000 characters" });
        }

        // 2. Auth Check (Server-side)
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Missing Supabase Admin credentials");
            return res.status(500).json({ error: "Server Configuration Error" });
        }

        const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Get the JWT from the request Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await adminSupabase.auth.getUser(token);

        if (userError || !user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 3. Call RPC as User
        // We need a client scoped to the user to satisfy `auth.uid()` in the RPC/RLS.
        const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseAnonKey) {
            console.error("Missing Supabase Anon/Publishable Key");
            return res.status(500).json({ error: "Server Configuration Error" });
        }

        // User-scoped client
        const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: authHeader // Pass the JWT
                }
            },
            auth: {
                persistSession: false
            }
        });

        const { data, error } = await userSupabase.rpc("send_session_message", {
            p_session_id: sessionId,
            p_text: trimmedText
        });

        if (error) {
            console.error("RPC Error:", error);
            // Don't leak DB errors, map them
            if (error.message.includes("SESSION_NOT_FOUND")) return res.status(404).json({ error: "Session not found" });
            if (error.message.includes("SESSION_NOT_PAID")) return res.status(403).json({ error: "Session not paid" });
            if (error.message.includes("NOT_A_PARTICIPANT")) return res.status(403).json({ error: "Not a participant" });

            return res.status(500).json({ error: error.message || "Failed to send message" });
        }

        return res.status(200).json(data);

    } catch (err: any) {
        console.error("API Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

/**
 * Computes the base URL for the application based on environment variables.
 * 
 * Rules:
 * 1. If VITE_APP_URL is set, use it (trim trailing slash).
 * 2. Else if APP_URL is set, use it (trim trailing slash).
 * 3. Else if VERCEL_URL is set:
 *    - if starts with http, use as is.
 *    - else, prepend https://.
 * 4. Fallback:
 *    - defaults to "http://localhost:8080" (Frontend Dev Port) for local dev.
 */
export function getAppBaseUrl(): string {
    // 1. VITE_APP_URL
    if (process.env.VITE_APP_URL) {
        return process.env.VITE_APP_URL.replace(/\/$/, "");
    }

    // 2. APP_URL
    if (process.env.APP_URL) {
        return process.env.APP_URL.replace(/\/$/, "");
    }

    // 3. VERCEL_URL
    if (process.env.VERCEL_URL) {
        const url = process.env.VERCEL_URL;
        if (url.startsWith("http")) {
            return url.replace(/\/$/, "");
        }
        return `https://${url}`.replace(/\/$/, "");
    }

    // 4. Fallback (Local Frontend)
    return "http://localhost:8080";
}

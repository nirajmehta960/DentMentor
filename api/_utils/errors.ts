import type { VercelRequest, VercelResponse } from "@vercel/node";
import { v4 as uuidv4 } from "uuid";

/**
 * Standard Application Error
 */
export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly isRetryable: boolean;
    public readonly details?: any;

    constructor(
        code: string,
        message: string,
        statusCode: number = 500,
        isRetryable: boolean = false,
        details?: any
    ) {
        super(message);
        this.name = "AppError";
        this.code = code;
        this.statusCode = statusCode;
        this.isRetryable = isRetryable;
        this.details = details;
    }
}

/**
 * Generates a consistent error response structure
 */
export const toErrorResponse = (error: any, requestId: string) => {
    // Default to handling unknown errors
    const response = {
        ok: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
            requestId,
            details: undefined as any
        }
    };

    let statusCode = 500;

    if (error instanceof AppError) {
        response.error.code = error.code;
        response.error.message = error.message;
        response.error.details = error.details;
        statusCode = error.statusCode;
    } else if (error instanceof Error) {
        // Handle generic JS errors safely
        response.error.message = error.message;

        // Handle Stripe Errors specifically if reachable
        if ((error as any).type?.startsWith('Stripe')) {
            response.error.code = (error as any).code || 'STRIPE_ERROR';
            statusCode = (error as any).statusCode || 500;
        }
    }

    return { response, statusCode };
};

/**
 * Extract or generate Request ID
 */
export const withRequestId = (req: VercelRequest): string => {
    const existingId = req.headers['x-request-id'];
    if (Array.isArray(existingId)) return existingId[0];
    if (existingId) return existingId;
    return uuidv4();
};

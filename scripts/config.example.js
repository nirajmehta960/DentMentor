/**
 * Configuration example for background processor
 * Copy this to config.js and update with your actual values
 */

module.exports = {
    // Supabase Configuration
    supabase: {
        url: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
        serviceKey: process.env.SUPABASE_SERVICE_KEY || 'your-service-role-key'
    },

    // Email Configuration (SMTP)
    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password',
        from: process.env.SMTP_USER || 'your-email@gmail.com'
    },

    // Webhook Configuration
    webhooks: {
        baseUrl: process.env.WEBHOOK_BASE_URL || 'https://api.your-app.com/webhooks',
        secret: process.env.WEBHOOK_SECRET || 'your-webhook-secret',
        timeout: 10000 // 10 seconds
    },

    // Processing Configuration
    processing: {
        interval: parseInt(process.env.PROCESSING_INTERVAL) || 30000, // 30 seconds
        maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS) || 5,
        maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS) || 3,
        retryDelay: 5 * 60 * 1000 // 5 minutes
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined'
    }
};

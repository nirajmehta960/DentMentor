#!/usr/bin/env node

/**
 * Background processor for post-booking actions
 * This script processes pending booking events asynchronously
 */

const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Initialize email transporter
const emailTransporter = nodemailer.createTransporter({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

class BackgroundProcessor {
    constructor() {
        this.isRunning = false;
        this.processInterval = 30000; // 30 seconds
        this.maxConcurrentJobs = 5;
    }

    async start() {
        console.log('🚀 Starting background processor...');
        this.isRunning = true;
        
        // Process immediately on start
        await this.processPendingEvents();
        
        // Set up interval for continuous processing
        setInterval(async () => {
            if (this.isRunning) {
                await this.processPendingEvents();
            }
        }, this.processInterval);
        
        console.log(`✅ Background processor started (checking every ${this.processInterval/1000}s)`);
    }

    stop() {
        console.log('🛑 Stopping background processor...');
        this.isRunning = false;
    }

    async processPendingEvents() {
        try {
            // Get pending events
            const { data: events, error } = await supabase
                .from('booking_events')
                .select('*')
                .eq('status', 'pending')
                .lte('scheduled_at', new Date().toISOString())
                .lt('retry_count', supabase.raw('max_retries'))
                .order('created_at', { ascending: true })
                .limit(this.maxConcurrentJobs);

            if (error) {
                console.error('❌ Error fetching pending events:', error);
                return;
            }

            if (!events || events.length === 0) {
                console.log('📭 No pending events to process');
                return;
            }

            console.log(`🔄 Processing ${events.length} pending events...`);

            // Process events concurrently
            const promises = events.map(event => this.processEvent(event));
            await Promise.allSettled(promises);

        } catch (error) {
            console.error('❌ Error in processPendingEvents:', error);
        }
    }

    async processEvent(event) {
        try {
            console.log(`📋 Processing event ${event.id} (${event.event_type})`);
            
            // Mark as processing
            await supabase
                .from('booking_events')
                .update({ status: 'processing' })
                .eq('id', event.id);

            // Process based on event type
            switch (event.event_type) {
                case 'activity_logged':
                    await this.processActivityLogging(event);
                    break;
                case 'notification_sent':
                    await this.processNotifications(event);
                    break;
                case 'earnings_created':
                    await this.processEarningsCreation(event);
                    break;
                case 'webhook_triggered':
                    await this.processWebhookEvents(event);
                    break;
                case 'calendar_invite_sent':
                    await this.processCalendarInvites(event);
                    break;
                default:
                    throw new Error(`Unknown event type: ${event.event_type}`);
            }

            // Mark as completed
            await supabase
                .from('booking_events')
                .update({ 
                    status: 'completed',
                    processed_at: new Date().toISOString()
                })
                .eq('id', event.id);

            console.log(`✅ Completed event ${event.id} (${event.event_type})`);

        } catch (error) {
            console.error(`❌ Error processing event ${event.id}:`, error);
            
            // Mark as failed and increment retry count
            const retryCount = event.retry_count + 1;
            const nextRetryAt = new Date(Date.now() + (5 * 60 * 1000 * retryCount)); // Exponential backoff
            
            await supabase
                .from('booking_events')
                .update({ 
                    status: retryCount >= event.max_retries ? 'failed' : 'pending',
                    error_message: error.message,
                    retry_count: retryCount,
                    scheduled_at: nextRetryAt.toISOString()
                })
                .eq('id', event.id);
        }
    }

    async processActivityLogging(event) {
        // Activity logging is handled by the database function
        // This is just a placeholder for additional processing if needed
        console.log(`📝 Processing activity logging for session ${event.session_id}`);
    }

    async processNotifications(event) {
        const payload = event.payload;
        console.log(`📧 Processing notifications for session ${event.session_id}`);
        
        // Send email notifications
        if (SMTP_USER && SMTP_PASS) {
            await this.sendEmailNotification(payload);
        } else {
            console.log('⚠️ Email not configured, skipping email notifications');
        }
    }

    async sendEmailNotification(payload) {
        const mentorEmail = await this.getUserEmail(payload.mentor_id);
        const menteeEmail = await this.getUserEmail(payload.mentee_id);
        
        const sessionDate = new Date(payload.session_date);
        const formattedDate = sessionDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });

        // Send email to mentor
        if (mentorEmail) {
            await emailTransporter.sendMail({
                from: SMTP_USER,
                to: mentorEmail,
                subject: `New Session Booked - ${payload.service_title}`,
                html: `
                    <h2>New Session Booked</h2>
                    <p>Hello ${payload.mentor_name},</p>
                    <p>A new session has been booked with you:</p>
                    <ul>
                        <li><strong>Mentee:</strong> ${payload.mentee_name}</li>
                        <li><strong>Service:</strong> ${payload.service_title}</li>
                        <li><strong>Date & Time:</strong> ${formattedDate}</li>
                        <li><strong>Duration:</strong> ${payload.duration_minutes} minutes</li>
                        <li><strong>Price:</strong> $${payload.price_paid}</li>
                    </ul>
                    <p>Please prepare for your session and ensure you're available at the scheduled time.</p>
                    <p>Best regards,<br>DentMentor Team</p>
                `
            });
        }

        // Send email to mentee
        if (menteeEmail) {
            await emailTransporter.sendMail({
                from: SMTP_USER,
                to: menteeEmail,
                subject: `Session Confirmed - ${payload.service_title}`,
                html: `
                    <h2>Session Confirmed</h2>
                    <p>Hello ${payload.mentee_name},</p>
                    <p>Your session has been confirmed:</p>
                    <ul>
                        <li><strong>Mentor:</strong> ${payload.mentor_name}</li>
                        <li><strong>Service:</strong> ${payload.service_title}</li>
                        <li><strong>Date & Time:</strong> ${formattedDate}</li>
                        <li><strong>Duration:</strong> ${payload.duration_minutes} minutes</li>
                        <li><strong>Price:</strong> $${payload.price_paid}</li>
                    </ul>
                    <p>We'll send you a meeting link 24 hours before your session.</p>
                    <p>Best regards,<br>DentMentor Team</p>
                `
            });
        }
    }

    async getUserEmail(userId) {
        // This would need to be implemented based on your auth system
        // For now, return a placeholder
        return `${userId}@example.com`;
    }

    async processEarningsCreation(event) {
        // Earnings creation is handled by the database function
        console.log(`💰 Processing earnings creation for session ${event.session_id}`);
    }

    async processWebhookEvents(event) {
        const payload = event.payload;
        console.log(`🔗 Processing webhook for session ${event.session_id}`);
        
        // Send webhook to external service
        const webhookUrl = 'https://api.your-app.com/webhooks/booking-created';
        
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': 'your-signature' // Add signature for security
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
            }

            console.log(`✅ Webhook sent successfully for session ${event.session_id}`);

        } catch (error) {
            console.error(`❌ Webhook failed for session ${event.session_id}:`, error);
            throw error;
        }
    }

    async processCalendarInvites(event) {
        const payload = event.payload;
        console.log(`📅 Processing calendar invites for session ${event.session_id}`);
        
        // This would integrate with Google Calendar, Outlook, etc.
        // For now, just log the action
        console.log(`Calendar invites should be sent for session on ${payload.session_date}`);
    }

    async getStats() {
        const { data: stats } = await supabase
            .from('booking_events')
            .select('status')
            .then(result => {
                const counts = result.data.reduce((acc, event) => {
                    acc[event.status] = (acc[event.status] || 0) + 1;
                    return acc;
                }, {});
                return { data: counts };
            });

        return stats;
    }
}

// Main execution
async function main() {
    const processor = new BackgroundProcessor();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        processor.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        processor.stop();
        process.exit(0);
    });

    // Start processing
    await processor.start();
    
    // Log stats every 5 minutes
    setInterval(async () => {
        const stats = await processor.getStats();
        console.log('📊 Event processing stats:', stats);
    }, 5 * 60 * 1000);
}

// Run if this file is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = BackgroundProcessor;

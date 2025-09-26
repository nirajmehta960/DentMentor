import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface BookingRequest {
  mentor_id: string;
  service_id: string;
  date: string; // YYYY-MM-DD
  start_time_local: string; // HH:mm
  timezone: string; // IANA timezone string (e.g., "America/New_York")
  idempotency_key?: string;
}

interface BookingResponse {
  ok: boolean;
  session?: {
    id: string;
    mentor_id: string;
    mentee_id: string;
    session_date: string;
    duration_minutes: number;
    status: string;
    payment_status: string;
    price_paid: number | null;
  };
  error?: string;
  code?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Enforce auth: require user from supabase auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Authorization header required',
          code: 'UNAUTHORIZED'
        } as BookingResponse),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the JWT token and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Invalid authentication token',
          code: 'UNAUTHORIZED'
        } as BookingResponse),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const requestBody: BookingRequest = await req.json()
    const { 
      mentor_id, 
      service_id, 
      date,
      start_time_local,
      timezone,
      idempotency_key
    } = requestBody

    // Validate input types/required fields
    if (!mentor_id || !service_id || !date || !start_time_local || !timezone) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Missing required fields: mentor_id, service_id, date, start_time_local, timezone',
          code: 'INVALID_REQUEST'
        } as BookingResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(mentor_id) || !uuidRegex.test(service_id)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Invalid UUID format for mentor_id or service_id',
          code: 'INVALID_REQUEST'
        } as BookingResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Invalid date format. Expected YYYY-MM-DD',
          code: 'INVALID_REQUEST'
        } as BookingResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(start_time_local)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Invalid time format. Expected HH:mm',
          code: 'INVALID_REQUEST'
        } as BookingResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Call RPC: instant_book_atomic
    // The RPC handles idempotency, timezone conversion, slot validation, and atomic booking
    console.log('Calling instant_book_atomic RPC with:', {
      mentor_id,
      service_id,
      mentee_user_id: user.id,
      date,
      start_time_local,
      timezone,
      idempotency_key: idempotency_key || null
    });
    
    const { data: rpcResult, error: rpcError } = await supabase.rpc('instant_book_atomic', {
      p_mentor_id: mentor_id,
      p_service_id: service_id,
      p_mentee_user_id: user.id,
      p_date: date,
      p_start_time_local: start_time_local,
      p_timezone: timezone,
      p_idempotency_key: idempotency_key || null
    });
    
    console.log('RPC Response:', { rpcResult, rpcError });

    // Handle RPC errors
    if (rpcError) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: rpcError.message || 'Failed to process booking',
          code: 'BOOKING_FAILED'
        } as BookingResponse),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // RPC returns array format: [{status: 'ok', session_id: uuid}] or [{status: 'error', error_code: string, error_message: string}]
    if (!rpcResult || !Array.isArray(rpcResult) || rpcResult.length === 0) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'No response from booking service',
          code: 'BOOKING_FAILED'
        } as BookingResponse),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = rpcResult[0]

    // Handle RPC errors with proper HTTP status codes
    if (result.status === 'error' && result.error_code) {
      let statusCode = 500
      let errorMessage = result.error_message || 'Booking failed'

      switch (result.error_code) {
        case 'SLOT_UNAVAILABLE':
          statusCode = 409
          errorMessage = 'Slot already booked'
          break
        case 'NO_AVAILABILITY':
          statusCode = 404
          errorMessage = result.error_message || 'No availability found'
          break
        case 'SERVICE_NOT_FOUND':
        case 'MENTEE_PROFILE_NOT_FOUND':
          statusCode = 400
          break
        case 'INVALID_TIMESTAMP':
          statusCode = 400
          break
        default:
          statusCode = 500
      }

      return new Response(
        JSON.stringify({
          ok: false,
          error: errorMessage,
          code: result.error_code
        } as BookingResponse),
        { 
          status: statusCode, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // On success: fetch the session row from sessions table by returned session_id
    if (result.status === 'ok' && result.session_id) {
      console.log('Booking successful, fetching session:', result.session_id);
      
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('id, mentor_id, mentee_id, session_date, duration_minutes, status, payment_status, price_paid')
        .eq('id', result.session_id)
        .single()

      console.log('Fetched session:', { session, sessionError });

      if (sessionError || !session) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: 'Booking created but failed to retrieve session details',
            code: 'BOOKING_PARTIAL_SUCCESS'
          } as BookingResponse),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Return success response
      return new Response(
        JSON.stringify({
          ok: true,
          session: {
            id: session.id,
            mentor_id: session.mentor_id,
            mentee_id: session.mentee_id,
            session_date: session.session_date,
            duration_minutes: session.duration_minutes,
            status: session.status,
            payment_status: session.payment_status || 'pending',
            price_paid: session.price_paid
          }
        } as BookingResponse),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Unexpected response format
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Unexpected response format from booking service',
        code: 'UNKNOWN_ERROR'
      } as BookingResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      } as BookingResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

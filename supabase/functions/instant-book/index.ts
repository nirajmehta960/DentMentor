import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingRequest {
  mentor_id: string;
  service_id: string;
  session_start_utc: string;
  duration_minutes: number;
  idempotency_key?: string;
  metadata?: Record<string, any>;
}

interface BookingResponse {
  success: boolean;
  session?: {
    id: string;
    session_date: string;
    status: string;
    payment_status: string;
    mentor_name: string;
    service_title: string;
    price: number;
    duration_minutes: number;
  };
  error?: string;
  code?: string;
  alternatives?: {
    dates: string[];
    times: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
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
          success: false,
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
      session_start_utc, 
      duration_minutes, 
      idempotency_key,
      metadata = {} 
    } = requestBody

    // Validate required fields
    if (!mentor_id || !service_id || !session_start_utc || !duration_minutes) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: mentor_id, service_id, session_start_utc, duration_minutes',
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
          success: false,
          error: 'Invalid UUID format for mentor_id or service_id',
          code: 'INVALID_REQUEST'
        } as BookingResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate and normalize session_start_utc
    const sessionStartDate = new Date(session_start_utc)
    if (isNaN(sessionStartDate.getTime())) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid session_start_utc format. Expected ISO 8601 timestamptz',
          code: 'INVALID_REQUEST'
        } as BookingResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if booking is in the past
    if (sessionStartDate <= new Date()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Cannot book sessions in the past',
          code: 'INVALID_REQUEST'
        } as BookingResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle idempotency
    let reservationId: string | null = null
    if (idempotency_key) {
      // Check for existing reservation
      const { data: existingReservation, error: reservationError } = await supabase
        .from('booking_reservations')
        .select('*')
        .eq('idempotency_key', idempotency_key)
        .eq('mentee_user_id', user.id)
        .single()

      if (existingReservation && !reservationError) {
        if (existingReservation.status === 'confirmed' && existingReservation.session_id) {
          // Return existing confirmed booking
          const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .select(`
              id, session_date, status, payment_status,
              mentor_profiles!inner(professional_headline),
              mentor_services!inner(service_title, price, duration_minutes)
            `)
            .eq('id', existingReservation.session_id)
            .single()

          if (session && !sessionError) {
            return new Response(
              JSON.stringify({
                success: true,
                session: {
                  id: session.id,
                  session_date: session.session_date,
                  status: session.status,
                  payment_status: session.payment_status || 'pending',
                  mentor_name: session.mentor_profiles?.professional_headline || 'Mentor',
                  service_title: session.mentor_services?.service_title || 'Service',
                  price: session.mentor_services?.price || 0,
                  duration_minutes: session.mentor_services?.duration_minutes || 60
                }
              } as BookingResponse),
              { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        } else if (existingReservation.status === 'pending') {
          reservationId = existingReservation.id
        }
      } else {
        // Create new reservation for idempotency
        const { data: newReservation, error: createError } = await supabase
          .from('booking_reservations')
          .insert({
            mentee_user_id: user.id,
            mentor_id,
            service_id,
            session_start_utc: sessionStartDate.toISOString(),
            duration_minutes,
            idempotency_key,
            metadata,
            status: 'pending'
          })
          .select('id')
          .single()

        if (newReservation && !createError) {
          reservationId = newReservation.id
        }
      }
    }

    // Call the atomic booking RPC
    const { data: rpcResult, error: rpcError } = await supabase.rpc('instant_book_atomic', {
      p_mentee_user_id: user.id,
      p_mentor_id: mentor_id,
      p_service_id: service_id,
      p_session_start_utc: sessionStartDate.toISOString(),
      p_duration_minutes: duration_minutes,
      p_reservation_id: reservationId,
      p_metadata: metadata
    })

    if (rpcError || !rpcResult || rpcResult.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to process booking',
          code: 'BOOKING_FAILED'
        } as BookingResponse),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = rpcResult[0]

    if (result.error_code) {
      // Handle specific error cases
      let statusCode = 400
      let alternatives: { dates: string[]; times: string[] } | undefined


      switch (result.error_code) {
        case 'TIME_CONFLICT':
        case 'SLOT_UNAVAILABLE':
          statusCode = 409
          // Generate alternatives for time conflicts
          alternatives = await generateAlternatives(supabase, mentor_id, sessionStartDate.toISOString().split('T')[0])
          break
        case 'MENTEE_NOT_FOUND':
          statusCode = 404
          break
        case 'MENTOR_NOT_FOUND':
        case 'MENTOR_INACTIVE':
        case 'MENTOR_UNVERIFIED':
          statusCode = 404
          break
        case 'SERVICE_NOT_FOUND':
          statusCode = 404
          break
        case 'NO_AVAILABILITY':
          statusCode = 404
          alternatives = await generateAlternatives(supabase, mentor_id, sessionStartDate.toISOString().split('T')[0])
          break
        case 'VALIDATION_ERROR':
          statusCode = 400
          break
        case 'INTERNAL_ERROR':
          statusCode = 500
          break
        default:
          statusCode = 400
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: result.error_message,
          code: result.error_code,
          alternatives
        } as BookingResponse),
        { 
          status: statusCode, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Success - get session details for response
    const { data: sessionDetails, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id, session_date, status, payment_status,
        mentor_profiles!inner(professional_headline),
        mentor_services!inner(service_title, price, duration_minutes)
      `)
      .eq('id', result.session_id)
      .single()

    if (sessionError || !sessionDetails) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Booking created but failed to retrieve session details',
          code: 'BOOKING_PARTIAL_SUCCESS'
        } as BookingResponse),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log activity for mentor
    await supabase
      .from('activity_log')
      .insert({
        mentor_id,
        activity_type: 'session_booked',
        title: 'New Session Booked',
        description: `A new session has been booked for ${sessionDetails.session_date}`,
        metadata: {
          session_id: result.session_id,
          mentee_user_id: user.id,
          service_id,
          duration_minutes
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          id: sessionDetails.id,
          session_date: sessionDetails.session_date,
          status: sessionDetails.status,
          payment_status: sessionDetails.payment_status || 'pending',
          mentor_name: sessionDetails.mentor_profiles?.professional_headline || 'Mentor',
          service_title: sessionDetails.mentor_services?.service_title || 'Service',
          price: sessionDetails.mentor_services?.price || 0,
          duration_minutes: sessionDetails.mentor_services?.duration_minutes || 60
        }
      } as BookingResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      } as BookingResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper function to generate alternative booking times
async function generateAlternatives(supabase: any, mentorId: string, requestedDate: string): Promise<{ dates: string[]; times: string[] }> {
  try {
    // Get availability for the next 7 days
    const startDate = new Date(requestedDate)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 7)

    const { data: availability, error } = await supabase
      .from('mentor_availability')
      .select('date, time_slots')
      .eq('mentor_id', mentorId)
      .eq('is_available', true)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date')

    if (error || !availability) {
      return { dates: [], times: [] }
    }

    const alternativeDates: string[] = []
    const alternativeTimes: string[] = []

    availability.forEach((avail: any) => {
      if (avail.time_slots && Array.isArray(avail.time_slots)) {
        alternativeDates.push(avail.date)
        
        // Collect available times for the requested date
        if (avail.date === requestedDate) {
          avail.time_slots.forEach((slot: any) => {
            if (slot.is_available && slot.start_time) {
              alternativeTimes.push(slot.start_time)
            }
          })
        }
      }
    })

    return {
      dates: [...new Set(alternativeDates)].slice(0, 5),
      times: [...new Set(alternativeTimes)].slice(0, 8)
    }
  } catch (error) {
    return { dates: [], times: [] }
  }
}

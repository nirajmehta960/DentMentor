import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Calendar, Clock } from "lucide-react";

export default function BookingSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get("session_id");
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<"pending" | "confirmed" | "error">("pending");
    const [sessionDetails, setSessionDetails] = useState<any>(null);

    const reservationId = searchParams.get("reservation_id");

    useEffect(() => {
        if (!reservationId) {
            // Fallback to session_id (stripe) if strictly needed, but reservation_id is safer
            if (!sessionId) {
                setStatus("error");
                setIsLoading(false);
                return;
            }
        }

        let attempts = 0;
        const maxAttempts = 30; // 60s timeout

        const checkStatus = async () => {
            try {
                // If we have reservationId, use it. Otherwise use sessionId
                let query = supabase.from("booking_reservations").select("*");

                if (reservationId) {
                    query = query.eq("id", reservationId);
                } else {
                    query = query.eq("stripe_checkout_session_id", sessionId);
                }

                const { data: reservation, error } = await query.maybeSingle();

                if (error) {
                    console.error("Polling fetch error:", error);
                    return false;
                }

                if (!reservation) {
                    console.log("Reservation not found yet...");
                    return false;
                }

                console.log("Polling Status:", reservation.status);

                if (reservation.status === "confirmed" && reservation.session_id) {
                    setStatus("confirmed");

                    // Fetch additional details
                    const { data: serviceData } = await supabase
                        .from("mentor_services")
                        .select("service_title")
                        .eq("id", reservation.service_id)
                        .single();

                    const { data: mentorProfile } = await supabase
                        .from("mentor_profiles")
                        .select("user_id")
                        .eq("id", reservation.mentor_id)
                        .single();

                    let mentorName = "Mentor";
                    if (mentorProfile) {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("first_name, last_name")
                            .eq("user_id", mentorProfile.user_id)
                            .single();

                        if (profile) {
                            mentorName = `${profile.first_name} ${profile.last_name}`;
                        }
                    }

                    setSessionDetails({
                        mentorName,
                        serviceTitle: serviceData?.service_title || "Mentorship Session",
                        date: reservation.session_start_utc,
                        duration: reservation.duration_minutes
                    });
                    setIsLoading(false);
                    return true;
                }

                // If paid but not confirmed (webhook race), keep waiting
                if (reservation.status === "paid") {
                    return false;
                }

                // If failed
                if (reservation.status === "expired" || reservation.status === "cancelled") {
                    setStatus("error");
                    setIsLoading(false);
                    return true;
                }

                return false;
            } catch (err) {
                console.error("Polling exception:", err);
                return false;
            }
        };

        const poll = async () => {
            const success = await checkStatus();
            if (success) return;

            if (attempts >= maxAttempts) {
                console.error("Polling timeout");
                setStatus("error");
                setIsLoading(false);
                return;
            }

            attempts++;
            setTimeout(poll, 2000);
        };

        poll();

        return () => { attempts = maxAttempts; };
    }, [sessionId, reservationId]);

    const goToDashboard = () => {
        navigate("/mentee-dashboard?tab=sessions");
    };

    if (isLoading || status === "pending") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Confirming your payment...</h2>
                <p className="text-gray-500 mt-2">Please wait while we secure your booking.</p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                <p className="text-gray-600 max-w-md mb-8">
                    We couldn't confirm your booking automatically. If you were charged, please contact support.
                </p>
                <Button onClick={() => navigate("/mentors")}>Return to Browse</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 max-w-md mb-8 text-lg">
                Your session has been successfully scheduled. We've sent a confirmation email with all the details.
            </p>

            {sessionDetails && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-sm w-full text-left">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Session Details</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="w-5 h-5 flex items-center justify-center text-primary font-bold">M</span>
                            <span className="text-gray-700 font-medium">
                                {sessionDetails.mentorName}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-5 h-5 flex items-center justify-center text-primary font-bold">S</span>
                            <span className="text-gray-700">
                                {sessionDetails.serviceTitle}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-primary" />
                            <span className="text-gray-700">
                                {new Date(sessionDetails.date).toLocaleDateString(undefined, {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-primary" />
                            <span className="text-gray-700">
                                {new Date(sessionDetails.date).toLocaleTimeString(undefined, {
                                    hour: 'numeric', minute: '2-digit'
                                })} ({sessionDetails.duration} mins)
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate("/mentors")}>
                    Book Another
                </Button>
                <Button onClick={goToDashboard}>
                    Go to Dashboard
                </Button>
            </div>
        </div>
    );
}

import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Link2, Loader2, Mail, MessageSquare, MessagesSquare, RefreshCcw } from "lucide-react";
import { SiteShell } from "@/components/site";
import { DetailList, NextSteps, ResultBand, ResultPanel } from "@/components/booking/ResultPanel";


export default function BookingSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get("session_id");
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<"pending" | "confirmed" | "error">("pending");
    const [sessionDetails, setSessionDetails] = useState<any>(null);

    const reservationId = searchParams.get("reservation_id");

    useEffect(() => {
        console.log("BookingSuccess Mounted. Params:", { sessionId, reservationId });

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
                    query = query.eq("id", reservationId as any);
                } else {
                    query = query.eq("stripe_checkout_session_id", sessionId as any);
                }

                const { data: reservation, error } = await query.maybeSingle() as any;

                if (error) {
                    console.error("Polling fetch error:", error);
                    return false;
                }

                if (!reservation) {
                    console.log("Reservation not found yet...");
                    return false;
                }

                console.log("Polling Status:", reservation.status, "SessionID linked:", reservation.session_id);

                // If confirmed, we are good. RPC ensures session_id is set, but we can be lenient if status is confirmed.
                if (reservation.status === "confirmed") {
                    setStatus("confirmed");

                    // Fetch additional details
                    const { data: serviceData } = await supabase
                        .from("mentor_services")
                        .select("service_title")
                        .eq("id", reservation.service_id)
                        .single() as any;

                    const { data: mentorProfile } = await supabase
                        .from("mentor_profiles")
                        .select("user_id")
                        .eq("id", reservation.mentor_id)
                        .single() as any;

                    let mentorName = "Mentor";
                    if (mentorProfile) {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("first_name, last_name")
                            .eq("user_id", mentorProfile.user_id)
                            .single() as any;

                        if (profile) {
                            mentorName = `${profile.first_name} ${profile.last_name}`;
                        }
                    }

                    setSessionDetails({
                        mentorName,
                        serviceTitle: serviceData?.service_title || "Mentorship Session",
                        date: reservation.session_start_utc,
                        duration: reservation.duration_minutes,
                        sessionId: reservation.session_id
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

    let content: ReactNode;

    if (isLoading || status === "pending") {
        content = (
            <ResultPanel
                icon={Loader2}
                spin
                title="Confirming your payment…"
                lead="Please wait while we secure your booking."
                footnote={<>Transaction ID: {sessionId ? sessionId.slice(-8) : 'Pending'}</>}
            />
        );
    } else if (status === "error") {
        content = (
            <ResultPanel
                icon={AlertCircle}
                tone="warn"
                title="Something went wrong"
                lead="We couldn't confirm your booking automatically. If you were charged, please contact support."
                actions={
                    <Button size="lg" onClick={() => navigate("/mentors")}>
                        Back to mentors
                    </Button>
                }
            />
        );
    } else {
        content = (
            <ResultPanel
                icon={Check}
                title="Booking confirmed"
                lead="Your session has been successfully scheduled. We've sent a confirmation email with all the details."
                actions={
                    <>
                        <Button size="lg" onClick={goToDashboard}>
                            Go to dashboard
                        </Button>
                        {sessionDetails?.sessionId && (
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => navigate(`/messages/session/${sessionDetails.sessionId}`)}
                            >
                                <MessageSquare aria-hidden="true" />
                                Message mentor
                            </Button>
                        )}
                        <Button size="lg" variant="ghost" onClick={() => navigate("/mentors")}>
                            Book another
                        </Button>
                    </>
                }
            >
                {sessionDetails && (
                    <DetailList
                        rows={[
                            { label: "Mentor", value: sessionDetails.mentorName },
                            { label: "Service", value: sessionDetails.serviceTitle },
                            {
                                label: "Date",
                                value: new Date(sessionDetails.date).toLocaleDateString(undefined, {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                }),
                            },
                            {
                                label: "Time",
                                value: (
                                    <>
                                        {new Date(sessionDetails.date).toLocaleTimeString(undefined, {
                                            hour: 'numeric', minute: '2-digit'
                                        })} ({sessionDetails.duration} mins)
                                    </>
                                ),
                            },
                        ]}
                    />
                )}

                <NextSteps
                    items={[
                        {
                            icon: Mail,
                            title: "Check your inbox",
                            body: "Your confirmation email has the session details and a calendar invite.",
                        },
                        {
                            icon: Link2,
                            title: "Meeting link",
                            body: "The meeting link is provided 24 hours before the session.",
                        },
                        {
                            icon: RefreshCcw,
                            title: "Need to move it?",
                            body: "You can reschedule up to 24 hours before the session.",
                        },
                        {
                            icon: MessagesSquare,
                            title: "Talk to your mentor",
                            body: "Each session has its own message thread with your mentor.",
                        },
                    ]}
                />
            </ResultPanel>
        );
    }

    return (
        <SiteShell nav="solid">
            <ResultBand>{content}</ResultBand>
        </SiteShell>
    );
}

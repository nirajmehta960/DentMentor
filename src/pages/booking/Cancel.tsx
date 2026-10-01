import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarX2 } from "lucide-react";
import { SiteShell } from "@/components/site";
import { ResultBand, ResultPanel } from "@/components/booking/ResultPanel";

export default function BookingCancel() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // We can use reservation_id to maybe show details or clear state if needed
    // const reservationId = searchParams.get("reservation_id");

    return (
        <SiteShell nav="solid">
            <ResultBand>
                <ResultPanel
                    icon={CalendarX2}
                    tone="muted"
                    title="Payment cancelled"
                    lead={
                        <>
                            <p>You haven't been charged. The booking process was cancelled or the payment failed.</p>
                            <p className="mt-3">
                                Nothing was booked. The time you picked stays held for a short while, then is
                                released automatically. You can pick another time now.
                            </p>
                        </>
                    }
                    actions={
                        <>
                            <Button size="lg" onClick={() => navigate("/mentors")}>
                                Back to mentors
                            </Button>
                            <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                                Return home
                            </Button>
                        </>
                    }
                />
            </ResultBand>
        </SiteShell>
    );
}

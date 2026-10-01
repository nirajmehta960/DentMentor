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
                                Nothing was booked. The hold on the time you picked is released automatically, so
                                you can choose it again or pick another.
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

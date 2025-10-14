import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function BookingCancel() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // We can use reservation_id to maybe show details or clear state if needed
    // const reservationId = searchParams.get("reservation_id");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
            <p className="text-gray-600 max-w-md mb-8 text-lg">
                You haven't been charged. The booking process was cancelled or the payment failed.
            </p>

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate("/")}>
                    Return Home
                </Button>
                <Button onClick={() => navigate("/mentors")}>
                    Try Booking Again
                </Button>
            </div>
        </div>
    );
}

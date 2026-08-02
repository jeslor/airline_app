import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { getStripe } from "@/lib/stripe";
import { getApiBaseUrl } from "@/lib/api";

const CONFIRMATION_POLL_INTERVAL_MS = 1500;
const CONFIRMATION_POLL_TIMEOUT_MS = 20000;

async function waitForBookingConfirmation(bookingReference: string) {
  const apiUrl = getApiBaseUrl();
  const deadline = Date.now() + CONFIRMATION_POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const response = await fetch(`${apiUrl}/bookings/${bookingReference}`);
    if (response.ok) {
      const { data } = await response.json();
      if (data.status === "CONFIRMED") return "CONFIRMED";
      if (data.status === "FAILED") return "FAILED";
    }
    await new Promise((resolve) =>
      setTimeout(resolve, CONFIRMATION_POLL_INTERVAL_MS),
    );
  }
  return "TIMEOUT";
}

function PaymentForm({
  bookingReference,
  onConfirmed,
  onFailed,
}: {
  bookingReference: string;
  onConfirmed: () => void;
  onFailed: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "Payment failed. Please try again.");
      setIsProcessing(false);
      return;
    }

    setStatusMessage("Payment received - confirming your booking...");
    const result = await waitForBookingConfirmation(bookingReference);

    if (result === "CONFIRMED") {
      onConfirmed();
      return;
    }

    setIsProcessing(false);
    if (result === "FAILED") {
      onFailed(
        "Your payment could not be confirmed. Please try again or contact support.",
      );
    } else {
      setStatusMessage(
        "Your payment is still being confirmed. You'll receive your e-ticket by email shortly.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && (
        <p className="text-red-600 text-sm">{errorMessage}</p>
      )}
      {statusMessage && (
        <p className="text-gray-600 text-sm">{statusMessage}</p>
      )}
      <Button
        disabled={!stripe || isProcessing}
        type="submit"
        className="h-11 bg-red-800 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-full w-full sm:w-auto cursor-pointer"
      >
        {isProcessing ? "Processing..." : "Pay & Confirm Booking"}
      </Button>
    </form>
  );
}

export function PaymentStep({
  clientSecret,
  bookingReference,
  onConfirmed,
  onFailed,
}: {
  clientSecret: string;
  bookingReference: string;
  onConfirmed: () => void;
  onFailed: (message: string) => void;
}) {
  return (
    <div className="bg-white py-12 px-8 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-6">Payment</h3>
      <Elements stripe={getStripe()} options={{ clientSecret }}>
        <PaymentForm
          bookingReference={bookingReference}
          onConfirmed={onConfirmed}
          onFailed={onFailed}
        />
      </Elements>
    </div>
  );
}

export default PaymentStep;

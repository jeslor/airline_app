// components/BookingBubble.tsx
import { useFlightContext } from "../providers/FlightProvider";

const BookingBubble = () => {
  const { bookingData } = useFlightContext();
  const { outgoingFlight, returnFlight } = bookingData || {};
  const totalCost =
    (bookingData?.outgoingFlight?.price || 0) + (returnFlight?.price || 0);

  // If no flights are selected, don't show the bubble
  if (!outgoingFlight && !returnFlight) {
    return null;
  }

  return (
    <div className="shadow-2xl p-4 bottom-6 rounded-[30px] bg-white w-full max-w-[800px] fixed  left-1/2 transform -translate-x-1/2 z-50 border border-gray-100 flex items-center justify-between gap-4">
      {/* Flight Details Section */}
      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
        {outgoingFlight && (
          <div className="flex items-center space-x-2">
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                {outgoingFlight.departureAirport} to{" "}
                {outgoingFlight.arrivalAirport}
              </p>
              <p className="text-xs text-gray-600">
                {outgoingFlight.date} - {outgoingFlight.airline}
              </p>
            </div>
          </div>
        )}

        {returnFlight && (
          <div className="flex items-center space-x-2">
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                {returnFlight.departureAirport} to {returnFlight.arrivalAirport}
              </p>
              <p className="text-xs text-gray-600">
                {returnFlight.date} - {returnFlight.airline}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Total Cost */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm text-gray-500">Total Price</p>
        <p className="text-xl font-bold text-red-700">
          €{totalCost.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default BookingBubble;

// Helper Icons (you'd typically import these from 'lucide-react' or a similar library)

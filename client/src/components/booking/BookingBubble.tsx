// components/BookingBubble.tsx
import { Icon } from "@iconify/react";
import { useFlightContext } from "../providers/FlightProvider";

const BookingBubble = () => {
  const { bookingData, handleContinueBooking, sections } = useFlightContext();
  const { outgoingFlight, returnFlight } = bookingData || {};
  const totalCost =
    (bookingData?.outgoingFlight?.price || 0) + (returnFlight?.price || 0);

  // If no flights are selected, don't show the bubble
  if (!outgoingFlight && !returnFlight) {
    return null;
  }

  return (
    <div className="shadow-4xl shadow-gray-800 py-4 px-4 md:px-8 bottom-6 rounded-[30px] bg-white w-full max-w-[900px] fixed  left-1/2 transform -translate-x-1/2 z-50 border border-gray-100 flex items-center justify-between gap-4">
      {/* Flight Details Section */}
      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
        {outgoingFlight && (
          <div className="flex flex-col items-start space-x-2">
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                {outgoingFlight.departureCity} to {outgoingFlight.arrivalCity}
              </p>
              <p className="text-xs text-gray-600">
                {outgoingFlight.departureDate} - {outgoingFlight.airline}
              </p>
            </div>
            {sections.returnFlights ? (
              <button
                onClick={() =>
                  handleContinueBooking({
                    outboundFlights: true,
                    returnFlights: false,
                    finalBooking: false,
                  })
                }
                className="text-[12px] text-rose-700 underline hover:text-rose-800 font-semibold cursor-pointer "
              >
                <Icon icon="mdi:airplane-takeoff" className="inline mr-1" />
                outgoing flight
              </button>
            ) : null}
          </div>
        )}

        {sections.returnFlights ? (
          <div className="flex items-center space-x-2">
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                {returnFlight.departureCity} to {returnFlight.arrivalCity}
              </p>
              <p className="text-xs text-gray-600">
                {returnFlight.departureDate} - {returnFlight.airline}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                handleContinueBooking({
                  outboundFlights: false,
                  returnFlights: true,
                  finalBooking: false,
                })
              }
              className="bg-red-800 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full w-fit sm:w-auto"
            >
              Next flight
            </button>
          </div>
        )}
      </div>

      {/* Total Cost */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm text-gray-500">Total Price</p>
        <p className="text-xl font-bold text-red-700">
          ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default BookingBubble;

// Helper Icons (you'd typically import these from 'lucide-react' or a similar library)

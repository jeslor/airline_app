// components/BookingBubble.tsx
import { Icon } from "@iconify/react";
import { useFlightContext } from "../providers/FlightProvider";

const BookingBubble = () => {
  const { bookingData, handleContinueBooking, sections } = useFlightContext();

  const selectedFlights: any[] = bookingData?.selectedFlights || [];
  const totalLegs = sections.totalLegs || 0;
  const pickedCount = selectedFlights.filter(Boolean).length;
  const totalCost = selectedFlights.reduce(
    (sum, flight) => sum + (flight?.price || 0),
    0,
  );

  if (pickedCount === 0) {
    return <div className="hidden"></div>;
  }

  return (
    <div className="shadow-2xl shadow-gray-800 py-4 px-4 md:px-8 bottom-6 rounded-[30px] bg-white w-full max-w-[900px] fixed  left-1/2 transform -translate-x-1/2 z-50 border border-gray-100 flex items-center justify-between gap-4">
      {/* Selected legs summary */}
      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-x-auto">
        {selectedFlights.map((flight, index) =>
          flight ? (
            <div key={index} className="flex flex-col items-start">
              <div className="text-sm">
                <p className="font-semibold text-gray-800">
                  {flight.departureCity} to {flight.arrivalCity}
                </p>
                <p className="text-xs text-gray-600">
                  {flight.departureDate} - {flight.flightNumber}
                </p>
              </div>
              <button
                onClick={() =>
                  handleContinueBooking({
                    currentLegIndex: index,
                    finalBooking: false,
                  })
                }
                className="text-[12px] text-rose-700 underline hover:text-rose-800 font-semibold cursor-pointer"
              >
                <Icon icon="eva:edit-outline" className="inline mr-1" />
                change flight {totalLegs > 1 ? index + 1 : ""}
              </button>
            </div>
          ) : null,
        )}
      </div>

      {/* Total Cost */}
      <div className="text-right flex-shrink-0">
        <p className="text-xl font-bold text-red-700">
          ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default BookingBubble;

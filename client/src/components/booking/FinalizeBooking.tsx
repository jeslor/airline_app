import { format } from "date-fns";
import { useFlightContext } from "../providers/FlightProvider";
import { motion } from "framer-motion";
import { PersonalDetailsForm } from "../forms/PersonalDetailsForm";
import Flights from "../BookingFlights/flights";
import { useEffect } from "react";
import { Icon } from "@iconify/react";

// A 2-leg selection whose second leg reverses the first is a round trip -
// label it Outgoing/Return, matching the e-ticket's labeling. Anything else
// (one-way, multi-city) is labeled by flight number.
function getLegLabel(flights: any[], index: number) {
  const isRoundTrip =
    flights.length === 2 &&
    flights[0] &&
    flights[1] &&
    flights[1].departureAirportCode === flights[0].arrivalAirportCode &&
    flights[1].arrivalAirportCode === flights[0].departureAirportCode;

  if (isRoundTrip) {
    return index === 0 ? "Outgoing flight" : "Return flight";
  }
  return `Flight ${index + 1}`;
}

const FinalizeBooking = () => {
  const { bookingData, handleContinueBooking } = useFlightContext();
  const selectedFlights: any[] = bookingData?.selectedFlights || [];
  // Computed here directly (rather than read from bookingData.totalPrice)
  // so it's always correct regardless of how the user arrived at this
  // screen - the server never trusts this value anyway, it's display-only.
  const totalPrice = selectedFlights.reduce(
    (sum, flight) => sum + (flight?.price || 0),
    0,
  );

  useEffect(() => {
    const finalizeBooking = document.getElementById("finalize-booking");
    if (finalizeBooking) {
      finalizeBooking.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  return (
    <motion.div
      id="finalize-booking"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="-mt-[200px] py-8 w-full"
    >
      <h2 className="text-2xl font-bold mb-4">Finalise Your Booking</h2>
      <p className="text-gray-600 mb-4">
        Please review your flight details and confirm your booking.
      </p>

      {selectedFlights.map((flight, index) => (
        <div className="py-6" key={index}>
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-2xl font-bold mb-4 text-gray-500">
              {getLegLabel(selectedFlights, index)}{" "}
              <span className="block md:inline leading-[1.2] text-[20px]  pb-2">
                <span className="text-[20px] ">
                  from {flight?.departureCity} to {flight?.arrivalCity}
                </span>
                <span className="text-[20px]">
                  {" "}
                  on{" "}
                  {flight?.departureDate
                    ? format(new Date(flight.departureDate), "MMMM dd, yyyy")
                    : "N/A"}
                </span>
              </span>
            </h3>
            <button
              type="button"
              onClick={() =>
                handleContinueBooking({
                  currentLegIndex: index,
                  finalBooking: false,
                })
              }
              className="text-sm text-rose-700 underline hover:text-rose-800 font-semibold cursor-pointer whitespace-nowrap mt-1"
            >
              <Icon icon="eva:edit-outline" className="inline mr-1" />
              Change flight
            </button>
          </div>
          <Flights flights={[flight]} legIndex={index} />
        </div>
      ))}

      <div className="flex justify-end pr-4">
        <p className="text-lg font-semibold mt-4">
          Total Price:{" "}
          <span className="text-red-600">
            $
            {totalPrice.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
      </div>

      <div className="py-6">
        <h3 className="text-2xl font-bold mb-4">Personal details</h3>
        <div className=" bg-white py-12 px-8 rounded-lg shadow-md">
          <PersonalDetailsForm />
        </div>
      </div>
    </motion.div>
  );
};

export default FinalizeBooking;

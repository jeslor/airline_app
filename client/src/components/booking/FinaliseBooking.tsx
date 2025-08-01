import { Flights } from "../Flights/Flights";
import { useFlightContext } from "../providers/FlightProvider";
import { motion } from "framer-motion";

const FinalizeBooking = () => {
  const { bookingData } = useFlightContext();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="-mt-[200px] py-8 w-full"
    >
      <h2 className="text-2xl font-bold mb-4">Finalize Your Booking</h2>
      <p className="text-gray-600 mb-4">
        Please review your flight details and confirm your booking.
      </p>

      <div className="py-6">
        <h3 className="text-[36px]">
          Outgoing flights{" "}
          <span className="block md:inline leading-[1.2] text-[20px] text-gray-500 pb-2">
            <span className="text-[20px] text-gray-500 ">
              from {bookingData?.outboundFlight[0]?.departureCity} to{" "}
              {bookingData?.outboundFlight[0]?.arrivalCity}
            </span>
            <span className="text-[20px] text-gray-500">
              {" "}
              on{" "}
              {bookingData?.outboundFlight[0]?.departureDate
                ? new Date(
                    bookingData.outboundFlight[0]?.departureDate
                  ).toLocaleDateString()
                : "N/A"}
            </span>
          </span>
        </h3>
        <Flights flights={[bookingData?.outboundFlight]} />
      </div>
      <div className="py-6">
        <h3 className="text-[36px]">
          Return flights
          <span className="block md:inline leading-[1.2] text-[20px] text-gray-500 pb-2">
            <span className="text-[20px] text-gray-500">
              {" "}
              from {bookingData?.returnFlight[0]?.departureCity} to{" "}
              {bookingData?.returnFlight[0]?.arrivalCity}
            </span>
            <span className="text-[20px] text-gray-500">
              {" "}
              on{" "}
              {bookingData?.returnFlight[0]?.departureDate
                ? new Date(
                    bookingData?.returnFlight[0].departureDate
                  ).toLocaleDateString()
                : "N/A"}
            </span>
          </span>
        </h3>
        <Flights flights={[bookingData?.returnFlight]} />
      </div>
    </motion.div>
  );
};

export default FinalizeBooking;

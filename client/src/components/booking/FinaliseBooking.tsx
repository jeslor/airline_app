import { Flights } from "../Flights/Flights";
import { format } from "date-fns";
import { useFlightContext } from "../providers/FlightProvider";
import { motion } from "framer-motion";
import { PersonalDetailsForm } from "./PersonalDetailsForm";

const FinalizeBooking = () => {
  const { bookingData } = useFlightContext();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="-mt-[200px] py-8 w-full"
    >
      <h2 className="text-2xl font-bold mb-4">Finalise Your Booking</h2>
      <p className="text-gray-600 mb-4">
        Please review your flight details and confirm your booking.
      </p>

      <div className="py-6">
        <h3 className="text-2xl font-bold mb-4 text-gray-500">
          Outgoing flights{" "}
          <span className="block md:inline leading-[1.2] text-[20px]  pb-2">
            <span className="text-[20px] ">
              from {bookingData?.outboundFlight?.departureCity} to{" "}
              {bookingData?.outboundFlight?.arrivalCity}
            </span>
            <span className="text-[20px]">
              {" "}
              on{" "}
              {bookingData?.outboundFlight?.departureDate
                ? format(
                    new Date(bookingData.outboundFlight?.departureDate),
                    "MMMM dd, yyyy"
                  )
                : "N/A"}
            </span>
          </span>
        </h3>
        <Flights flights={[bookingData?.outboundFlight]} />
      </div>
      <div className="py-6">
        <h3 className="text-2xl font-bold mb-4 text-gray-500">
          Return flights
          <span className="block md:inline leading-[1.2] text-[20px]  pb-2">
            <span className="text-[20px] ">
              {" "}
              from {bookingData?.returnFlight?.departureCity} to{" "}
              {bookingData?.returnFlight?.arrivalCity}
            </span>
            <span className="text-[20px] ">
              {" "}
              on{" "}
              {bookingData?.returnFlight?.departureDate
                ? format(
                    new Date(bookingData?.returnFlight.departureDate),
                    "MMMM dd, yyyy"
                  )
                : "N/A"}
            </span>
          </span>
        </h3>
        <Flights flights={[bookingData?.returnFlight]} />
        <div className="flex justify-end pr-4">
          <p className="text-lg font-semibold mt-4">
            Total Price:{" "}
            <span className="text-red-600">
              ${bookingData?.totalPrice || "0.00"}
            </span>
          </p>
        </div>
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

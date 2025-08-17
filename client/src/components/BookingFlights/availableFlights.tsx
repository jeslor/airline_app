import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useFlightContext } from "../providers/FlightProvider";
import SearchingForFlights from "../Loading/SearchingForFlights";
import Flights from "./flights";

const AvailableFlights = () => {
  const { flightData, sections, isSearchingFlights } = useFlightContext();
  const [allFlights, setAllFlights] = useState<any>({
    outboundFlights: [],
    returnFlights: [],
  });

  useEffect(() => {
    const availableFlightModal = document.getElementById("available-flights");
    if (
      (availableFlightModal && isSearchingFlights) ||
      (availableFlightModal && flightData.outboundFlights.length > 0)
    ) {
      availableFlightModal.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isSearchingFlights]);

  useEffect(() => {
    if (
      (flightData.outboundFlights && flightData.outboundFlights.length > 0) ||
      (flightData.returnFlights && flightData.returnFlights.length > 0)
    ) {
      setAllFlights(flightData);
    } else {
      setAllFlights({
        outboundFlights: [],
        returnFlights: [],
      });
    }
  }, [flightData]);
  return (
    <div
      id="available-flights"
      className="max-w-[1380px] mx-auto mt-10 space-y-6 px-4 sm:px-6 lg:px-8 w-full min-h-[400px]"
    >
      {isSearchingFlights ? (
        <div className="text-center ">
          <div className="flex justify-center mt-4">
            <SearchingForFlights message="Searching for better flight to your preferred destination" />
          </div>
        </div>
      ) : allFlights.outboundFlights.length !== 0 &&
        allFlights.returnFlights.length !== 0 ? (
        <>
          {sections.outboundFlights && (
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="pb-6"
            >
              <h3 className="text-[36px]">
                Outgoing flights{" "}
                <span className="block md:inline leading-[1.2] text-[20px] text-gray-500 pb-2">
                  <span className="text-[20px] text-gray-500 ">
                    from {allFlights.outboundFlights[0]?.departureCity} to{" "}
                    {allFlights.outboundFlights[0]?.arrivalCity}
                  </span>
                  <span className="text-[20px] text-gray-500">
                    {" "}
                    on{" "}
                    {allFlights.outboundFlights[0]?.departureDate
                      ? new Date(
                          allFlights.outboundFlights[0].departureDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </span>
              </h3>

              <Flights flights={allFlights.outboundFlights} />
            </motion.div>
          )}
          {sections.returnFlights && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="pb-6"
            >
              <h3 className="text-[36px]">
                Return flights
                <span className="block md:inline leading-[1.2] text-[20px] text-gray-500 pb-2">
                  <span className="text-[20px] text-gray-500">
                    {" "}
                    from {allFlights.returnFlights[0]?.departureCity} to{" "}
                    {allFlights.returnFlights[0]?.arrivalCity}
                  </span>
                  <span className="text-[20px] text-gray-500">
                    {" "}
                    on{" "}
                    {allFlights.returnFlights[0]?.departureDate
                      ? new Date(
                          allFlights.returnFlights[0].departureDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </span>
              </h3>
              <Flights flights={allFlights.returnFlights} />
            </motion.div>
          )}
        </>
      ) : (
        <div className="text-center">
          <h3 className="text-[36px]">Start your Booking</h3>
          <p className="text-gray-500 text-[14px]">
            Please try choosing a current city and destination and then search
            for the available flights.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableFlights;

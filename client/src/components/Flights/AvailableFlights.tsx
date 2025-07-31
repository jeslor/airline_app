import { useEffect, useState } from "react";
import { useFlightContext } from "../providers/FlightProvider";
import { Flights } from "./Flights";
import SearchingForFlights from "../Loading/SearchingForFlights";

const AvailableFlights = () => {
  const { flightData, sections, isSearchingFlights } = useFlightContext();
  const [allFlights, setAllFlights] = useState<any>({
    outboundFlights: [],
    returnFlights: [],
  });

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
    <div className="max-w-[1380px] mx-auto mt-10 space-y-6 px-4 sm:px-6 lg:px-8 w-full min-h-[400px]">
      {isSearchingFlights ? (
        <div className="text-center ">
          <div className="flex justify-center mt-4">
            <SearchingForFlights />
          </div>
        </div>
      ) : allFlights.outboundFlights.length !== 0 &&
        allFlights.returnFlights.length !== 0 ? (
        <>
          {sections.outboundFlights && (
            <div className="pb-6">
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

              <Flights flights={allFlights.outboundFlights} isOutgoing={true} />
            </div>
          )}
          {sections.returnFlights && (
            <div className="pb-6">
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
              <Flights flights={allFlights.returnFlights} isReturning={true} />
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <h3 className="text-[36px]">No flights available</h3>
          <p className="text-gray-500">
            Please try searching with different criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableFlights;

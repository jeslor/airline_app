import { useEffect, useState } from "react";
import { useFlightContext } from "../providers/FlightProvider";
import { Flights } from "./Flights";
import SearchingForFlights from "../Loading/SearchingForFlights";

const AvailableFlights = () => {
  const { flightData, isSearchingFlights } = useFlightContext();
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
      setAllFlights([]);
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
      ) : (
        <>
          <div className="pb-6">
            <h3 className="text-[36px]">
              Outgoing flights{" "}
              <span className="text-[20px] text-gray-500">
                from {allFlights.outboundFlights[0]?.departure?.city} to{" "}
                {allFlights.outboundFlights[0]?.arrival?.city}
              </span>
              <span className="text-[20px] text-gray-500">
                {" "}
                on{" "}
                {allFlights.outboundFlights[0]?.departure?.date
                  ? new Date(
                      allFlights.outboundFlights[0].departure.date
                    ).toLocaleDateString()
                  : "N/A"}
              </span>
            </h3>

            <Flights flights={allFlights.outboundFlights} />
          </div>
          <div className="pb-6">
            <h3 className="text-[36px]">
              Return flights
              <span className="text-[20px] text-gray-500">
                {" "}
                from {allFlights.returnFlights[0]?.departure?.city} to{" "}
                {allFlights.returnFlights[0]?.arrival?.city}
              </span>
              <span className="text-[20px] text-gray-500">
                {" "}
                on{" "}
                {allFlights.returnFlights[0]?.departure?.date
                  ? new Date(
                      allFlights.returnFlights[0].departure.date
                    ).toLocaleDateString()
                  : "N/A"}
              </span>
            </h3>
            <Flights flights={allFlights.returnFlights} />
          </div>
        </>
      )}
    </div>
  );
};

export default AvailableFlights;

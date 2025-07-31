import { useEffect, useState } from "react";
import { useFlightContext } from "../providers/FlightProvider";
import { Flights } from "./Flights";

const AvailableFlights = () => {
  const { flightData } = useFlightContext();
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
    <div className="max-w-[1380px] mx-auto mt-10 space-y-6 px-4 sm:px-6 lg:px-8 w-full">
      <div className="pb-6">
        <h3 className="text-[36px]">Outgoing flights</h3>
        <Flights flights={allFlights.outboundFlights} />
      </div>
      <div className="pb-6">
        <h3 className="text-[36px]">Return flights</h3>
        <Flights flights={allFlights.returnFlights} />
      </div>
    </div>
  );
};

export default AvailableFlights;

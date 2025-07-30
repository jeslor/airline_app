import React, { useEffect, useState } from "react";
import { useFlightContext } from "../providers/FlightProvider";
import { Flights } from "./Flights";

const AvailableFlights = () => {
  const { flightData } = useFlightContext();
  const [allFlights, setAllFlights] = useState<any>({});

  useEffect(() => {
    if (
      (flightData.outgoing && flightData.outgoing.length > 0) ||
      (flightData.return && flightData.return.length > 0)
    ) {
      setAllFlights(flightData);
    } else {
      setAllFlights([]);
    }
  }, [flightData]);
  return (
    <div className="max-w-[1380px] mx-auto mt-10 space-y-6 px-4 sm:px-6 lg:px-8 w-full">
      <div className="pb-6">
        <h3 className="text-[40px]">Outgoing flight</h3>
        <Flights flights={allFlights.outgoing} />
      </div>
      <div className="pb-6">
        <h3 className="text-[40px]">Return flight</h3>
        <Flights flights={allFlights.return} />
      </div>
    </div>
  );
};

export default AvailableFlights;

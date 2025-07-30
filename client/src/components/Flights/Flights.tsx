import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../ui/card";
import { useFlightContext } from "../providers/FlightProvider";
import { useEffect, useState } from "react";

export function FlightResults() {
  const { flightData } = useFlightContext();
  const [flights, setFlights] = useState<any[]>([]);

  console.log("Flight data from context:", typeof flightData, flightData);

  useEffect(() => {
    if (flightData && flightData.length > 0) {
      setFlights(flightData);
    } else {
      setFlights([]);
    }
  }, [flightData.length]);

  if (!flightData || flightData.length === 0) {
    return <p className="text-center text-gray-500">No flights found.</p>;
  }

  console.log(
    "Flights data:",
    flights.map((flight) => ({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      departure: flight.departure,
      arrival: flight.arrival,
      duration: flight.duration,
      layovers: flight.layovers,
      aircraft: flight.aircraft,
    }))
  );
  console.log("Flight data length:", flights.length);

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 space-y-6">
      {flights.length &&
        flights.map((flight, idx) => (
          <Card key={idx} className="p-6 shadow-lg border rounded-2xl">
            <CardContent className="flex flex-col lg:flex-row justify-between items-center gap-4">
              {/* Left side: airline and flight info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                <div className="text-left">
                  <p className="text-lg font-semibold">{flight.airline}</p>
                  <p className="text-sm text-muted-foreground">
                    Flight {flight.flightNumber}
                  </p>
                </div>

                <div className="hidden sm:block h-8 border-l border-gray-300 mx-4" />

                <div className="text-left">
                  <p className="text-md font-medium">
                    {flight.departure.time} – {flight.arrival.time}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {flight.departure.airport} → {flight.arrival.airport}
                  </p>
                </div>
              </div>

              {/* Center: duration and layover */}
              <div className="text-center">
                <p className="text-sm font-semibold">{flight.duration}</p>
                {flight.layovers ? (
                  <p className="text-xs text-muted-foreground">
                    Layover: {flight.layovers.airport} (
                    {flight.layovers.duration})
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Non-stop</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Aircraft: {flight.aircraft}
                </p>
              </div>

              {/* Right side: Book button */}
              <div className="w-full sm:w-auto">
                <Button className="bg-red-800 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-full w-full sm:w-auto">
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

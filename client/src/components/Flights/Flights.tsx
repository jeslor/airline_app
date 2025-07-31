import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../ui/card";
import { format } from "date-fns";

export function Flights({ flights }: { flights: any[] }) {
  if (!flights || flights.length === 0) {
    return <p className="text-center text-gray-500">No flights found.</p>;
  }

  console.log("Flights data:", flights);

  return (
    <div className="w-full flex flex-col gap-4">
      {flights.length &&
        flights.map((flight, idx) => (
          <Card
            key={idx}
            className="p-6 shadow-lg shadow-red-200/10 border rounded-2xl"
          >
            <CardContent className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                <div className="text-left">
                  <p className="text-lg font-semibold text-red-800">
                    {flight.airline}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Flight {flight.flightNumber}
                  </p>
                </div>

                <div className="hidden sm:block h-8 border-l border-gray-300 mx-4" />
                <div className="text-left">
                  <p>
                    <span className="text-[12px] font-regular text-gray-400">
                      {format(flight.departureDate, "PPP")} to{" "}
                      {format(flight.arrivalDate, "PPP")}
                    </span>
                  </p>
                  <p className="text-md font-medium">
                    {flight.departureTime} – {flight.arrivalTime}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {flight.departureAirportCode} → {flight.arrivalAirportCode}
                  </p>
                </div>
              </div>

              {/* Center: duration and layover */}
              <div className="text-center">
                <p className="text-[12px] font-regular text-gray-400 mb-3">
                  {" "}
                  Your flight
                  <span className="">
                    {" "}
                    from {flight.departureCity} to {flight.arrivalCity}
                  </span>
                </p>
                <p className="text-sm font-semibold text-red-800">
                  {flight.flightDuration}
                </p>
                {flight.layovers &&
                typeof flight.layovers === "object" &&
                flight.layovers.length ? (
                  <div className="text-sm font-semibold">
                    {flight.layovers.map((layover: any, layoverIdx: number) => (
                      <p key={layoverIdx} className="">
                        Layover: {layover.airportCode} {layover.city} (
                        {layover.duration}) in{" "}
                        <span className="text-gray-950 font-bold">
                          {layover.city}
                        </span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Non-stop</p>
                )}
                {flight.aircraft && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Aircraft: {flight.aircraft}
                  </p>
                )}
              </div>

              {/* Right side: Book button */}
              <div className="w-full sm:w-auto flex flex-col items-start justify-center sm:items-end gap-2">
                <Button className="bg-red-800 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-full w-full sm:w-auto">
                  Book Now
                </Button>
                <h4 className="text-right text-gray-800 flex items-center gap-2 justify-start w-full pl-3">
                  <span className="text-lg font-semibold">
                    ${flight.price.toFixed(2)}
                  </span>
                </h4>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

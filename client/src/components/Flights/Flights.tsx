import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../ui/card";
import { format } from "date-fns";
import { useFlightContext } from "../providers/FlightProvider";

export function Flights({
  flights,
  isOutgoing = false,
  isReturning = false,
}: {
  flights: any[];
  isOutgoing?: boolean;
  isReturning?: boolean;
}) {
  const { setBookingData } = useFlightContext();
  const handleBookFlight = (flight: any) => {
    setBookingData((prevData: any) => ({
      ...prevData,
      outgoingFlight: isOutgoing ? flight : prevData.outgoingFlight,
      returnFlight: isReturning ? flight : prevData.returnFlight,
    }));
  };
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
                  <div className="text-sm text-muted-foreground flex gap-x-2">
                    <p className=" ">
                      <strong>Flight:</strong>
                    </p>
                    <div>
                      <p>{flight.flightNumber}</p>
                      {flight.layovers && flight.layovers.length > 0 && (
                        <div className="pt-2">
                          {flight.layovers.map(
                            (layover: any, layoverIdx: number) => (
                              <p
                                key={layoverIdx}
                                className="text-sm text-muted-foreground"
                              >
                                {layover.flightNumber}
                              </p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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
                    {flight.departureAirportCode} →{" "}
                    {flight.layovers && flight.layovers.length > 0
                      ? flight.layovers
                          .map((layover: any) => layover.airportCode)
                          .join(" → ") + " → "
                      : ""}{" "}
                    {flight.arrivalAirportCode}
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
                        Layover: ({layover.duration}) in{" "}
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
                <Button
                  onClick={() => handleBookFlight(flight)}
                  className="bg-red-800 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-full w-full sm:w-auto"
                >
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

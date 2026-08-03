import { Button } from "@/components/ui/button";
import { Card, CardContent } from "../ui/card";
import { useFlightContext } from "../providers/FlightProvider";
import { Icon } from "@iconify/react/dist/iconify.js";
import { cn } from "@/lib/utils";

function Flights({ flights, legIndex }: { flights: any[]; legIndex: number }) {
  const { setBookingData, bookingData, sections, handleContinueBooking } =
    useFlightContext();

  const selectedFlights: any[] = bookingData?.selectedFlights || [];

  const handleBookFlight = (flight: any) => {
    const nextSelected = [...selectedFlights];
    nextSelected[legIndex] = flight;

    setBookingData((prevData: any) => {
      const updated = { ...prevData, selectedFlights: nextSelected };
      localStorage.setItem("bookingData", JSON.stringify(updated));
      return updated;
    });

    // Selecting a flight for the leg currently being shown advances the
    // flow. Once every leg has a selection, go straight to final review -
    // this matters when revising an earlier leg whose neighbors were
    // already picked (e.g. changing leg 1 of a round trip after leg 2 was
    // already chosen): without this check it would force re-confirming
    // leg 2 again instead of returning straight to the summary. Selecting
    // a flight while NOT on the leg currentLegIndex points at (e.g. the
    // review screen's own re-select) leaves navigation untouched.
    if (legIndex === sections.currentLegIndex) {
      const totalLegs = sections.totalLegs || legIndex + 1;
      const allLegsSelected = Array.from({ length: totalLegs }).every(
        (_, i) => Boolean(nextSelected[i]),
      );

      if (allLegsSelected) {
        handleContinueBooking({ finalBooking: true });
      } else {
        let next = legIndex + 1;
        while (next < totalLegs && nextSelected[next]) next++;
        handleContinueBooking({
          currentLegIndex: next < totalLegs ? next : legIndex,
        });
      }
    }
  };

  if (!flights || flights.length === 0) {
    return <p className="text-center text-gray-500">No flights found.</p>;
  }

  const selectedFlightNumber = selectedFlights[legIndex]?.flightNumber;

  return (
    <div className="w-full flex flex-col gap-4">
      {flights.length &&
        flights.map((flight, idx) => {
          const isSelected = selectedFlightNumber === flight.flightNumber;
          return (
            <Card
              key={idx}
              className={cn(
                "p-6 shadow-lg shadow-red-200/10 border rounded-2xl transition-colors",
                isSelected
                  ? "border-red-800 border-2 bg-red-50/60"
                  : "border-gray-200",
              )}
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
                              ),
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
                        {flight.departureDate} to {flight.arrivalDate}
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
                      {flight.layovers.map(
                        (layover: any, layoverIdx: number) => (
                          <p key={layoverIdx} className="">
                            Layover: ({layover.duration}) in{" "}
                            <span className="text-gray-950 font-bold">
                              {layover.city}
                            </span>
                          </p>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Non-stop</p>
                  )}
                  {flight.aircraftType && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Aircraft: {flight.aircraftType}
                    </p>
                  )}
                </div>

                {/* Right side: Book button */}
                <div className="w-full sm:w-auto flex flex-col items-start justify-center sm:items-end gap-2">
                  <Button
                    onClick={() => handleBookFlight(flight)}
                    className={cn(
                      "text-white font-bold px-6 py-2 rounded-full w-full sm:w-auto cursor-pointer h-9",
                      isSelected
                        ? "bg-red-800 hover:bg-red-700"
                        : "bg-gray-800 hover:bg-black",
                    )}
                  >
                    {isSelected ? "Selected" : "Select flight"}
                    {isSelected && (
                      <Icon
                        icon="mdi:check-circle"
                        className="inline ml-2 text-white"
                      />
                    )}
                  </Button>
                  <h4 className="text-right text-black flex items-center gap-2 justify-start w-full pl-3">
                    <span className="text-lg font-semibold">
                      $
                      {flight.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </h4>
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}

export default Flights;

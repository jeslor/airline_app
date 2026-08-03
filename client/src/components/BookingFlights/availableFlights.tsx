import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useFlightContext } from "../providers/FlightProvider";
import SearchingForFlights from "../Loading/SearchingForFlights";
import Flights from "./flights";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

type SortOption = "default" | "priceAsc" | "durationAsc";

function parseDurationMinutes(duration: string | undefined): number {
  if (!duration) return Number.MAX_SAFE_INTEGER;
  const hoursMatch = duration.match(/(\d+)\s*h/);
  const minutesMatch = duration.match(/(\d+)\s*m/);
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  return hours * 60 + minutes;
}

const AvailableFlights = () => {
  const { flightData, sections, isSearchingFlights } = useFlightContext();
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const legs = flightData?.legs || [];
  const currentLeg = legs[sections.currentLegIndex];

  useEffect(() => {
    const availableFlightModal = document.getElementById("available-flights");
    if (
      (availableFlightModal && isSearchingFlights) ||
      (availableFlightModal && legs.length > 0)
    ) {
      availableFlightModal?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isSearchingFlights, sections]);

  useEffect(() => {
    // Reset sort whenever the leg being shown changes, for predictability.
    setSortBy("default");
  }, [sections.currentLegIndex]);

  const sortedFlights = useMemo(() => {
    const flights = currentLeg?.flights || [];
    if (sortBy === "priceAsc") {
      return [...flights].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "durationAsc") {
      return [...flights].sort(
        (a, b) =>
          parseDurationMinutes(a.flightDuration) -
          parseDurationMinutes(b.flightDuration),
      );
    }
    return flights;
  }, [currentLeg, sortBy]);

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
      ) : legs.length > 0 && !sections.finalBooking ? (
        <motion.div
          key={sections.currentLegIndex}
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pb-6"
        >
          {legs.length > 1 && (
            <p className="text-sm font-semibold text-red-800 mb-2">
              Selecting flight {sections.currentLegIndex + 1} of {legs.length}
            </p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h3 className="text-[36px]">
              {legs.length > 1 ? `Flight ${sections.currentLegIndex + 1}` : "Available flights"}{" "}
              <span className="block md:inline leading-[1.2] text-[20px] text-gray-500 pb-2">
                <span className="text-[20px] text-gray-500 ">
                  from {currentLeg?.origin} to {currentLeg?.destination}
                </span>
                <span className="text-[20px] text-gray-500">
                  {" "}
                  on {currentLeg?.date || "N/A"}
                </span>
              </span>
            </h3>
            <div className="w-full sm:w-56 space-y-1">
              <Label htmlFor="sortBy">Sort by</Label>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger id="sortBy">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Recommended</SelectItem>
                  <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                  <SelectItem value="durationAsc">Duration: Shortest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Flights flights={sortedFlights} legIndex={sections.currentLegIndex} />
        </motion.div>
      ) : legs.length === 0 ? (
        <div className="text-center">
          <h3 className="text-[36px]">Start your Booking</h3>
          <p className="text-gray-500 text-[14px]">
            Please try choosing a current city and destination and then search
            for the available flights.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default AvailableFlights;

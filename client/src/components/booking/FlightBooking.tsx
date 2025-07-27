"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export function FlightBookingForm() {
  const [tripType, setTripType] = useState("roundTrip");
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [cabinClass, setCabinClass] = useState("economy");
  const [departDate, setDepartDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);

  return (
    <div className="bg-white min-h-[300px] w-full mx-auto max-w-[1200px] rounded-t-4xl rounded-b-2xl shadow-xl p-8">
      <div className="flex justify-center mb-6 space-x-4">
        <Button
          variant={tripType === "roundTrip" ? "default" : "secondary"}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-semibold",
            tripType === "roundTrip"
              ? "bg-red-800 hover:bg-red-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
          onClick={() => setTripType("roundTrip")}
        >
          Round Trip
        </Button>
        <Button
          variant={tripType === "oneWay" ? "default" : "secondary"}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-semibold",
            tripType === "oneWay"
              ? "bg-red-800 hover:bg-red-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
          onClick={() => setTripType("oneWay")}
        >
          One Way
        </Button>
        <Button
          variant={tripType === "multiCity" ? "default" : "secondary"}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-semibold",
            tripType === "multiCity"
              ? "bg-red-800 hover:bg-red-700 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
          onClick={() => setTripType("multiCity")}
        >
          Multi City
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* From Input */}
        <div className="space-y-1">
          <Label htmlFor="origin">From</Label>
          <Input id="origin" placeholder="e.g., London (LHR)" />
          {/* You can add an icon inside the Input component or as an adornment */}
        </div>

        {/* To Input */}
        <div className="space-y-1">
          <Label htmlFor="destination">To</Label>
          <Input id="destination" placeholder="e.g., Doha (DOH)" />
        </div>

        {/* Depart Date Input */}
        <div className="space-y-1">
          <Label htmlFor="departDate">Depart</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !departDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {departDate ? (
                  format(departDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={departDate}
                onSelect={setDepartDate}
                initialFocus
                // Disable dates before today
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Return Date Input (conditionally rendered for Round Trip) */}
        {tripType === "roundTrip" && (
          <div className="space-y-1">
            <Label htmlFor="returnDate">Return</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !returnDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate ? (
                    format(returnDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  initialFocus
                  // Disable dates before depart date if set, otherwise before today
                  disabled={(date) =>
                    departDate
                      ? date < new Date(departDate.setHours(0, 0, 0, 0))
                      : date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Passenger Input */}
        <div
          className={cn(
            "space-y-1",
            tripType === "oneWay" && "md:col-span-2" // Occupy 2 columns for one-way
          )}
        >
          <Label htmlFor="passengers">Passengers</Label>
          <Select
            value={passengerCount.toString()}
            onValueChange={(value) => setPassengerCount(Number(value))}
          >
            <SelectTrigger id="passengers">
              <SelectValue placeholder="Select number of passengers" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(9)].map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1} Passenger{i + 1 > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cabin Class Input */}
        <div className="space-y-1">
          <Label htmlFor="cabinClass">Cabin Class</Label>
          <Select
            value={cabinClass}
            onValueChange={(value) => setCabinClass(value)}
          >
            <SelectTrigger id="cabinClass">
              <SelectValue placeholder="Select cabin class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="premiumEconomy">Premium Economy</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="first">First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
        <Button variant="link" className="text-red-800 hover:text-red-700">
          Special offers
        </Button>
        <Button variant="link" className="text-red-800 hover:text-red-700">
          Manage Booking
        </Button>
        <Button variant="link" className="text-red-800 hover:text-red-700">
          Flight Status
        </Button>
        <Button
          type="submit" // Consider wrapping this in a <form> tag
          className="bg-red-800 text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-red-700 transition-colors duration-300 shadow-lg"
        >
          Search Flights
        </Button>
      </div>

      {/* Additional links/info */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>
          For assistance, please call{" "}
          <a href="#" className="underline text-red-800 hover:text-red-700">
            our contact centre
          </a>{" "}
          or visit our{" "}
          <a href="#" className="underline text-red-800 hover:text-red-700">
            help page
          </a>
          .
        </p>
      </div>
    </div>
  );
}

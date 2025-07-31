import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { flightBookingSchema } from "@/schemas/FlightBookingSchema";
import { useFlightContext } from "../providers/FlightProvider";
import { useState } from "react";

export function FlightBookingForm() {
  const { setFlightData, setIsSearchingFlights } = useFlightContext();
  const [open, setOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const form = useForm<z.infer<typeof flightBookingSchema>>({
    resolver: zodResolver(flightBookingSchema),
    defaultValues: {
      tripType: "roundTrip",
      origin: "",
      destination: "",
      departDate: undefined,
      returnDate: undefined,
      passengers: 1,
      cabinClass: "economy",
    },
    mode: "onChange",
  });

  const tripType = form.watch("tripType");
  const departDate = form.watch("departDate");

  const onSubmit = async (data: z.infer<typeof flightBookingSchema>) => {
    try {
      setIsSearchingFlights(true);

      const flights = await fetch("http://localhost:3000/api/flights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!flights.ok) {
        throw new Error("Failed to fetch flights");
      }

      const flightsData = await flights.json();
      if (flightsData.error) {
        throw new Error(flightsData.error);
      }

      // check if there are some flights in localStorage
      if (localStorage.getItem("flightData")) {
        localStorage.removeItem("flightData");
      }

      localStorage.setItem(
        "flightData",
        JSON.stringify(flightsData.flights || [])
      );

      setFlightData(flightsData.flights || []);
    } catch (error: any) {
      console.error("Error fetching flights:", error);
      alert("Failed to fetch flights. Please try again later.");
    } finally {
      setIsSearchingFlights(false);
    }
  };

  return (
    <div className="bg-white min-h-[300px] w-full mx-auto max-w-[1200px] rounded-t-4xl rounded-b-2xl shadow-xl p-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-center mb-6 space-x-4">
          {["roundTrip", "oneWay", "multiCity"].map((type) => (
            <Button
              key={type}
              variant={tripType === type ? "default" : "secondary"}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold",
                tripType === type
                  ? "bg-red-800 hover:bg-red-700 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
              onClick={() => {
                form.setValue(
                  "tripType",
                  type as "roundTrip" | "oneWay" | "multiCity",
                  { shouldValidate: true }
                );
                if (type !== "roundTrip") {
                  form.setValue("returnDate", undefined, {
                    shouldValidate: true,
                  });
                }
              }}
              type="button"
            >
              {type === "roundTrip" && "Round Trip"}
              {type === "oneWay" && "One Way"}
              {type === "multiCity" && "Multi City"}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="space-y-1">
            <Label htmlFor="origin">From</Label>
            <Input
              id="origin"
              placeholder="e.g., London (LHR)"
              {...form.register("origin")}
            />
            {form.formState.errors.origin && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.origin.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="destination">To</Label>
            <Input
              id="destination"
              placeholder="e.g., Doha (DOH)"
              {...form.register("destination")}
            />
            {form.formState.errors.destination && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.destination.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="departDate">Depart</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
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
                  onSelect={(date) => {
                    if (!date) return;
                    form.setValue("departDate", date, {
                      shouldValidate: true,
                    });
                    if (
                      form.watch("returnDate") &&
                      date > form.watch("returnDate")!
                    ) {
                      form.setValue("returnDate", undefined, {
                        shouldValidate: true,
                      });
                    }
                    setOpen(false); // Close depart date popover
                  }}
                  initialFocus
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.departDate && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.departDate.message}
              </p>
            )}
          </div>

          {tripType === "roundTrip" && (
            <div className="space-y-1">
              <Label htmlFor="returnDate">Return</Label>
              <Popover open={returnOpen} onOpenChange={setReturnOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("returnDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("returnDate") ? (
                      format(form.watch("returnDate")!, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("returnDate")}
                    onSelect={(date) => {
                      if (!date) return;
                      form.setValue("returnDate", date, {
                        shouldValidate: true,
                      });
                      setReturnOpen(false); // Close return date popover
                    }}
                    initialFocus
                    disabled={(date) =>
                      departDate
                        ? date < new Date(departDate.setHours(0, 0, 0, 0))
                        : date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.returnDate && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.returnDate.message}
                </p>
              )}
            </div>
          )}

          <div
            className={cn(
              "space-y-1",
              tripType === "oneWay" ? "md:col-span-2" : ""
            )}
          >
            <Label htmlFor="passengers">Passengers</Label>
            <Select
              value={form.watch("passengers").toString()}
              onValueChange={(value) =>
                form.setValue("passengers", Number(value), {
                  shouldValidate: true,
                })
              }
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
            {form.formState.errors.passengers && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.passengers.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="cabinClass">Cabin Class</Label>
            <Select
              value={form.watch("cabinClass")}
              onValueChange={(value) =>
                form.setValue(
                  "cabinClass",
                  value as "economy" | "premiumEconomy" | "business" | "first",
                  { shouldValidate: true }
                )
              }
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
            {form.formState.errors.cabinClass && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.cabinClass.message}
              </p>
            )}
          </div>
        </div>

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
            type="submit"
            className="bg-red-800 text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-red-700 transition-colors duration-300 shadow-lg"
          >
            Search Flights
          </Button>
        </div>
      </form>

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

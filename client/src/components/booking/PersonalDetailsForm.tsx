import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { personalDetailsSchema } from "@/schemas/PersonalDetailsSchema";
import { useFlightContext } from "../providers/FlightProvider";

export function PersonalDetailsForm() {
  const {
    setBookingData,
    bookingData,
    isSubmitting,
    setIsSubmitting,
    setSections,
    setFlightData,
  } = useFlightContext();
  const form = useForm({
    resolver: zodResolver(personalDetailsSchema),
  });

  const onSubmit = async (data: z.infer<typeof personalDetailsSchema>) => {
    try {
      setIsSubmitting(true);
      setBookingData({ ...bookingData, passenger: data });

      const response = await fetch("http://localhost:3000/api/book-flight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingData,
          passenger: data,
          bookingDate: format(new Date().toISOString(), "yyyy-MM-dd"),
          bookingTime: format(new Date().toISOString(), "HH:mm"),
        }),
      });

      const flightBooked = await response.json();
      console.log("Flight booked response:", flightBooked);

      if (!flightBooked.ok) {
        throw new Error("Failed to book flight");
      }
    } catch (error) {
      console.log("Error booking flight:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    form.reset();
    localStorage.removeItem("bookingData");
    localStorage.removeItem("flightData");
    localStorage.removeItem("sections");
    setSections({
      outboundFlights: true,
      returnFlights: false,
      finalBooking: false,
    });
    setBookingData({
      passenger: {},
      outboundFlight: {},
      returnFlight: {},
      totalPrice: 0,
      bookingStatus: "",
      bookingId: "",
      bookingDate: "",
      bookingTime: "",
      bookingReference: "",
    });
    setFlightData({
      outboundFlights: [],
      returnFlights: [],
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 flex flex-col items-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display country.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display phone number.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:justify-center">
          <Button
            disabled={isSubmitting}
            className="h-11  bg-red-800 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-full w-full sm:w-auto cursor-pointer "
            type="submit"
          >
            Complete Booking
          </Button>
          <Button
            onClick={(e) => handleStartOver(e)}
            disabled={isSubmitting}
            className="h-11  bg-gray-800 hover:bg-black text-white font-bold  py-2 rounded-full !w-fit sm:w-auto  cursor-pointer"
            type="submit"
          >
            <Icon icon="radix-icons:cross-2" className="mr-1 size-4" />
            Start Over
          </Button>
        </div>
      </form>
    </Form>
  );
}

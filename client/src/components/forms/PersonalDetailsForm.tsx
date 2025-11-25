import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { personalDetailsSchema } from "@/schemas/PersonalDetailsSchema";
import { useFlightContext } from "../providers/FlightProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import SearchingForFlights from "../Loading/SearchingForFlights";

export function PersonalDetailsForm() {
  const apiUrl =
    process.env.NODE_ENV === "development"
      ? import.meta.env.VITE_API_URL_LOCAL
      : import.meta.env.VITE_API_URL;
  const {
    setBookingData,
    bookingData,
    isSubmitting,
    setIsSubmitting,
    handleStartOver,
  } = useFlightContext();
  const form = useForm({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      phoneNumber: "",
    },
  });
  const [flightBooked, setFlightBooked] = useState(false);

  const onSubmit = async (data: z.infer<typeof personalDetailsSchema>) => {
    try {
      setIsSubmitting(true);
      setBookingData({ ...bookingData, passenger: data });

      const response = await fetch(`${apiUrl}/book`, {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingData,
          passenger: data,
          bookingDate: format(new Date().toISOString(), "yyyy-MM-dd"),
          bookingTime: format(new Date().toISOString(), "HH:mm"),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Failed to book flight", {
          cause: errorData,
        });
      }

      const flightBooked = await response.json();

      setBookingData((prev: any) => ({
        ...prev,
        bookingStatus: flightBooked.bookingStatus,
        bookingId: flightBooked.bookingId,
        bookingReference: flightBooked.data.bookingReference,
      }));
      handleFlightBooked(true);
    } catch (error: any) {
      console.log("Error booking flight:", error.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlightBooked = (status: boolean) => {
    if (status) {
      document.body.style.height = "100vh";
      document.body.style.overflow = "hidden";
      setFlightBooked(status);
    }
    if (!status) {
      document.body.style.height = "auto";
      document.body.style.overflow = "auto";
      setFlightBooked(status);
    }
  };

  return (
    <>
      {isSubmitting && (
        <div className="flex items-center justify-center h-screen w-screen fixed top-0 left-0 z-50 bg-slate-200">
          <div className="text-center ">
            <div className="flex justify-center mt-4">
              <SearchingForFlights message="Completing your booking" />
            </div>
          </div>
        </div>
      )}
      {flightBooked && (
        <div className="fixed top-0 left-0 z-[1000] w-full h-full flex items-center justify-center bg-black/60 bg-opacity-50">
          <div className="bg-white px-8 py-12 rounded-lg shadow-lg w-full max-w-[600px] relative">
            <button
              onClick={(e: any) => {
                handleFlightBooked(false);
                handleStartOver(e as React.MouseEvent<HTMLButtonElement>);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded-full border hover:bg-gray-100 cursor-pointer"
            >
              <Icon icon="radix-icons:cross-2" className="size-5" />
            </button>
            <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
              <p className="text-sm font-semibold">
                Your flight has been successfully booked!
              </p>
            </div>
            <p className="text-gray-700 mb-4">
              Thank you for booking with us. Your booking details are as
              follows:
            </p>
            <ul className="list-disc pl-5 text-gray-700">
              <li>
                <strong>Passenger Name:</strong>{" "}
                {bookingData?.passenger?.firstName}{" "}
                {bookingData?.passenger?.lastName}
              </li>
              <li>
                <strong>Email:</strong> {bookingData?.passenger.email}
              </li>
              <li>
                <strong>Phone Number:</strong>{" "}
                {bookingData?.passenger.phoneNumber}
              </li>
              <li>
                <strong>Booking Reference:</strong>{" "}
                {bookingData?.bookingReference}
              </li>
            </ul>
            <div className="flex items-center justify-center mt-6">
              <Icon
                icon="teenyicons:tick-circle-outline"
                className="text-green-600 size-12 mt-4"
              />
            </div>
          </div>
        </div>
      )}
      <Form {...form}>
        <form
          autoComplete="off"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 flex flex-col items-start"
        >
          <div className="flex flex-col items-center w-fit gap-y-1">
            <Label htmlFor="passengers">Title</Label>
            <Select
              defaultValue=""
              onValueChange={(value) => {
                form.setValue("title", value);
              }}
            >
              <SelectTrigger id="title">
                <SelectValue placeholder="Select title" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr">Mr</SelectItem>
                <SelectItem value="Mrs">Mrs</SelectItem>
                <SelectItem value="Miss">Miss</SelectItem>
                <SelectItem value="Dr">Dr</SelectItem>
              </SelectContent>
              <FormMessage className="text-[10px]" />
            </Select>
          </div>

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

                  <FormMessage className="text-[10px]" />
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

                  <FormMessage className="text-[10px]" />
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

                  <FormMessage className="text-[12px]" />
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

                  <FormMessage className="text-[10px]" />
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

                  <FormMessage className="text-[10px]" />
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
    </>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

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
import SearchingForFlights from "../Loading/SearchingForFlights";
import { PaymentStep } from "../booking/PaymentStep";
import { getApiBaseUrl } from "@/lib/api";

type BookingStep = "form" | "payment" | "confirmed";

export function PersonalDetailsForm() {
  const apiUrl = getApiBaseUrl();
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
  const [step, setStep] = useState<BookingStep>("form");
  const [bookingError, setBookingError] = useState<string | null>(null);

  const onSubmit = async (data: z.infer<typeof personalDetailsSchema>) => {
    try {
      setIsSubmitting(true);
      setBookingError(null);
      setBookingData({ ...bookingData, passenger: data });

      const response = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          passenger: data,
          outboundFlight: bookingData?.outboundFlight,
          returnFlight: bookingData?.returnFlight,
          bookingDate: format(new Date().toISOString(), "yyyy-MM-dd"),
          bookingTime: format(new Date().toISOString(), "HH:mm"),
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || "Failed to create booking");
      }

      setBookingData((prev: any) => ({
        ...prev,
        bookingReference: body.data.bookingReference,
        clientSecret: body.data.clientSecret,
        amountTotal: body.data.amountTotal,
        currency: body.data.currency,
        paymentStatus: "pending",
      }));
      setStep("payment");
    } catch (error: any) {
      console.error("Error creating booking:", error);
      setBookingError(
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentConfirmed = () => {
    setBookingData((prev: any) => ({
      ...prev,
      bookingStatus: "confirmed",
      paymentStatus: "confirmed",
    }));
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";
    setStep("confirmed");
  };

  const handlePaymentFailed = (message: string) => {
    setBookingData((prev: any) => ({ ...prev, paymentStatus: "failed" }));
    setBookingError(message);
  };

  const closeConfirmation = (e: React.MouseEvent<HTMLButtonElement>) => {
    document.body.style.height = "auto";
    document.body.style.overflow = "auto";
    handleStartOver(e);
    setStep("form");
  };

  return (
    <>
      {isSubmitting && (
        <div className="flex items-center justify-center h-screen w-screen fixed top-0 left-0 z-50 bg-slate-200">
          <div className="text-center ">
            <div className="flex justify-center mt-4">
              <SearchingForFlights message="Creating your booking" />
            </div>
          </div>
        </div>
      )}
      {step === "confirmed" && (
        <div className="fixed top-0 left-0 z-[1000] w-full h-full flex items-center justify-center bg-black/60 bg-opacity-50">
          <div className="bg-white px-8 py-12 rounded-lg shadow-lg w-full max-w-[600px] relative">
            <button
              onClick={closeConfirmation}
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
              Thank you for booking with us. Your e-ticket has been emailed
              to you. Your booking details are as follows:
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

      {step === "payment" && bookingData?.clientSecret && bookingData?.bookingReference ? (
        <PaymentStep
          clientSecret={bookingData.clientSecret}
          bookingReference={bookingData.bookingReference}
          onConfirmed={handlePaymentConfirmed}
          onFailed={handlePaymentFailed}
        />
      ) : (
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
            {bookingError && (
              <p className="text-red-600 text-sm">{bookingError}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:justify-center">
              <Button
                disabled={isSubmitting}
                className="h-11  bg-red-800 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-full w-full sm:w-auto cursor-pointer "
                type="submit"
              >
                Continue to Payment
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
      )}
    </>
  );
}

// components/BookingBubble.tsx
import { Icon } from "@iconify/react";
import { useFlightContext } from "../providers/FlightProvider";
import { useEffect, useState } from "react";

const BookingBubble = () => {
  const { bookingData, handleContinueBooking, sections, setBookingData } =
    useFlightContext();

  const [myBookingData, setMyBookingData] = useState<any>(null);
  const [outboundFlight, setOutboundFlight] = useState(
    myBookingData?.outboundFlight || null
  );
  const [returnFlight, setReturnFlight] = useState(
    myBookingData?.returnFlight || null
  );
  const totalCost =
    (bookingData?.outboundFlight?.price || 0) + (returnFlight?.price || 0);

  useEffect(() => {
    setMyBookingData({
      ...bookingData,
    });
  }, [bookingData]);

  useEffect(() => {
    // Update outboundFlight and returnFlight when myBookingData changes
    if (myBookingData) {
      setOutboundFlight(myBookingData.outboundFlight || null);
      setReturnFlight(myBookingData.returnFlight || null);
    }
  }, [myBookingData]);

  const completeBooking = () => {
    handleContinueBooking({
      outboundFlights: false,
      returnFlights: false,
      finalBooking: true,
    });
    setBookingData((prevData: any) => ({
      ...prevData,
      totalPrice: totalCost.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    }));
    localStorage.setItem(
      "bookingData",
      JSON.stringify({
        ...bookingData,
        totalPrice: totalCost.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      })
    );
  };

  console.log("BookingBubble - bookingData:", bookingData);
  console.log("outboundFlight:", outboundFlight);
  console.log("returnFlight:", returnFlight);

  return (
    <div className="shadow-2xl shadow-gray-800 py-4 px-4 md:px-8 bottom-6 rounded-[30px] bg-white w-full max-w-[900px] fixed  left-1/2 transform -translate-x-1/2 z-50 border border-gray-100 flex items-center justify-between gap-4">
      {/* Flight Details Section */}
      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
        {outboundFlight && (
          <div className="flex flex-col items-start space-x-2">
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                {outboundFlight.departureCity} to {outboundFlight.arrivalCity}
              </p>
              <p className="text-xs text-gray-600">
                {outboundFlight.departureDate} - {outboundFlight.airline}
              </p>
            </div>
            {sections.returnFlights ? (
              <button
                onClick={() =>
                  handleContinueBooking({
                    outboundFlights: true,
                    returnFlights: false,
                    finalBooking: false,
                  })
                }
                className="text-[12px] text-rose-700 underline hover:text-rose-800 font-semibold cursor-pointer "
              >
                <Icon icon="eva:arrow-back-fill" className="inline mr-1" />
                outgoing flight
              </button>
            ) : null}
          </div>
        )}

        {sections.returnFlights || sections.finalBooking ? (
          <div className="flex items-center space-x-2">
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                {returnFlight.departureCity} to {returnFlight.arrivalCity}
              </p>
              <p className="text-xs text-gray-600">
                {returnFlight.departureDate} - {returnFlight.airline}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                handleContinueBooking({
                  outboundFlights: false,
                  returnFlights: true,
                  finalBooking: false,
                })
              }
              className="text-[12px] text-rose-700 underline hover:text-rose-800 font-semibold cursor-pointer"
            >
              Next flight
              <Icon icon="eva:arrow-forward-fill" className="inline ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Total Cost */}
      <div className="text-right flex-shrink-0">
        {bookingData?.outboundFlight.flightNumber &&
          bookingData?.returnFlight.flightNumber && (
            <button
              onClick={() => completeBooking()}
              className="bg-red-800 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full w-fit sm:w-auto cursor-pointer"
            >
              Book now
            </button>
          )}
        <p className="text-xl font-bold text-red-700">
          ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default BookingBubble;

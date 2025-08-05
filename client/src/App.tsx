import AvailableFlights from "./components/flights/availableFlights.tsx";
import logo from "/images/quencer_logo.webp";
import GlobeWrapper from "./components/Globe/GlobeWrapper";
import FinalizeBooking from "./components/booking/FinalizeBooking";
import { useFlightContext } from "./components/providers/FlightProvider";
import BookingBubble from "./components/booking/BookingBubble";
import SearchFlights from "./components/forms/SearchFlights";

const App = () => {
  const { sections, bookingData, isSearchingFlights } = useFlightContext();
  return (
    <div className="w-full">
      <GlobeWrapper />
      <div className="bg-slate-200 flex flex-col items-center">
        <div className="bg-white min-h-[300px] w-full mx-4 max-w-[1200px] max-auto -top-[200px] relative z-[3] rounded-t-4xl rounded-b-2xl">
          <SearchFlights />
        </div>
        {!sections.finalBooking && (
          <div className="w-full relative mt-[-170px] ">
            <AvailableFlights />
          </div>
        )}
        {sections.finalBooking && !isSearchingFlights && (
          <div className="max-w-[1380px] mx-auto mt-10 space-y-6 px-4 sm:px-6 lg:px-8 w-full min-h-[400px]">
            <FinalizeBooking />
          </div>
        )}
        {bookingData?.outboundFlight.hasOwnProperty("flightNumber") &&
          !sections.finalBooking && <BookingBubble />}
        <div className="text-center mt-18 mb-[130px]">
          <div className="flexitems-center">
            <div className="w-24 h-24 mx-auto">
              <img src={logo} alt="" />
            </div>
            <h1 className="text-2xl font-bold">Quencer Airlines</h1>
          </div>
          <p
            className="mt-2 opacity-70 w-full max-w-[800px] mx-auto text-[12px] text-red-700
          "
          >
            Explorer this demo application to book flights and explore available
            options. Please remember, this is not a real booking system, but a
            demonstration of how a real system works.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;

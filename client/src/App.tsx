import { FlightBookingForm } from "./components/Booking/FlightBooking";
import AvailableFlights from "./components/Flights/AvailableFlights";

import GlobeWrapper from "./components/Globe/GlobeWrapper";

const App = () => {
  return (
    <div className="w-full">
      <GlobeWrapper />
      <div className="bg-slate-200 flex flex-col items-center">
        <div className="bg-white min-h-[300px] w-full mx-4 max-w-[1200px] max-auto -top-[200px] relative z-[3] rounded-t-4xl rounded-b-2xl">
          <FlightBookingForm />
        </div>
        <div className="w-full relative mt-[-170px] ">
          <AvailableFlights />
        </div>
        <div className="text-center mt-18 mb-6">
          <h1 className="text-2xl font-bold">Airline App</h1>
          <p className="mt-2 opacity-40">
            Explore the world with this interactive globe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;

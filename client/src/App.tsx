import { FlightBookingForm } from "./components/Booking/FlightBooking";
import { FlightResults } from "./components/Flights/Flights";
import GlobeWrapper from "./components/Globe/GlobeWrapper";

const App = () => {
  return (
    <div className="w-full">
      <GlobeWrapper />
      <div className="bg-slate-200 flex flex-col items-center">
        <div className="bg-white min-h-[300px] w-full mx-4 max-w-[1200px] max-auto -top-[200px] relative z-[3] rounded-t-4xl rounded-b-2xl">
          <FlightBookingForm />
        </div>
        <div>
          <FlightResults />
        </div>
        <h1 className="text-2xl font-bold">Airline App</h1>
        <p className="mt-2">Explore the world with our interactive globe.</p>
      </div>
    </div>
  );
};

export default App;

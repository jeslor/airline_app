import { FlightBookingForm } from "./components/Booking/FlightBooking";
import AvailableFlights from "./components/Flights/AvailableFlights";
import logo from "/images/quencer_logo.webp";
import GlobeWrapper from "./components/Globe/GlobeWrapper";
import Booking from "./components/Booking/Booking";

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
        <div>
          <Booking />
        </div>
        <div className="text-center mt-18 mb-6">
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

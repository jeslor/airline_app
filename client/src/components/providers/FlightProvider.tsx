import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface FlightContextType {
  flightData: {
    outboundFlights: any[];
    returnFlights: any[];
  };
  isSearchingFlights: boolean;
  bookingData: {
    passenger: any;
    outgoingFlight: any;
    returnFlight: any;
    totalPrice: number;
    bookingStatus: string;
    bookingId: string;
    bookingDate: string;
    bookingTime: string;
    bookingReference: string;
  } | null;
  sections: any;
  setSections: (section: any) => void;
  setBookingData: (data: any) => void;
  setFlightData: (data: any) => void;
  setIsSearchingFlights: (isSearching: boolean) => void;
}
const FlightContext = createContext<FlightContextType | undefined>(undefined);

export const FlightProvider = ({ children }: { children: ReactNode }) => {
  const [flightData, setFlightData] = useState<any>(
    localStorage.getItem("flightData")
      ? JSON.parse(localStorage.getItem("flightData")!)
      : {}
  );

  const [isSearchingFlights, setIsSearchingFlights] = useState<boolean>(false);

  const [bookingData, setBookingData] = useState<any>({
    passenger: {},
    outgoingFlight: {},
    returnFlight: {},
    totalPrice: 0,
    bookingStatus: "",
    bookingId: "",
    bookingDate: "",
    bookingTime: "",
    bookingReference: "",
  });
  const [sections, setSections] = useState<any>({
    outboundFlights: true,
    returnFlights: false,
    finalBooking: false,
  });

  return (
    <FlightContext.Provider
      value={{
        sections,
        setSections,
        bookingData,
        setBookingData,
        flightData,
        setFlightData,
        isSearchingFlights,
        setIsSearchingFlights,
      }}
    >
      {children}
    </FlightContext.Provider>
  );
};

export const useFlightContext = () => {
  const context = useContext(FlightContext);
  if (!context) {
    throw new Error("useFlightContext must be used within a FlightProvider");
  }
  return context;
};
export default FlightProvider;

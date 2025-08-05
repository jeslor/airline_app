import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface FlightContextType {
  flightData: {
    outboundFlights: any[];
    returnFlights: any[];
  };
  isSearchingFlights: boolean;
  isSubmitting: boolean;
  bookingData: {
    passenger: any;
    outboundFlight: any;
    returnFlight: any;
    totalPrice: string;
    bookingDate: string;
    bookingTime: string;
    bookingStatus?: string;
    bookingReference?: string;
  } | null;
  sections: any;
  setSections: (section: any) => void;
  setBookingData: (data: any) => void;
  setFlightData: (data: any) => void;
  setIsSearchingFlights: (isSearching: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  handleContinueBooking: (newSection: {
    outboundFlights?: boolean;
    returnFlights?: boolean;
    finalBooking?: boolean;
  }) => void;
}
const FlightContext = createContext<FlightContextType | undefined>(undefined);

export const FlightProvider = ({ children }: { children: ReactNode }) => {
  const [flightData, setFlightData] = useState<any>(
    localStorage.getItem("flightData")
      ? JSON.parse(localStorage.getItem("flightData")!)
      : {}
  );

  const [isSearchingFlights, setIsSearchingFlights] = useState<boolean>(false);

  const [bookingData, setBookingData] = useState<any>(
    localStorage.getItem("bookingData")
      ? JSON.parse(localStorage.getItem("bookingData")!)
      : {
          passenger: {},
          outboundFlight: {},
          returnFlight: {},
          totalPrice: 0,
          bookingStatus: "",
          bookingId: "",
          bookingDate: "",
          bookingTime: "",
          bookingReference: "",
        }
  );
  const [sections, setSections] = useState<any>(
    localStorage.getItem("sections")
      ? JSON.parse(localStorage.getItem("sections")!)
      : {
          outboundFlights: true,
          returnFlights: false,
          finalBooking: false,
        }
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleContinueBooking = (
    newSection: {
      outboundFlights?: boolean;
      returnFlights?: boolean;
      finalBooking?: boolean;
    } = {}
  ) => {
    setSections((prevSections: any) => ({
      ...prevSections,
      ...newSection,
    }));

    localStorage.setItem(
      "sections",
      JSON.stringify({
        ...sections,
        ...newSection,
      })
    );
  };

  return (
    <FlightContext.Provider
      value={{
        sections,
        setSections,
        // Placeholder for future use
        isSubmitting,
        bookingData,
        setBookingData,
        flightData,
        setFlightData,
        isSearchingFlights,
        setIsSearchingFlights,
        handleContinueBooking,
        setIsSubmitting,
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

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface LegResult {
  origin: string;
  destination: string;
  date: string;
  flights: any[];
}

interface Sections {
  currentLegIndex: number;
  totalLegs: number;
  finalBooking: boolean;
}

interface FlightContextType {
  flightData: {
    legs: LegResult[];
  };
  isSearchingFlights: boolean;
  isSubmitting: boolean;
  bookingData: {
    passenger: any;
    selectedFlights: (any | null)[];
    totalPrice: string;
    bookingDate: string;
    bookingTime: string;
    bookingStatus?: string;
    bookingReference?: string;
    clientSecret?: string;
    amountTotal?: number;
    currency?: string;
    paymentStatus?: "idle" | "pending" | "confirmed" | "failed";
  } | null;
  sections: Sections;
  setSections: (section: Sections) => void;
  setBookingData: (data: any) => void;
  setFlightData: (data: any) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  handleSetIsSearchingFlights: (isSearching: boolean) => void;
  handleContinueBooking: (newSection: Partial<Sections>) => void;
  handleStartOver: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
const FlightContext = createContext<FlightContextType | undefined>(undefined);

const defaultBookingData = {
  passenger: {},
  selectedFlights: [],
  totalPrice: "0",
  bookingStatus: "",
  bookingDate: "",
  bookingTime: "",
  bookingReference: "",
  paymentStatus: "idle" as const,
};

const defaultSections: Sections = {
  currentLegIndex: 0,
  totalLegs: 0,
  finalBooking: false,
};

export const FlightProvider = ({ children }: { children: ReactNode }) => {
  const [flightData, setFlightData] = useState<any>(
    localStorage.getItem("flightData")
      ? JSON.parse(localStorage.getItem("flightData")!)
      : { legs: [] }
  );

  const [isSearchingFlights, setIsSearchingFlights] = useState<boolean>(false);

  const [bookingData, setBookingData] = useState<any>(
    localStorage.getItem("bookingData")
      ? JSON.parse(localStorage.getItem("bookingData")!)
      : defaultBookingData
  );
  const [sections, setSections] = useState<Sections>(
    localStorage.getItem("sections")
      ? JSON.parse(localStorage.getItem("sections")!)
      : defaultSections
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSetIsSearchingFlights = (isSearching: boolean) => {
    setIsSearchingFlights(isSearching);
  };

  const handleContinueBooking = (newSection: Partial<Sections> = {}) => {
    setSections((prevSections: Sections) => {
      const merged = { ...prevSections, ...newSection };
      localStorage.setItem("sections", JSON.stringify(merged));
      return merged;
    });
  };

  const handleStartOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    localStorage.removeItem("bookingData");
    localStorage.removeItem("flightData");
    localStorage.removeItem("sections");
    setSections(defaultSections);
    setBookingData(defaultBookingData);
    setFlightData({ legs: [] });
  };

  return (
    <FlightContext.Provider
      value={{
        sections,
        setSections,
        isSubmitting,
        bookingData,
        setBookingData,
        flightData,
        setFlightData,
        isSearchingFlights,
        handleSetIsSearchingFlights,
        handleContinueBooking,
        setIsSubmitting,
        handleStartOver: handleStartOver as (
          e: React.MouseEvent<HTMLButtonElement>
        ) => void,
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

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface FlightContextType {
  flightData: {
    outboundFlights: any[];
    returnFlights: any[];
  };
  isSearchingFlights: boolean;
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

  return (
    <FlightContext.Provider
      value={{
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

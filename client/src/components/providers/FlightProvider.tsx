import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface FlightContextType {
  flightData: any;
  setFlightData: (data: any) => void;
}
const FlightContext = createContext<FlightContextType | undefined>(undefined);

export const FlightProvider = ({ children }: { children: ReactNode }) => {
  const [flightData, setFlightData] = useState<any>(null);

  return (
    <FlightContext.Provider value={{ flightData, setFlightData }}>
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

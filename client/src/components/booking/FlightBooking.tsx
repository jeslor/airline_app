// components/FlightBookingForm.tsx
import { useState } from "react";

export function FlightBookingForm() {
  const [tripType, setTripType] = useState("roundTrip");
  const [passengerCount, setPassengerCount] = useState(1);
  const [cabinClass, setCabinClass] = useState("economy");

  return (
    <div className="bg-white min-h-[300px] w-full mx-auto max-w-[1200px] rounded-t-4xl rounded-b-2xl shadow-xl p-8">
      <div className="flex justify-center mb-6 space-x-4">
        <button
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
            tripType === "roundTrip"
              ? "bg-red-800 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setTripType("roundTrip")}
        >
          Round Trip
        </button>
        <button
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
            tripType === "oneWay"
              ? "bg-red-800 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setTripType("oneWay")}
        >
          One Way
        </button>
        <button
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
            tripType === "multiCity"
              ? "bg-red-800 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setTripType("multiCity")}
        >
          Multi City
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* From Input */}
        <div className="relative">
          <label
            htmlFor="origin"
            className="block text-gray-600 text-sm font-medium mb-1"
          >
            From
          </label>
          <input
            type="text"
            id="origin"
            placeholder="e.g., London (LHR)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414L7.5 9.086 5.707 7.293a1 1 0 00-1.414 1.414l2.5 2.5a1 1 0 001.414 0l4.5-4.5z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {/* To Input */}
        <div className="relative">
          <label
            htmlFor="destination"
            className="block text-gray-600 text-sm font-medium mb-1"
          >
            To
          </label>
          <input
            type="text"
            id="destination"
            placeholder="e.g., Doha (DOH)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414L7.5 9.086 5.707 7.293a1 1 0 00-1.414 1.414l2.5 2.5a1 1 0 001.414 0l4.5-4.5z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {/* Depart Date Input */}
        <div className="relative">
          <label
            htmlFor="departDate"
            className="block text-gray-600 text-sm font-medium mb-1"
          >
            Depart
          </label>
          <input
            type="date"
            id="departDate"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            min={new Date().toISOString().split("T")[0]} // Current date as min
          />
        </div>

        {/* Return Date Input (conditionally rendered for Round Trip) */}
        {tripType === "roundTrip" && (
          <div className="relative">
            <label
              htmlFor="returnDate"
              className="block text-gray-600 text-sm font-medium mb-1"
            >
              Return
            </label>
            <input
              type="date"
              id="returnDate"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              min={new Date().toISOString().split("T")[0]} // Current date as min
            />
          </div>
        )}

        {/* Passenger Input (occupies 2 columns if returnDate is not present) */}
        <div
          className={`${tripType === "oneWay" ? "md:col-span-2" : ""} relative`}
        >
          <label
            htmlFor="passengers"
            className="block text-gray-600 text-sm font-medium mb-1"
          >
            Passengers
          </label>
          <div className="relative">
            <select
              id="passengers"
              value={passengerCount}
              onChange={(e) => setPassengerCount(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
            >
              {[...Array(9)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Passenger{i + 1 > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Cabin Class Input */}
        <div className="relative">
          <label
            htmlFor="cabinClass"
            className="block text-gray-600 text-sm font-medium mb-1"
          >
            Cabin Class
          </label>
          <div className="relative">
            <select
              id="cabinClass"
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
            >
              <option value="economy">Economy</option>
              <option value="premiumEconomy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
        <button className="text-red-800 font-semibold hover:underline px-4 py-2 rounded-lg">
          Special offers
        </button>
        <button className="text-red-800 font-semibold hover:underline px-4 py-2 rounded-lg">
          Manage Booking
        </button>
        <button className="text-red-800 font-semibold hover:underline px-4 py-2 rounded-lg">
          Flight Status
        </button>
        <button className="bg-red-800 text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-red-700 transition-colors duration-300 shadow-lg">
          Search Flights
        </button>
      </div>

      {/* Additional links/info (optional, based on Qatar Airways style) */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>
          For assistance, please call{" "}
          <a href="#" className="underline">
            our contact centre
          </a>{" "}
          or visit our{" "}
          <a href="#" className="underline">
            help page
          </a>
          .
        </p>
      </div>
    </div>
  );
}

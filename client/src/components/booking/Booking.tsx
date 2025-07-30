import React from "react";

const Booking = () => {
  const [bookingData, setBookingData] = React.useState<any>({
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

  return <div>Booking</div>;
};

export default Booking;

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
// @ts-ignore
import mapUrl from "@/assets/wmap.json?url";

const Destinations = () => {
  return (
    <div>
      <DotLottieReact
        src={mapUrl}
        style={{ width: "90%", height: "80%", margin: "auto" }}
        autoplay
        loop
      />
    </div>
  );
};

export default Destinations;

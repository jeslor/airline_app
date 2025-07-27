import GlobeWithMultiplePlanes from "./Globe";
import SpaceCanvas from "./SpaceCanvas";

const GlobeWrapper = () => {
  return (
    <div className="h-screen relative">
      <div className="absolute inset-0 z-[2] h-[75%] w-full">
        <GlobeWithMultiplePlanes />
      </div>
      <div className="relative z-[1]">
        <SpaceCanvas />
      </div>
    </div>
  );
};

export default GlobeWrapper;

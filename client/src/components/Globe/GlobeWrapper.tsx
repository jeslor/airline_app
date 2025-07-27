import GlobeWithMultiplePlanes from "./Globe";
import SpaceCanvas from "./SpaceCanvas";

const GlobeWrapper = () => {
  return (
    <div className="h-screen relative">
      <div className="absolute inset-0 z-[2] h-[79%]  mx-auto my-0">
        <GlobeWithMultiplePlanes />
      </div>
      <div className="relative z-[1]">
        <SpaceCanvas />
      </div>
    </div>
  );
};

export default GlobeWrapper;

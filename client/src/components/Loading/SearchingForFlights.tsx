import { Plane } from "lucide-react"; // Still using lucide-react for the Plane icon
import { motion } from "framer-motion";

export default function SearchingForFlights(): any {
  const rotationDuration = 2.3;

  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: rotationDuration,
        ease: "linear" as const,
        repeat: Infinity,
        repeatType: "loop" as "loop",
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-8">
      <motion.div
        initial="initial"
        animate="animate"
        variants={containerVariants}
        className="relative w-30 h-30 flex items-center justify-center bg-conic from-slate-200/10 via-slate-200 to-red-700 rounded-full"
      >
        <div className="absolute w-28 h-28 rounded-full  bg-slate-200 " />
        <motion.div className="absolute w-full h-full  rounded-full flex items-top justify-center">
          <Plane className="size-10 fill-red-100 text-red-700 -m-4.5 rotate-[40deg]" />
        </motion.div>
      </motion.div>

      <div className="text-[15px] font-medium text-gray-700 flex items-center space-x-1">
        <span>Searching for better flight to your preferred destination</span>
        <AnimatedDots />
      </div>
    </div>
  );
}

function AnimatedDots(): any {
  return (
    <span className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-red-600"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            repeat: Infinity,
            duration: 1,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

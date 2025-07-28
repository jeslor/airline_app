import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Line } from "@react-three/drei";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib"; // Import the actual OrbitControls type

// Convert latitude/longitude to 3D position on globe
interface LatLon {
  lat: number;
  lon: number;
}

const GLOBE_RADIUS = 2.9; // Define a constant for the globe radius
const ARC_HEIGHT_FACTOR = 0.6; // Controls the height of the flight path arc

function latLonToVector3(
  lat: number,
  lon: number,
  radius: number = GLOBE_RADIUS
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Pre-calculate city positions for performance
interface CityWithPosition extends LatLon {
  name: string;
  position: THREE.Vector3;
}

const cities: CityWithPosition[] = [
  {
    name: "Frankfurt",
    lat: 50.1109,
    lon: 8.6821,
    position: latLonToVector3(50.1109, 8.6821),
  },
  {
    name: "New York",
    lat: 40.7128,
    lon: -74.006,
    position: latLonToVector3(40.7128, -74.006),
  },
  {
    name: "Tokyo",
    lat: 35.6895,
    lon: 139.6917,
    position: latLonToVector3(35.6895, 139.6917),
  },
  {
    name: "Sydney",
    lat: -33.8688,
    lon: 151.2093,
    position: latLonToVector3(-33.8688, 151.2093),
  },
  {
    name: "Cape Town",
    lat: -33.9249,
    lon: 18.4241,
    position: latLonToVector3(-33.9249, 18.4241),
  },
  {
    name: "Nairobi",
    lat: -1.2921,
    lon: 36.8219,
    position: latLonToVector3(-1.2921, 36.8219),
  },
  {
    name: "Toronto",
    lat: 43.65107,
    lon: -79.347015,
    position: latLonToVector3(43.65107, -79.347015),
  },
  {
    name: "Rio de Janeiro",
    lat: -22.9068,
    lon: -43.1729,
    position: latLonToVector3(-22.9068, -43.1729),
  },
  {
    name: "Paris",
    lat: 48.8566,
    lon: 2.3522,
    position: latLonToVector3(48.8566, 2.3522),
  },
  {
    name: "Dubai",
    lat: 25.2048,
    lon: 55.2708,
    position: latLonToVector3(25.2048, 55.2708),
  },
  {
    name: "London",
    lat: 51.5074,
    lon: -0.1278,
    position: latLonToVector3(51.5074, -0.1278),
  },
  {
    name: "Los Angeles",
    lat: 34.0522,
    lon: -118.2437,
    position: latLonToVector3(34.0522, -118.2437),
  },
  {
    name: "Moscow",
    lat: 55.7558,
    lon: 37.6173,
    position: latLonToVector3(55.7558, 37.6173),
  },
  {
    name: "Mexico City",
    lat: 19.4326,
    lon: -99.1332,
    position: latLonToVector3(19.4326, -99.1332),
  },
  {
    name: "Mumbai",
    lat: 19.076,
    lon: 72.8777,
    position: latLonToVector3(19.076, 72.8777),
  },
  // --- Additional 10 Cities ---
  {
    name: "Beijing",
    lat: 39.9042,
    lon: 116.4074,
    position: latLonToVector3(39.9042, 116.4074),
  },
  {
    name: "Santiago",
    lat: -33.4489,
    lon: -70.6693,
    position: latLonToVector3(-33.4489, -70.6693),
  },
  {
    name: "Berlin",
    lat: 52.52,
    lon: 13.405,
    position: latLonToVector3(52.52, 13.405),
  },
  {
    name: "Istanbul",
    lat: 41.0082,
    lon: 28.9784,
    position: latLonToVector3(41.0082, 28.9784),
  },
  {
    name: "Lima",
    lat: -12.0464,
    lon: -77.0428,
    position: latLonToVector3(-12.0464, -77.0428),
  },
  {
    name: "Cairo",
    lat: 30.0444,
    lon: 31.2357,
    position: latLonToVector3(30.0444, 31.2357),
  },
  {
    name: "Seoul",
    lat: 37.5665,
    lon: 126.978,
    position: latLonToVector3(37.5665, 126.978),
  },
  {
    name: "Buenos Aires",
    lat: -34.6037,
    lon: -58.3816,
    position: latLonToVector3(-34.6037, -58.3816),
  },
  {
    name: "Wellington",
    lat: -41.2865,
    lon: 174.7762,
    position: latLonToVector3(-41.2865, 174.7762),
  },
  {
    name: "Stockholm",
    lat: 59.3293,
    lon: 18.0686,
    position: latLonToVector3(59.3293, 18.0686),
  },
];

interface EarthProps {
  children: React.ReactNode;
  orbitControlsRef: React.RefObject<OrbitControlsImpl | null>; // Allow null for initial ref value
}

// Earth component - now simplified for free rotation
function Earth({ children, orbitControlsRef }: EarthProps) {
  const texture = useTexture("/images/textures/earth.jpg");
  const meshRef = useRef<THREE.Mesh>(null); // Ref for the Earth mesh

  // State to manage if the user is interacting
  const [isInteracting, setIsInteracting] = useState(false);
  // State to track if the globe is returning to upright
  const [isReturningToUpright, setIsReturningToUpright] = useState(false);

  // Initial target quaternion for the upright position
  const targetQuaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    // Assuming the initial position (0, 0, 0) for rotation means the North Pole is up.
    // If your globe texture has a different orientation, you might need to adjust this.
    q.setFromEuler(new THREE.Euler(0, 0, 0)); // No initial rotation, or adjust as needed
    return q;
  }, []);

  useEffect(() => {
    const controls = orbitControlsRef.current;
    if (controls) {
      // Event listeners for user interaction
      const onStart = () => {
        setIsInteracting(true);
        setIsReturningToUpright(false); // Stop any return to upright if user interacts
      };
      const onEnd = () => {
        setIsInteracting(false);
        setIsReturningToUpright(true); // Start returning to upright when interaction ends
      };

      controls.addEventListener("start", onStart);
      controls.addEventListener("end", onEnd);

      return () => {
        controls.removeEventListener("start", onStart);
        controls.removeEventListener("end", onEnd);
      };
    }
  }, [orbitControlsRef]); // Depend on orbitControlsRef

  useFrame((_, delta) => {
    if (meshRef.current) {
      if (isInteracting) {
        return;
      }

      if (isReturningToUpright) {
        // Smoothly return to the upright position
        // The speed of slerp is proportional to delta, making it frame-rate independent
        meshRef.current.quaternion.slerp(targetQuaternion, 5 * delta); // Adjust 5 for speed
        // Check if close enough to upright to stop returning
        if (meshRef.current.quaternion.angleTo(targetQuaternion) < 0.01) {
          setIsReturningToUpright(false);
          // Optional: Snap to target once close to avoid tiny residual rotation
          meshRef.current.quaternion.copy(targetQuaternion);
        }
      } else {
        // Resume slow rotation if not interacting and not returning to upright
        meshRef.current.rotation.y += 0.05 * delta; // Adjust speed as desired
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <meshStandardMaterial map={texture} />
      {children}
    </mesh>
  );
}

// Component to render a small circle at city positions
interface CityPointProps {
  position: THREE.Vector3;
  color?: string | THREE.Color;
  radius?: number;
}
function CityPoint({
  position,
  color = "yellow",
  radius = 0.02, // Small radius for the circle
}: CityPointProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// FlightPath draws a visible curved line between start and end using @react-three/drei/Line
interface FlightPathProps {
  id: number;
  start: CityWithPosition;
  end: CityWithPosition;
  progress: number;
  opacity: number;
  onFlightComplete: (id: number) => void;
  lineWidth?: number;
  color?: string | THREE.Color;
}

function FlightPath({
  id,
  start,
  end,
  progress,
  opacity,
  onFlightComplete,
  lineWidth = 2,
  color = "#00ff00", // Default to a vibrant green
}: FlightPathProps) {
  const curvePoints = useMemo(() => {
    const startVec = start.position;
    const endVec = end.position;

    // Calculate the midpoint for the arc, elevated above the globe
    const midPoint = startVec.clone().lerp(endVec, 0.5); // Interpolate halfway
    const midNormalized = midPoint.normalize(); // Normalize to unit sphere
    const arcMid = midNormalized.multiplyScalar(
      GLOBE_RADIUS + ARC_HEIGHT_FACTOR
    ); // Elevate

    // Create a QuadraticBezierCurve3
    const curve = new THREE.QuadraticBezierCurve3(startVec, arcMid, endVec);
    return curve.getPoints(50); // Reduced points for potentially better performance, 50 is often enough
  }, [start, end]);

  const hasCompletedGrowth = useRef(false);

  useEffect(() => {
    if (progress >= 1 && !hasCompletedGrowth.current) {
      onFlightComplete(id);
      hasCompletedGrowth.current = true; // Mark as completed
    }
    if (progress < 1) {
      hasCompletedGrowth.current = false; // Reset if for some reason progress goes back below 1
    }
  }, [progress, id, onFlightComplete]);

  // Use memoization for animatedPoints to prevent unnecessary re-calculations
  const animatedPoints = useMemo(() => {
    const endIndex = Math.floor(curvePoints.length * progress);
    return curvePoints.slice(0, Math.max(2, endIndex)); // Ensure at least 2 points for a line
  }, [curvePoints, progress]);

  // Only render the line if there are enough points to draw AND it's not fully transparent
  return animatedPoints.length > 1 && opacity > 0 ? (
    <Line
      points={animatedPoints}
      color={color}
      lineWidth={lineWidth}
      opacity={opacity}
      // @ts-ignore - 'depthWrite' is not in LineProps but is a valid Material property
      // It's a valid property of MeshBasicMaterial which Line uses, but not directly on LineProps
      depthWrite={opacity === 1 ? true : false} // Improves rendering performance when transparent
    />
  ) : null;
}

// Manages multiple flight paths and their lifecycle
interface ActiveFlight {
  id: number;
  from: CityWithPosition;
  to: CityWithPosition;
  progress: number;
  speed: number;
  status: "growing" | "fadingOut" | "done";
  opacity: number;
}

function FlightCoordinator() {
  const MAX_ACTIVE_FLIGHTS = 20; // Slightly reduced to lessen initial load
  const FADE_OUT_DURATION = 0.6; // Faster fade out
  const FADE_IN_DURATION = 0.4; // Faster fade in
  const MIN_FLIGHT_DURATION = 2; // Minimum time for a flight to grow
  const MAX_FLIGHT_DURATION = 3.5; // Maximum time for a flight to grow

  const [activeFlights, setActiveFlights] = useState<ActiveFlight[]>([]);
  const nextFlightId = useRef(0);

  // Function to add a new flight
  const addNewFlight = useCallback(() => {
    // Ensure we don't add too many flights if a removal is pending
    if (
      activeFlights.filter((f) => f.status !== "done").length >=
      MAX_ACTIVE_FLIGHTS
    ) {
      return;
    }

    let from = cities[Math.floor(Math.random() * cities.length)];
    let to;
    do {
      to = cities[Math.floor(Math.random() * cities.length)];
    } while (to.name === from.name);

    const randomSpeed =
      1 /
      (MIN_FLIGHT_DURATION +
        Math.random() * (MAX_FLIGHT_DURATION - MIN_FLIGHT_DURATION));

    setActiveFlights((prevFlights) => [
      ...prevFlights,
      {
        id: nextFlightId.current++,
        from,
        to,
        progress: 0,
        speed: randomSpeed,
        status: "growing",
        opacity: 0,
      },
    ]);
  }, [activeFlights]); // Added activeFlights to dependency array for accurate length check

  // Initialize with MAX_ACTIVE_FLIGHTS
  useEffect(() => {
    // Fill up to MAX_ACTIVE_FLIGHTS if there are not enough
    if (activeFlights.length < MAX_ACTIVE_FLIGHTS) {
      const flightsToAdd = MAX_ACTIVE_FLIGHTS - activeFlights.length;
      for (let i = 0; i < flightsToAdd; i++) {
        addNewFlight();
      }
    }
  }, [addNewFlight, activeFlights.length]);

  // Callback for when a flight path growth animation completes
  const handleFlightGrowthComplete = useCallback(
    (id: number) => {
      setActiveFlights((prevFlights) =>
        prevFlights.map(
          (flight) =>
            flight.id === id
              ? { ...flight, status: "fadingOut", progress: 1 }
              : flight // Ensure progress is 1 for faded flights
        )
      );
      // Immediately add a new flight to maintain the constant number of active flights
      addNewFlight();
    },
    [addNewFlight]
  );

  useFrame((_, delta) => {
    setActiveFlights((prevFlights) => {
      const updatedFlights = prevFlights
        .map((flight) => {
          let newProgress = flight.progress;
          let newOpacity = flight.opacity;
          let newStatus = flight.status;

          if (flight.status === "growing") {
            newProgress = Math.min(flight.progress + delta * flight.speed, 2);
            newOpacity = Math.min(flight.opacity + delta / FADE_IN_DURATION, 1);
            if (newProgress >= 1 && newOpacity >= 1) {
              // Both growth and fade-in complete
              newStatus = "fadingOut";
            }
          } else if (flight.status === "fadingOut") {
            newOpacity = Math.max(
              flight.opacity - delta / FADE_OUT_DURATION,
              0
            );
            if (newOpacity <= 0) {
              newStatus = "done";
            }
          }
          return {
            ...flight,
            progress: newProgress,
            opacity: newOpacity,
            status: newStatus,
          };
        })
        .filter((flight) => flight.status !== "done"); // Filter out done flights

      return updatedFlights;
    });
  });

  return (
    <>
      {/* Render all city points once */}
      {cities.map((city) => (
        <CityPoint key={city.name} position={city.position} color="yellow" />
      ))}
      {/* Render active flight paths */}
      {activeFlights.map((flight) => (
        <FlightPath
          key={flight.id}
          id={flight.id}
          start={flight.from}
          end={flight.to}
          progress={flight.progress}
          opacity={flight.opacity}
          onFlightComplete={handleFlightGrowthComplete}
          lineWidth={2}
          color={"#00ff00"}
        />
      ))}
    </>
  );
}

// New component to handle WebGLRenderer settings
function SceneSetup() {
  const { gl } = useThree(); // This hook is now correctly inside the Canvas context

  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio);
    // You can add more renderer settings here if needed
    // gl.toneMapping = THREE.ACESFilmicToneMapping;
    // gl.toneMappingExposure = 1.0;
  }, [gl]);

  return null; // This component doesn't render any Three.js objects directly
}

// Main component rendering the globe and multiple lines
export default function GlobeWithMultiplePlanes() {
  // Specify the type for the useRef hook for OrbitControls
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <Canvas
      camera={{ position: [0, 2, 6], fov: 60 }}
      dpr={[1, 2]} // Enable dpr (device pixel ratio) for sharp rendering on high-DPI screens
    >
      {/* SceneSetup is now a child of Canvas */}
      <SceneSetup />
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} />
      {/* Pass the orbitControlsRef down to the Earth component */}
      <Earth orbitControlsRef={orbitControlsRef}>
        <FlightCoordinator />
      </Earth>
      <OrbitControls
        ref={orbitControlsRef} // Assign the ref here
        enablePan={false}
        // enableZoom={false} // This was disabling zoom, so we need to change it
        enableZoom={true} // Enable zoom functionality
        minDistance={GLOBE_RADIUS * 1.5} // Prevent camera from going too close
        maxDistance={GLOBE_RADIUS * 4} // Prevent camera from going too far
        // dampingFactor={0.05} // Adjust for smoother rotation stop
        // enableDamping={true} // Enable damping for smoother animation when released
      />
    </Canvas>
  );
}

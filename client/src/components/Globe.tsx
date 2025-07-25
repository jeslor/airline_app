import React, { useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture, Line } from "@react-three/drei"; // Import Line from drei
import * as THREE from "three";

// Convert latitude/longitude to 3D position on globe
interface LatLon {
  lat: number;
  lon: number;
}

const GLOBE_RADIUS = 2; // Define a constant for the globe radius

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
];

// Earth component, now a container for flight paths
interface RotationTarget {
  y: number;
  x: number;
  positions: THREE.Vector3[]; // Still used by GlobeRotator to determine center
}

interface EarthProps {
  rotationTarget: React.RefObject<RotationTarget>;
  children: React.ReactNode; // Add children prop
}

function Earth({ rotationTarget, children }: EarthProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  const texture = useTexture("/images/textures/earth.jpg");

  useFrame(() => {
    if (earthRef.current && rotationTarget.current) {
      earthRef.current.rotation.y = rotationTarget.current.y;
      earthRef.current.rotation.x = rotationTarget.current.x;
    }
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <meshStandardMaterial map={texture} />
      {children} {/* Render children (paths) as part of the Earth mesh */}
    </mesh>
  );
}

// FlightPath draws a visible curved line between start and end using @react-three/drei/Line
interface FlightPathProps {
  id: number; // Unique ID for keying
  start: CityWithPosition;
  end: CityWithPosition;
  progress: number; // A value from 0 to 1 for line growth
  onFlightComplete: (id: number) => void; // Callback when flight finishes
  lineWidth?: number; // Optional prop for line thickness
  color?: string | THREE.Color; // Optional prop for line color
}

function FlightPath({
  id,
  start,
  end,
  progress,
  onFlightComplete,
  lineWidth = 2,
  color = "white",
}: FlightPathProps) {
  const curvePoints = React.useMemo(() => {
    const startVec = start.position;
    const endVec = end.position;
    const mid = startVec
      .clone()
      .add(endVec)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(GLOBE_RADIUS + 0.5); // Adjust height of the arc
    const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
    return curve.getPoints(100); // Get 100 points for the curve
  }, [start, end]);

  // Use a ref for the current progress to avoid re-rendering issues
  const currentProgressRef = useRef(progress);
  currentProgressRef.current = progress; // Keep the ref updated with the latest prop

  // Slice the points array based on progress to simulate growth
  const animatedPoints = React.useMemo(() => {
    const endIndex = Math.floor(
      curvePoints.length * currentProgressRef.current
    );
    // Ensure at least 2 points for a line, or 0 if progress is very low
    return curvePoints.slice(0, Math.max(2, endIndex));
  }, [curvePoints, currentProgressRef.current]); // Recompute when curvePoints or progress changes

  // Use a separate effect or useFrame to check for completion
  useFrame(() => {
    // Check if the flight is complete
    if (currentProgressRef.current >= 1) {
      onFlightComplete(id);
    }
  });

  // Only render the line if there are enough points to draw
  return animatedPoints.length > 1 ? (
    <Line
      points={animatedPoints} // Pass the sliced points
      color={color}
      lineWidth={lineWidth}
      // You can add more props for Line such as segments, etc.
    />
  ) : null;
}

// Manages multiple flight paths
interface ActiveFlight {
  id: number;
  from: CityWithPosition;
  to: CityWithPosition;
  progress: number;
  speed: number;
}

function FlightCoordinator({
  rotationTarget,
}: {
  rotationTarget: React.RefObject<RotationTarget>;
}) {
  const MAX_ACTIVE_FLIGHTS = 12; // More than 10 active paths
  const [activeFlights, setActiveFlights] = useState<ActiveFlight[]>([]);
  const nextFlightId = useRef(0);

  // Function to add a new flight
  const addNewFlight = useCallback(() => {
    let from = cities[Math.floor(Math.random() * cities.length)];
    let to;
    do {
      to = cities[Math.floor(Math.random() * cities.length)];
    } while (to.name === from.name);

    setActiveFlights((prevFlights) => [
      ...prevFlights,
      {
        id: nextFlightId.current++,
        from,
        to,
        progress: 0,
        speed: 0.008 + Math.random() * 0.008, // Adjust speed for effect
      },
    ]);
  }, []);

  // Initialize with MAX_ACTIVE_FLIGHTS
  useEffect(() => {
    if (activeFlights.length === 0) {
      // Only initialize if no flights are active
      for (let i = 0; i < MAX_ACTIVE_FLIGHTS; i++) {
        addNewFlight();
      }
    }
  }, [addNewFlight, activeFlights.length]); // Add activeFlights.length as dependency

  // Callback for when a flight path completes its animation
  const handleFlightComplete = useCallback(
    (id: number) => {
      setActiveFlights((prevFlights) =>
        prevFlights.filter((flight) => flight.id !== id)
      );
      // Delay adding a new flight slightly to avoid immediate overlap/flicker
      setTimeout(() => {
        addNewFlight();
      }, 100); // Short delay
    },
    [addNewFlight]
  );

  useFrame((_, delta) => {
    // Update progress for all active flights
    setActiveFlights((prevFlights) => {
      const updatedFlights = prevFlights.map((flight) => ({
        ...flight,
        progress: Math.min(flight.progress + delta * flight.speed, 1),
      }));

      // Collect positions for GlobeRotator
      if (rotationTarget.current) {
        rotationTarget.current.positions = []; // Clear for this frame
        updatedFlights.forEach((flight) => {
          // Get a point near the current head of the growing segment to influence rotation
          const curve = new THREE.QuadraticBezierCurve3(
            flight.from.position,
            flight.from.position
              .clone()
              .add(flight.to.position)
              .multiplyScalar(0.5)
              .normalize()
              .multiplyScalar(GLOBE_RADIUS + 0.5),
            flight.to.position
          );
          // Use the actual point at the current progress for better centering
          const point = curve.getPoint(flight.progress);
          rotationTarget.current.positions.push(point.clone());
        });
      }

      return updatedFlights;
    });
  });

  return (
    <>
      {activeFlights.map((flight) => (
        <FlightPath
          key={flight.id}
          id={flight.id}
          start={flight.from}
          end={flight.to}
          progress={flight.progress}
          onFlightComplete={handleFlightComplete}
          lineWidth={2} // Explicitly set linewidth
          color={"#00ff00"} // Example color
        />
      ))}
    </>
  );
}

// New child component to handle globe rotation inside Canvas
function GlobeRotator({
  rotationTarget,
  orbitControlsRef,
}: {
  rotationTarget: React.RefObject<RotationTarget>;
  orbitControlsRef: React.RefObject<any>;
}) {
  useFrame(() => {
    if (
      orbitControlsRef.current &&
      orbitControlsRef.current.hasUserInteracted
    ) {
      if (rotationTarget.current) {
        rotationTarget.current.positions = [];
      }
      return;
    }

    const positions = rotationTarget.current?.positions;
    if (!positions || positions.length === 0) return;

    const avg = positions
      .reduce((acc, pos) => acc.add(pos), new THREE.Vector3(0, 0, 0))
      .divideScalar(positions.length);

    const spherical = new THREE.Spherical().setFromVector3(avg);

    if (rotationTarget.current) {
      const targetY = -spherical.theta;
      const targetX = spherical.phi - Math.PI / 2;

      rotationTarget.current.y = THREE.MathUtils.lerp(
        rotationTarget.current.y,
        targetY,
        0.05
      );
      rotationTarget.current.x = THREE.MathUtils.lerp(
        rotationTarget.current.x,
        targetX,
        0.05
      );

      rotationTarget.current.positions = [];
    }
  });

  return null;
}

// Main component rendering the globe and multiple lines
export default function GlobeWithMultiplePlanes() {
  const rotationTarget = useRef<RotationTarget>({ y: 0, x: 0, positions: [] });
  const orbitControlsRef = useRef<any>(null);

  return (
    <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <Earth rotationTarget={rotationTarget}>
        <FlightCoordinator rotationTarget={rotationTarget} />
      </Earth>
      <GlobeRotator
        rotationTarget={rotationTarget}
        orbitControlsRef={orbitControlsRef}
      />
      <OrbitControls
        ref={orbitControlsRef}
        enablePan={false}
        enableZoom={false}
      />
    </Canvas>
  );
}

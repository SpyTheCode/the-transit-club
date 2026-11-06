"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const ROAD_SCENE_CONFIG = {
  // Flat illustration palette for the bus, background and road.
  colors: {
    road: "#081f2a",
    roadMarking: "#b8dcd4",
    hillBack: "#20515a",
    hillFront: "#123d49",
    sun: "#a9d8ce",
    busBody: "#edf4eb",
    busAccent: "#5ba8a0",
    glass: "#10323f",
    bike: "#a9e3d8",
    bikeBack: "#619b99",
    tire: "#061a24",
  },
  // Durations are seconds; starting partway through keeps vehicles visible sooner.
  roadTop: 139,
  bus: {
    viewBox: "0 0 1440 180",
    width: 242,
    duration: 46,
    delay: -16,
    bounceDuration: 2.7,
    top: 40,
    staticX: 650,
    mobile: {
      viewBox: "0 0 390 180",
      width: 148,
      duration: 36,
      delay: -13,
      bounceDuration: 2.4,
      top: 82,
      staticX: 118,
    },
  },
  // Add or remove bicycles here; background bikes are hidden on small screens.
  bikes: [
    {
      width: 76,
      mobileWidth: 58,
      duration: 28,
      delay: -17,
      y: 94,
      mobileY: 105,
      staticX: 245,
      background: true,
    },
    {
      width: 83,
      mobileWidth: 68,
      duration: 23,
      delay: -8,
      y: 91,
      mobileY: 105,
      staticX: 1040,
      background: false,
    },
    {
      width: 66,
      mobileWidth: 60,
      duration: 19,
      delay: -13,
      y: 101,
      mobileY: 109,
      staticX: 1320,
      background: false,
    },
  ],
  dashDuration: 8,
  wheelDuration: 1.5,
  sunGlowDuration: 5,
  dashShift: { desktop: 1440, mobile: 390 },
} as const;

type RoadStyle = CSSProperties & {
  "--road-duration": string;
  "--road-delay": string;
  "--road-from": string;
  "--road-to": string;
  "--road-static-x": string;
  "--road-bounce-duration": string;
  "--road-wheel-duration": string;
  "--road-glow-duration": string;
};

type RoadTrackStyle = CSSProperties & {
  "--road-duration": string;
  "--road-to": string;
};

function Wheel({
  cx,
  cy,
  radius,
}: {
  cx: number;
  cy: number;
  radius: number;
}) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g className="road-wheel">
        <circle r={radius} fill={ROAD_SCENE_CONFIG.colors.tire} />
        <circle
          r={radius * 0.72}
          fill="none"
          stroke={ROAD_SCENE_CONFIG.colors.roadMarking}
          strokeWidth={radius * 0.13}
        />
        <g
          fill="none"
          stroke={ROAD_SCENE_CONFIG.colors.roadMarking}
          strokeWidth={radius * 0.1}
        >
          <path d={`M-${radius * 0.56} 0H${radius * 0.56}`} />
          <path d={`M0 -${radius * 0.56}V${radius * 0.56}`} />
          <path
            d={`M-${radius * 0.4} -${radius * 0.4}L${radius * 0.4} ${radius * 0.4}`}
          />
          <path
            d={`M-${radius * 0.4} ${radius * 0.4}L${radius * 0.4} -${radius * 0.4}`}
          />
        </g>
        <circle r={radius * 0.16} fill={ROAD_SCENE_CONFIG.colors.sun} />
      </g>
    </g>
  );
}

function BusArtwork() {
  return (
    <g className="road-bus-body">
      <path
        d="M12 18Q12 8 24 8H197Q225 8 234 34V76H12Z"
        fill={ROAD_SCENE_CONFIG.colors.busBody}
      />
      <path
        d="M21 13H194Q215 13 223 34H21Z"
        fill={ROAD_SCENE_CONFIG.colors.busAccent}
      />
      <path d="M185 17H196Q216 19 223 38H185Z" fill={ROAD_SCENE_CONFIG.colors.glass} />
      <g fill={ROAD_SCENE_CONFIG.colors.glass}>
        <rect height="24" rx="3" width="31" x="27" y="17" />
        <rect height="24" rx="3" width="31" x="64" y="17" />
        <rect height="24" rx="3" width="31" x="101" y="17" />
        <rect height="24" rx="3" width="31" x="138" y="17" />
      </g>
      <rect
        fill={ROAD_SCENE_CONFIG.colors.busAccent}
        height="3"
        rx="1.5"
        width="152"
        x="27"
        y="48"
      />
      <text
        fill={ROAD_SCENE_CONFIG.colors.glass}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="8"
        fontWeight="700"
        letterSpacing="1.2"
        x="28"
        y="65"
      >
        THE TRANSIT CLUB
      </text>
      <rect
        fill={ROAD_SCENE_CONFIG.colors.roadMarking}
        height="7"
        rx="3"
        width="9"
        x="226"
        y="48"
      />
      <rect
        fill={ROAD_SCENE_CONFIG.colors.roadMarking}
        height="6"
        rx="2"
        width="7"
        x="13"
        y="47"
      />
      <Wheel cx={52} cy={78} radius={14} />
      <Wheel cx={192} cy={78} radius={14} />
    </g>
  );
}

function BikeArtwork({ color }: { color: string }) {
  return (
    <svg
      aria-hidden="true"
      className="road-bike-art"
      height="54"
      viewBox="0 0 84 54"
      width="84"
    >
      <g
        className="road-bike-frame"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      >
        <path d="M17 38 31 17 45 38H17L37 25 58 38" />
        <path d="m31 17 9 0M37 25l-5-10M58 38 67 18m-12 0h14" />
      </g>
      <Wheel cx={17} cy={38} radius={14} />
      <Wheel cx={58} cy={38} radius={14} />
      <circle cx="40" cy="25" fill={color} r="2" />
    </svg>
  );
}

function RoadArtwork({ mobile = false }: { mobile?: boolean }) {
  const width = mobile ? 390 : 1440;
  const bus = mobile ? ROAD_SCENE_CONFIG.bus.mobile : ROAD_SCENE_CONFIG.bus;
  const dashShift = mobile
    ? ROAD_SCENE_CONFIG.dashShift.mobile
    : ROAD_SCENE_CONFIG.dashShift.desktop;
  const busStyle: RoadStyle = {
    "--road-duration": `${bus.duration}s`,
    "--road-delay": `${bus.delay}s`,
    "--road-from": `-${bus.width}px`,
    "--road-to": `calc(100vw + ${bus.width}px)`,
    "--road-static-x": `${bus.staticX}px`,
    "--road-bounce-duration": `${bus.bounceDuration}s`,
    "--road-wheel-duration": `${ROAD_SCENE_CONFIG.wheelDuration}s`,
    "--road-glow-duration": `${ROAD_SCENE_CONFIG.sunGlowDuration}s`,
  };

  return (
    <svg
      aria-hidden="true"
      className={mobile ? "road-art road-art-mobile" : "road-art road-art-desktop"}
      preserveAspectRatio="none"
      viewBox={mobile ? ROAD_SCENE_CONFIG.bus.mobile.viewBox : ROAD_SCENE_CONFIG.bus.viewBox}
    >
      <circle
        className="road-sun"
        cx={mobile ? 319 : 1190}
        cy="39"
        fill={ROAD_SCENE_CONFIG.colors.sun}
        r={mobile ? 19 : 27}
      />
      <path
        d={
          mobile
            ? "M0 121Q39 91 82 116T166 111T251 117T390 101V180H0Z"
            : "M0 112Q110 72 220 107T440 100T680 111T920 91T1160 107T1440 83V180H0Z"
        }
        fill={ROAD_SCENE_CONFIG.colors.hillBack}
        opacity="0.76"
      />
      {!mobile && (
        <g
          fill={ROAD_SCENE_CONFIG.colors.hillFront}
          opacity="0.9"
          stroke={ROAD_SCENE_CONFIG.colors.hillFront}
          strokeLinecap="round"
          strokeWidth="4"
        >
          <path d="M300 123Q335 95 370 123M335 121V98m0 7-14-12m14 19 15-14" fill="none" />
          <path d="M1110 119Q1140 90 1170 119M1140 117V92m0 8-12-10m12 18 13-13" fill="none" />
        </g>
      )}
      <path
        d={`M0 ${ROAD_SCENE_CONFIG.roadTop}H${width}V180H0Z`}
        fill={ROAD_SCENE_CONFIG.colors.road}
      />
      <g
        className="road-dashes"
        style={
          {
            "--road-duration": `${ROAD_SCENE_CONFIG.dashDuration}s`,
            "--road-to": `-${dashShift}px`,
          } as RoadTrackStyle
        }
      >
        {[0, 1].map((copy) => (
          <g key={copy} transform={`translate(${copy * width} 0)`}>
            {Array.from({ length: mobile ? 5 : 17 }, (_, index) => (
              <rect
                fill={ROAD_SCENE_CONFIG.colors.roadMarking}
                height="3"
                key={index}
                opacity="0.46"
                rx="1.5"
                width="48"
                x={index * (mobile ? 90 : 90) + 18}
                y="160"
              />
            ))}
          </g>
        ))}
      </g>
      <g className="road-vehicle road-bus" style={busStyle} transform={`translate(${bus.staticX} 0)`}>
        <g transform={`translate(0 ${bus.top})`}>
          <svg
            aria-hidden="true"
            height={bus.width * (100 / 242)}
            viewBox="0 0 242 100"
            width={bus.width}
          >
            <BusArtwork />
          </svg>
        </g>
      </g>
      {ROAD_SCENE_CONFIG.bikes.map((bike, index) => {
        if (mobile && bike.background) return null;
        const bikeWidth = mobile ? bike.mobileWidth : bike.width;
        const staticX = mobile
          ? index === 1
            ? 47
            : 248
          : bike.staticX;
        const bikeStyle: RoadStyle = {
          "--road-duration": `${bike.duration}s`,
          "--road-delay": `${bike.delay}s`,
          "--road-from": `-${bikeWidth}px`,
          "--road-to": `calc(100vw + ${bikeWidth}px)`,
          "--road-static-x": `${staticX}px`,
          "--road-bounce-duration": `${bus.bounceDuration}s`,
          "--road-wheel-duration": `${ROAD_SCENE_CONFIG.wheelDuration}s`,
          "--road-glow-duration": `${ROAD_SCENE_CONFIG.sunGlowDuration}s`,
        };
        return (
          <g
            className={`road-vehicle road-bike${bike.background ? " road-bike-background" : ""}`}
            key={index}
            style={bikeStyle}
            transform={`translate(${staticX} 0)`}
          >
            <g transform={`translate(0 ${mobile ? bike.mobileY : bike.y})`}>
              <svg
                aria-hidden="true"
                height={bikeWidth * (54 / 84)}
                viewBox="0 0 84 54"
                width={bikeWidth}
              >
                <BikeArtwork
                  color={
                    bike.background
                      ? ROAD_SCENE_CONFIG.colors.bikeBack
                      : ROAD_SCENE_CONFIG.colors.bike
                  }
                />
              </svg>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

export function HeroRoadScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const updateRunning = () => {
      scene.dataset.running = String(
        scene.isConnected &&
          document.visibilityState === "visible" &&
          scene.dataset.visible === "true" &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    };
    const observer = new IntersectionObserver(([entry]) => {
      scene.dataset.visible = String(Boolean(entry?.isIntersecting));
      updateRunning();
    });
    observer.observe(scene);
    document.addEventListener("visibilitychange", updateRunning);
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionPreference.addEventListener("change", updateRunning);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateRunning);
      motionPreference.removeEventListener("change", updateRunning);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="hero-road-scene"
      data-running="false"
      data-visible="false"
      ref={sceneRef}
    >
      <RoadArtwork />
      <RoadArtwork mobile />
    </div>
  );
}

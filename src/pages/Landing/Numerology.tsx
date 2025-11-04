import React from "react";
import CosmicHoloCard from "./_CosmicHoloCard";
import { useNavigate } from "react-router-dom";

const Emblem = () => (
  <div className="text-cosmic-blue/90">
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l7 12H5L12 3z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="16.5" r="1.2" fill="currentColor" />
    </svg>
  </div>
);

export default function Numerology() {
  const nav = useNavigate();
  return (
    <CosmicHoloCard
      emblem={<Emblem />}
      title="KARMANK • NUMEROLOGY"
      blurb="Unveil the cryptic essence of numbers—propelling seekers through a cosmic voyage of self-discovery and karmic codes."
      primaryLabel="Open Numerology"
      onPrimary={() => nav("/app?tab=dashboard")}
      secondaryLabel="Back to Gateway"
      onSecondary={() => nav("/welcome")}
    />
  );
}

import React from "react";
import CosmicHoloCard from "./_CosmicHoloCard";
import { useNavigate } from "react-router-dom";
import { HeartHandshake } from "lucide-react";

export default function Compatibility() {
  const nav = useNavigate();
  return (
    <CosmicHoloCard
      emblem={<HeartHandshake className="h-10 w-10 text-cosmic-blue/90" />}
      title="COSMIC COMPATIBILITY"
      blurb="Reveal harmony zones and growth edges—for love, partnerships, and teams—through authentic Vedic numerology."
      primaryLabel="Start Compatibility"
      onPrimary={() => nav("/app?tab=compatibility")}
      secondaryLabel="Back to Gateway"
      onSecondary={() => nav("/welcome")}
    />
  );
}

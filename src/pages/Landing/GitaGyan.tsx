import React from "react";
import CosmicHoloCard from "./_CosmicHoloCard";
import { useNavigate } from "react-router-dom";

const Emblem = () => (
  <div className="text-cosmic-blue/90">
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 10h6M9 13h6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  </div>
);

export default function GitaGyan() {
  const nav = useNavigate();
  return (
    <CosmicHoloCard
      emblem={<Emblem />}
      title="KARMANK • GITA GYAN"
      blurb="Timeless Bhagavad Gita wisdom mapped to modern choices. Contextual guidance woven with your numerological signatures."
      primaryLabel="Explore Gita Gyan"
      onPrimary={() => nav("/app?tab=gita")}
      secondaryLabel="Back to Gateway"
      onSecondary={() => nav("/welcome")}
    />
  );
}

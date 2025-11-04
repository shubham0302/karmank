import React from "react";
import CosmicHoloCard from "./_CosmicHoloCard";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function NameAnalysis() {
  const nav = useNavigate();
  return (
    <CosmicHoloCard
      emblem={<Sparkles className="h-10 w-10 text-cosmic-blue/90" />}
      title="SACRED NAME ANALYSIS"
      blurb="Decode the vibrational essence of your name and align it with your destiny through sacred numerology."
      primaryLabel="Analyze My Name"
      onPrimary={() => nav("/app?tab=name")}
      secondaryLabel="Back to Gateway"
      onSecondary={() => nav("/welcome")}
    />
  );
}

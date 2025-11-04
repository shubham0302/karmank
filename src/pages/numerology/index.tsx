import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"; // ✅ your shadcn/ui Card
import NlgSummaryComponent from "@/components/nlg/NlgSummaryComponent";
import PremiumModal from "@/components/PremiumModal";

export default function NumerologyPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Heading */}
      <Card variant="cosmic">
        <CardHeader>
          <CardTitle className="text-indigo-300">Numerology Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-indigo-200/80">
            Explore your cosmic numbers, karmic lessons, and life path insights.
          </p>
        </CardContent>
      </Card>

      {/* Free welcome summary */}
      <NlgSummaryComponent
        title="Your Cosmic Snapshot"
        prompt="Generate a warm, encouraging numerology snapshot for a curious seeker."
        language="en-US"
        isPremium={false}
        isFreeWelcome={true}
        onUpgradeClick={() => setOpen(true)}
      />

      {/* Premium-gated summary */}
      <NlgSummaryComponent
        title="Deep Destiny Insights"
        prompt="Provide deeper karmic dasha insights for the next 6 months."
        language="en-US"
        isPremium={false}
        onUpgradeClick={() => setOpen(true)}
      />

      {/* Premium modal */}
      <PremiumModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}

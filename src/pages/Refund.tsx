import React from "react";
import { Link } from "react-router-dom";

export default function Refund() {
  return (
    <main className="min-h-screen bg-black/90 text-foreground">
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
        <div className="container mx-auto max-w-4xl px-6 py-14">
          <div className="flex items-center gap-4">
            <img src="/karmank-logo.png" alt="KarmAnk" className="h-10 w-auto select-none" />
            <h1 className="text-3xl lg:text-4xl font-serif font-bold bg-gradient-auric bg-clip-text text-transparent">
              Refund & Cancellation Policy
            </h1>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: <span className="text-foreground">August 31, 2025</span>
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-6 pb-20">
        <div className="space-y-10 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p className="text-foreground/90">
              Our goal is to ensure you have a positive experience with KarmAnk. This policy explains
              how refunds, cancellations, and billing disputes are handled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Eligibility for Refunds</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Refunds are considered for duplicate charges or confirmed technical issues.</li>
              <li>Personal dissatisfaction with interpretive outcomes (e.g., readings) may not qualify.</li>
              <li>Requests must be made within 7 days of the original charge unless required otherwise by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Subscriptions & Cancellations</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>You can cancel your subscription at any time from your account settings.</li>
              <li>Cancellation stops future billing; past charges are non-refundable unless required by law.</li>
              <li>Access to premium features will continue until the end of the current billing period.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How to Request a Refund</h2>
            <p className="text-foreground/90">
              Contact us at{" "}
              <a href="mailto:billing@karmank.com" className="text-auric-gold hover:underline">
                billing@karmank.com
              </a>{" "}
              with your account email, transaction ID, and a brief description of the issue.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Chargebacks</h2>
            <p className="text-foreground/90">
              If you file a chargeback before contacting us, we may restrict your account during the
              investigation. We encourage you to reach out first so we can help.
            </p>
          </section>

          <div className="pt-6 border-t border-white/10 flex justify-between text-sm text-muted-foreground">
            <Link to="/" className="hover:text-auric-gold">← Back to Home</Link>
            <span>© {new Date().getFullYear()} KarmAnk</span>
          </div>
        </div>
      </section>
    </main>
  );
}

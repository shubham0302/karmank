import React from "react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <main className="min-h-screen bg-black/90 text-foreground">
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
        <div className="container mx-auto max-w-4xl px-6 py-14">
          <div className="flex items-center gap-4">
            <img src="/karmank-logo.png" alt="KarmAnk" className="h-10 w-auto select-none" />
            <h1 className="text-3xl lg:text-4xl font-serif font-bold bg-gradient-auric bg-clip-text text-transparent">
              Terms & Conditions
            </h1>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: <span className="text-foreground">August 31, 2025</span>
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-6 pb-20">
        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="mb-2 text-sm uppercase tracking-wider text-muted-foreground">On this page</p>
          <nav className="grid gap-2 text-sm">
            <a href="#acceptance" className="hover:text-auric-gold">Acceptance of Terms</a>
            <a href="#eligibility" className="hover:text-auric-gold">Eligibility</a>
            <a href="#accounts" className="hover:text-auric-gold">Accounts & Security</a>
            <a href="#license" className="hover:text-auric-gold">License & Restrictions</a>
            <a href="#disclaimer" className="hover:text-auric-gold">Disclaimers</a>
            <a href="#liability" className="hover:text-auric-gold">Limitation of Liability</a>
            <a href="#termination" className="hover:text-auric-gold">Termination</a>
            <a href="#governing" className="hover:text-auric-gold">Governing Law</a>
          </nav>
        </div>

        <div className="space-y-10 leading-relaxed">
          <section id="acceptance">
            <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
            <p className="text-foreground/90">
              By accessing or using KarmAnk, you agree to be bound by these Terms. If you do not agree,
              do not use the service.
            </p>
          </section>

          <section id="eligibility">
            <h2 className="text-xl font-semibold mb-3">Eligibility</h2>
            <p className="text-foreground/90">
              You must have the legal capacity to enter into these Terms and comply with all applicable
              laws and regulations in your jurisdiction.
            </p>
          </section>

          <section id="accounts">
            <h2 className="text-xl font-semibold mb-3">Accounts & Security</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>You are responsible for maintaining the confidentiality of your credentials.</li>
              <li>You must promptly notify us of any unauthorized use of your account.</li>
              <li>We may suspend or terminate accounts for violations of these Terms.</li>
            </ul>
          </section>

          <section id="license">
            <h2 className="text-xl font-semibold mb-3">License & Restrictions</h2>
            <p className="text-foreground/90">
              We grant you a limited, non-exclusive, non-transferable license to use KarmAnk for
              personal or authorized business purposes. You agree not to reverse engineer, resell,
              or misuse the services.
            </p>
          </section>

          <section id="disclaimer">
            <h2 className="text-xl font-semibold mb-3">Disclaimers</h2>
            <p className="text-foreground/90">
              KarmAnk is provided on an “as is” and “as available” basis. We do not warrant that
              the service will be uninterrupted, error-free, or meet your expectations.
            </p>
          </section>

          <section id="liability">
            <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
            <p className="text-foreground/90">
              To the maximum extent permitted by law, KarmAnk shall not be liable for indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits or data.
            </p>
          </section>

          <section id="termination">
            <h2 className="text-xl font-semibold mb-3">Termination</h2>
            <p className="text-foreground/90">
              We may suspend or terminate access to the service at any time, with or without cause.
            </p>
          </section>

          <section id="governing">
            <h2 className="text-xl font-semibold mb-3">Governing Law</h2>
            <p className="text-foreground/90">
              These Terms shall be governed by the laws applicable in your jurisdiction unless otherwise
              required by mandatory law.
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

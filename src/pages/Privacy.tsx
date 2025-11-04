import React from "react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <main className="min-h-screen bg-black/90 text-foreground">
      {/* Hero / Header */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
        <div className="container mx-auto max-w-4xl px-6 py-14">
          <div className="flex items-center gap-4">
            <img
              src="/karmank-logo.png"
              alt="KarmAnk"
              className="h-10 w-auto select-none"
            />
            <h1 className="text-3xl lg:text-4xl font-serif font-bold bg-gradient-auric bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: <span className="text-foreground">August 31, 2025</span>
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto max-w-4xl px-6 pb-20">
        {/* TOC */}
        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="mb-2 text-sm uppercase tracking-wider text-muted-foreground">On this page</p>
          <nav className="grid gap-2 text-sm">
            <a href="#intro" className="hover:text-auric-gold">Introduction</a>
            <a href="#data-we-collect" className="hover:text-auric-gold">Data We Collect</a>
            <a href="#how-we-use" className="hover:text-auric-gold">How We Use Data</a>
            <a href="#cookies" className="hover:text-auric-gold">Cookies & Tracking</a>
            <a href="#sharing" className="hover:text-auric-gold">Sharing & Disclosure</a>
            <a href="#security" className="hover:text-auric-gold">Security</a>
            <a href="#your-rights" className="hover:text-auric-gold">Your Rights</a>
            <a href="#contact" className="hover:text-auric-gold">Contact</a>
          </nav>
        </div>

        <div className="space-y-10 leading-relaxed">
          <section id="intro">
            <h2 className="text-xl font-semibold mb-3">Introduction</h2>
            <p className="text-foreground/90">
              KarmAnk (“we”, “our”, “us”) respects your privacy. This policy describes what data
              we collect, how we use it, and the choices you have. By using our services, you agree to
              this Privacy Policy.
            </p>
          </section>

          <section id="data-we-collect">
            <h2 className="text-xl font-semibold mb-3">Data We Collect</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li><span className="font-medium">Account & Contact:</span> name, email address, and credentials you provide.</li>
              <li><span className="font-medium">Usage:</span> pages viewed, interactions, device & browser info.</li>
              <li><span className="font-medium">Content:</span> inputs you provide for numerology features (e.g., name, DOB).</li>
              <li><span className="font-medium">Log & Diagnostics:</span> IP, timestamps, app logs for security and reliability.</li>
            </ul>
          </section>

          <section id="how-we-use">
            <h2 className="text-xl font-semibold mb-3">How We Use Data</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Provide, personalize, and improve KarmAnk features.</li>
              <li>Authenticate accounts and secure the platform.</li>
              <li>Communicate updates, respond to support, and send notices.</li>
              <li>Analyze performance and prevent abuse.</li>
            </ul>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-semibold mb-3">Cookies & Tracking</h2>
            <p className="text-foreground/90">
              We use cookies and similar technologies for authentication, preferences, and analytics.
              You can control cookies via your browser settings; some features may not work without them.
            </p>
          </section>

          <section id="sharing">
            <h2 className="text-xl font-semibold mb-3">Sharing & Disclosure</h2>
            <p className="text-foreground/90">
              We don’t sell your personal data. We may share limited data with trusted processors
              (e.g., hosting, analytics) under strict agreements, or when required by law or to protect
              rights, safety, and integrity.
            </p>
          </section>

          <section id="security">
            <h2 className="text-xl font-semibold mb-3">Security</h2>
            <p className="text-foreground/90">
              We implement reasonable safeguards to protect your information. However, no method of
              transmission or storage is 100% secure.
            </p>
          </section>

          <section id="your-rights">
            <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
            <p className="text-foreground/90">
              Depending on your region, you may request access, correction, deletion, or portability of
              your data, or object to processing. Contact us to exercise these rights.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-foreground/90">
              Questions? Reach us at{" "}
              <a href="mailto:support@karmank.com" className="text-auric-gold hover:underline">
                support@karmank.com
              </a>.
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

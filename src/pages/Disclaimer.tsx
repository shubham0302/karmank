// src/pages/Disclaimer.tsx
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Disclaimer() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* soft stars if you want: <StarfieldBackground density={80} className="absolute inset-0 opacity-20" /> */}

      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl p-8 md:p-12 shadow-[0_30px_120px_rgba(88,28,135,0.25)]">
          <h1 className="text-3xl md:text-5xl font-serif tracking-wide mb-8 bg-gradient-auric bg-clip-text text-transparent">
            Disclaimer
          </h1>

          <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
            <p>
              The content and insights provided by <span className="text-foreground font-semibold">KarmAnk</span> are
              intended for educational, inspirational, and entertainment purposes only. While we strive for accuracy and
              depth in our numerological interpretations, these readings should not be considered a substitute for
              professional advice in fields such as finance, health, legal, or psychological matters.
            </p>
            <p>
              You are encouraged to use your own judgment and intuition when applying the knowledge shared here. KarmAnk
              and its creators shall not be held responsible for any decisions or outcomes resulting from the use of this
              platform.
            </p>
            <p>
              By accessing and using this service, you acknowledge and agree to this disclaimer.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto border-primary/40 text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>

            <Link to="/" className="w-full sm:w-auto">
              <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Home className="mr-2 h-4 w-4" />
                Return to Cosmic Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} KarmAnk — Sacred Technology
        </p>
      </main>
    </div>
  );
}

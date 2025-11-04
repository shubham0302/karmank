import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { StarfieldBackground } from '@/components/StarfieldBackground';
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <StarfieldBackground density={100} />
      
      <div className="relative z-10 text-center max-w-md mx-auto">
        <GlassCard variant="cosmic">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-serif font-bold bg-gradient-auric bg-clip-text text-transparent">
                404
              </h1>
              <h2 className="text-xl font-serif">Lost in the Cosmic Void</h2>
              <p className="text-muted-foreground">
                The cosmic path you seek doesn't exist in this dimension.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/app')}
                className="w-full bg-gradient-auric text-cosmic-blue font-semibold hover-sweep"
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Cosmic Dashboard
              </Button>
              
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full border-primary/30 hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              "All paths lead to enlightenment, but some are more direct than others."
              <br />
              <em>- Ancient Cosmic Wisdom</em>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default NotFound;

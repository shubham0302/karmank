// src/pages/AppShell.tsx
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import { Crown, MessageCircle, LogOut, ArrowLeft } from "lucide-react";
import cosmicBg from "@/assets/cosmic-hero-bg.jpg"; // ✅ background image

export default function AppShell() {
  const { user, logout, language, setLanguage } = useAppStore();
  const [showChatbot, setShowChatbot] = useState(false);
  const nav = useNavigate();

  const languages = [
    { code: "en" as const, label: "English", flag: "🇺🇸" },
    { code: "hi" as const, label: "हिंदी", flag: "🇮🇳" },
    { code: "en-hi" as const, label: "Hinglish", flag: "🌏" },
  ];

  const getPlanColor = (plan?: string) =>
    plan === "Pro"
      ? "text-auric-gold"
      : plan === "Supreme"
      ? "text-cosmic-glow"
      : "text-stardust";

  const getPlanIcon = (plan?: string) =>
    plan === "Pro" || plan === "Supreme" ? <Crown className="h-3 w-3" /> : null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ========= BACKGROUND STACK (bottom → top) ========= */}
      {/* 1) Cosmic image (CSS background = most reliable) */}
      <div
        className="absolute inset-0 -z-40 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${cosmicBg})` }}
        aria-hidden
      />

      {/* 2) Gentle dark gradient for readability */}
      <div className="absolute inset-0 -z-30 bg-gradient-to-b from-[#050a1acc] via-transparent to-[#050a1aee]" aria-hidden />

      {/* 3) Starfield (transparent, blended so image is visible) */}
      <div className="absolute inset-0 -z-20 pointer-events-none mix-blend-screen opacity-80" aria-hidden>
        {/* If your StarfieldBackground draws a solid fill, ensure it clears with transparent.
           Wrapping here with mix-blend-screen + opacity ensures the photo shows through. */}
        <StarfieldBackground density={80} />
      </div>
      {/* ================================================ */}

      {/* ======= APP CHROME (header, content, etc.) ======= */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header className="border-b border-white/15 backdrop-blur-xl bg-black/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Back + Brand */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => nav("/welcome")}
                  className="px-2"
                  title="Back to Welcome"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>

                <div className="h-5 w-px bg-white/15 mx-1" />

                <h1 className="text-2xl font-serif font-bold bg-gradient-auric bg-clip-text text-transparent">
                  KarmAnk
                </h1>
                <div className="text-xs text-muted-foreground">Cosmic Numerology</div>
              </div>

              {/* Right: language + user + logout (+ upgrade) */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center rounded-lg border border-white/15 bg-black/30 backdrop-blur px-1">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={language === lang.code ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setLanguage(lang.code)}
                      className={`px-2 py-1 text-xs rounded-lg ${
                        language === lang.code
                          ? "bg-auric-gold/20 text-auric-gold"
                          : "text-foreground/70 hover:text-foreground"
                      }`}
                    >
                      <span className="mr-1">{lang.flag}</span>
                      <span className="hidden sm:inline">{lang.label}</span>
                    </Button>
                  ))}
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div className={`text-xs flex items-center justify-end space-x-1 ${getPlanColor(user?.plan)}`}>
                      {getPlanIcon(user?.plan)}
                      <span>{user?.plan} Plan</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="flex items-center space-x-1 border-white/25 hover:bg-white/10"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>

                {user?.plan === "Free" && (
                  <Button className="bg-gradient-auric text-cosmic-blue font-semibold hover-sweep">
                    <Crown className="h-4 w-4 mr-1" />
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 container mx-auto px-4 py-6 overflow-auto">
          <Outlet />
        </main>

        {/* Floating Chatbot (optional) */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setShowChatbot((s) => !s)}
            className={`rounded-full w-14 h-14 shadow-2xl ${
              showChatbot ? "bg-cosmic-glow text-white" : "bg-gradient-auric text-cosmic-blue"
            } hover:scale-110 transition-all duration-200`}
            title="Cosmic Guide"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>

        {showChatbot && (
          <div className="fixed bottom-24 right-6 w-80 h-96 z-40">
            <GlassCard variant="elevated" className="h-full">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-semibold">Cosmic Guide</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowChatbot(false)}>
                    ×
                  </Button>
                </div>
                <div className="flex-1 text-center text-sm text-muted-foreground">
                  Chatbot coming soon! Ask me about numerology, compatibility, and cosmic wisdom.
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
      {/* ================================================ */}
    </div>
  );
}

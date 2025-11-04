import React from "react";
import cosmicBg from "@/assets/cosmic-hero-bg.jpg";
import cosmicLoop from "@/assets/cosmic_loop.mp4"; // 🎥 your video loop
// import { StarfieldBackground } from "@/components/StarfieldBackground";

type Props = {
  children: React.ReactNode;
  withStars?: boolean; // optional star overlay
  className?: string;
  useVideo?: boolean;  // ✅ toggle between video and static image
};

export default function CosmicBackground({
  children,
  withStars = false,
  className = "",
  useVideo = true, // default to video if available
}: Props) {
  return (
    <div className={`relative min-h-[100dvh] overflow-hidden ${className}`}>
      {/* 🎥 Background video or 🖼️ fallback image */}
      {useVideo ? (
        <video
          src={cosmicLoop}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 z-[-30] h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none select-none absolute inset-0 z-[-30] bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: `url(${cosmicBg})` }}
        />
      )}

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 z-[-20] bg-gradient-to-b from-[#050a1acc] via-transparent to-[#050a1aee]" />

      {/* Optional starfield overlay */}
      {/* {withStars && (
        <div className="absolute inset-0 z-[-10] pointer-events-none">
          <StarfieldBackground density={120} className="!bg-transparent" />
        </div>
      )} */}

      {/* Foreground content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

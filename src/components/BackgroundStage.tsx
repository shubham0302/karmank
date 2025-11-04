import React from "react";
import cosmicBg from "@/assets/cosmic-hero-bg.jpg"; 
import sacred from "@/assets/sacred-geometry.png";  
import cosmicLoop from "@/assets/cosmic_loop.mp4"; // 🎥 your MP4 cosmic loop

type Props = {
  imageSrc?: string;                  // fallback static image
  videoSrc?: string;                  // optional video loop background
  showGeometry?: boolean;             // overlay sacred geometry
  gradient?: "none" | "soft" | "deep";
  blur?: boolean;
  overlayColor?: string;              // e.g. "rgba(0,255,255,0.08)"
  className?: string;
};

export default function BackgroundStage({
  imageSrc = cosmicBg,
  videoSrc = cosmicLoop, // ✅ default cosmic loop
  showGeometry = false,
  gradient = "soft",
  blur = false,
  overlayColor,
  className = "",
}: Props) {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* 🎥 Video cosmic loop (preferred) */}
      {videoSrc ? (
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className={`absolute inset-0 h-full w-full object-cover ${
            blur ? "blur-[1.5px]" : ""
          }`}
        />
      ) : (
        // 🖼️ Fallback static image
        <img
          src={imageSrc}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover ${
            blur ? "blur-[1.5px]" : ""
          }`}
          draggable={false}
        />
      )}

      {/* ✨ Sacred geometry overlay */}
      {showGeometry && (
        <img
          src={sacred}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.08] mix-blend-screen pointer-events-none"
          draggable={false}
        />
      )}

      {/* 🌈 Optional color overlay */}
      {overlayColor && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: overlayColor }}
        />
      )}

      {/* 🌌 Vignette / gradient */}
      {gradient !== "none" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              gradient === "deep"
                ? "radial-gradient(1200px 800px at 50% 50%, rgba(10,22,64,0.0) 30%, rgba(5,10,24,0.55) 85%)"
                : "radial-gradient(1000px 700px at 50% 50%, rgba(10,22,64,0.0) 35%, rgba(5,10,24,0.38) 85%)",
          }}
        />
      )}
    </div>
  );
}

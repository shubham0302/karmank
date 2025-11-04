import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Pause, Square } from "lucide-react";

type Props = {
  textToSpeak: string;
  language?: string; // e.g., "en-US", "hi-IN"
};

export default function SpeechControl({ textToSpeak, language = "en-US" }: Props) {
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const ensureUtterance = () => {
    if (!utterRef.current) {
      const u = new SpeechSynthesisUtterance(textToSpeak.replace(/\*/g, ""));
      u.lang = language;
      u.onend = () => { setSpeaking(false); setPaused(false); };
      utterRef.current = u;
    }
    return utterRef.current;
  };

  const handlePlay = () => {
    if (!("speechSynthesis" in window)) return;
    const u = ensureUtterance();
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const handlePause = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const handleStop = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
    utterRef.current = null;
  };

  return (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="ghost" onClick={handlePlay} title="Speak">
        <Volume2 className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handlePause} title="Pause">
        <Pause className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleStop} title="Stop">
        <Square className="h-4 w-4" />
      </Button>
    </div>
  );
}

// src/components/PremiumModal.tsx
import React from "react";
import { Star, X } from "lucide-react";

export default function PremiumModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl p-8 max-w-md w-full relative text-white text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
          <X size={24} />
        </button>
        <div className="mb-4">
          <Star size={48} className="mx-auto text-white animate-pulse" />
        </div>
        <h3 className="text-3xl font-bold mb-4">Unlock Your Full Potential</h3>
        <p className="mb-6">
          Upgrade to Premium to access your complete report, generate unlimited profiles, and unlock advanced insights.
        </p>
        <button className="w-full bg-white text-orange-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-transform hover:scale-105">
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
}

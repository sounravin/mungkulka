import React from 'react';
import { Disc } from 'lucide-react';

export interface VintageVinylPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
  lang: 'km' | 'en';
  variant?: 'full' | 'compact' | 'dark';
}

export const VintageVinylPlayer: React.FC<VintageVinylPlayerProps> = ({
  isPlaying,
  onToggle,
  lang,
  variant = 'compact',
}) => {
  return (
    <div
      onClick={onToggle}
      className={`relative cursor-pointer select-none group flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-300 ${
        variant === 'dark'
          ? 'bg-black/75 backdrop-blur-md border border-amber-400/40 text-amber-200 shadow-sm hover:bg-black/90'
          : 'bg-white/95 backdrop-blur-md border border-amber-300/70 text-stone-800 shadow-2xs hover:border-amber-400'
      }`}
      title={
        isPlaying
          ? lang === 'km'
            ? 'ចុចដើម្បីបិទតន្ត្រី (Stop Music)'
            : 'Click to Pause Music'
          : lang === 'km'
          ? 'ចុចដើម្បីចាក់តន្ត្រី (Play Music)'
          : 'Click to Play Music'
      }
    >
      {/* Floating Animated Musical Note Particles when Playing */}
      {isPlaying && (
        <div className="absolute -top-2.5 left-2 z-30 pointer-events-none flex space-x-0.5">
          <span className="text-amber-400 text-[10px] font-bold animate-bounce">♪</span>
          <span className="text-[#D4AF37] text-[10px] font-bold animate-pulse delay-150">♫</span>
        </div>
      )}

      {/* Disc & Tonearm Wrapper Container */}
      <div className="relative w-5 h-5 sm:w-6 sm:h-6 shrink-0 flex items-center justify-center">
        {/* Tonearm (Gramophone Needle Arm) */}
        <div
          className={`absolute -top-0.5 -right-0.5 z-20 w-3 h-3.5 pointer-events-none transition-transform duration-500 origin-top-right ${
            isPlaying ? 'rotate-[18deg]' : 'rotate-[-14deg]'
          }`}
        >
          {/* Metallic Needle Lever */}
          <div className="w-0.5 h-2.5 bg-gradient-to-b from-stone-300 via-amber-200 to-amber-600 rounded-full mx-auto shadow-xs" />
          {/* Cartridge Pickup Head */}
          <div className="w-1 h-1 bg-[#B8860B] rounded-2xs mx-auto border border-amber-200 shadow-2xs" />
        </div>

        {/* Ambient Golden Glow ring when playing */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-full bg-amber-400/40 blur-xs animate-pulse" />
        )}

        {/* Vintage Vinyl Disc Record */}
        <div
          className={`relative w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 rounded-full bg-stone-950 border border-stone-800 shadow-inner flex items-center justify-center transition-all ${
            isPlaying ? 'animate-[spin_3.5s_linear_infinite]' : 'group-hover:scale-105'
          }`}
          style={{
            backgroundImage: `radial-gradient(circle, #2a2a2a 0%, #0f0f0f 35%, #1a1a1a 50%, #080808 75%, #000000 100%)`,
          }}
        >
          {/* Vinyl Concentric Ring Grooves */}
          <div className="absolute inset-0.5 rounded-full border border-stone-800/80 pointer-events-none" />

          {/* Golden Album Center Label */}
          <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-[#8C6D3B] via-[#FFE8A3] to-[#B8860B] p-0.5 flex items-center justify-center border border-amber-300 shadow-2xs z-10">
            <div className="w-full h-full rounded-full bg-[#3D2513] flex items-center justify-center">
              <Disc className={`w-1.5 h-1.5 text-amber-300 ${isPlaying ? 'animate-spin' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Text Label Status Pill */}
      <div className="flex items-center gap-1 pr-1">
        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-amber-500'}`} />
        <span className="text-[9px] font-bold whitespace-nowrap">
          {isPlaying
            ? lang === 'km'
              ? 'ចាក់ចម្រៀង'
              : 'Playing'
            : lang === 'km'
            ? 'បិទចម្រៀង'
            : 'Paused'}
        </span>
      </div>
    </div>
  );
};

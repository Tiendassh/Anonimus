import React, { useState } from "react";
import { Smartphone, Monitor, ShieldCheck, Wifi, Battery } from "lucide-react";

interface DeviceWrapperProps {
  children: React.ReactNode;
}

export default function DeviceWrapper({ children }: DeviceWrapperProps) {
  const [useDeviceFrame, setUseDeviceFrame] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-200 antialiased flex flex-col items-center justify-center p-0 md:p-4 select-none">
      {/* Top action bar to toggle frame on desktop */}
      <div className="hidden md:flex items-center gap-4 mb-4 z-50">
        <button
          onClick={() => setUseDeviceFrame(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            useDeviceFrame
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
              : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
          }`}
          id="toggle-device-frame-mobile"
        >
          <Smartphone className="w-3.5 h-3.5" />
          Vista Móvil (iPhone/Android)
        </button>
        <button
          onClick={() => setUseDeviceFrame(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            !useDeviceFrame
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
              : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
          }`}
          id="toggle-device-frame-desktop"
        >
          <Monitor className="w-3.5 h-3.5" />
          Modo Pantalla Completa
        </button>
      </div>

      {useDeviceFrame ? (
        /* Highly elegant, physical iPhone/Android responsive simulator frame */
        <div className="relative w-full max-w-[415px] h-[100vh] md:h-[840px] bg-neutral-950 border-0 md:border-[10px] border-neutral-800 md:rounded-[44px] shadow-2xl overflow-hidden flex flex-col ring-1 ring-neutral-700/30">
          {/* Mobile phone notch/island (only visible on desktop wrapper) */}
          <div className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-neutral-950 rounded-b-2xl z-50">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-neutral-900 rounded-full border border-neutral-800/40"></div>
          </div>

          {/* Simulated Mobile Status Bar */}
          <div className="flex justify-between items-center px-6 pt-3 pb-1 bg-neutral-950/90 text-[10px] font-mono tracking-widest text-neutral-400 select-none z-40 border-b border-neutral-900 shrink-0">
            <span className="font-semibold text-neutral-300">ANON_NET</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500 animate-pulse" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-neutral-300" />
            </div>
          </div>

          {/* Child content render box */}
          <div className="relative flex-1 flex flex-col overflow-hidden bg-neutral-950">
            {children}
          </div>

          {/* Simulated Bottom Home Indicator (only visible on desktop wrap) */}
          <div className="hidden md:block absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-neutral-700/50 rounded-full z-50"></div>
        </div>
      ) : (
        /* Wide Layout for standard presentation */
        <div className="w-full max-w-5xl h-[880px] bg-neutral-950 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
          {/* Custom Header */}
          <div className="flex justify-between items-center px-6 py-3 bg-neutral-900/60 border-b border-neutral-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="font-mono text-xs font-semibold tracking-widest text-emerald-400">ANONSPHERE // SECURE NETWORK ACTIVE</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">HOST SHIELD LEVEL: PROXIED CASCADE SSL</span>
          </div>

          {/* Render content */}
          <div className="relative flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

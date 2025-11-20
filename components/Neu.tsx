
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface NeuProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: (e?: any) => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  inset?: boolean;
  primary?: boolean;
  circle?: boolean;
  type?: "button" | "submit" | "reset";
}

// Design System: Siri Matte Black
// Background: #0e1014
// Surface: #181b21
// Accents: Cyan/Teal

export const NeuCard: React.FC<NeuProps> = ({ children, className = "", inset = false, onClick, title }) => {
  const baseStyle = "relative rounded-[2rem] transition-all duration-300 ease-out border border-white/[0.02] overflow-hidden";
  
  let surfaceStyle = "";
  if (inset) {
      // Pressed/Carved In Look
      surfaceStyle = "bg-[#131519] shadow-neu-pressed";
  } else {
      // Floating Plate Look
      surfaceStyle = "bg-[#181b21] shadow-neu-flat";
  }

  return (
    <div 
      onClick={onClick}
      title={title}
      className={twMerge(baseStyle, surfaceStyle, className)}
    >
      {children}
    </div>
  );
};

export const NeuButton: React.FC<NeuProps & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ 
  children, 
  className = "", 
  onClick, 
  circle = false, 
  active = false,
  primary = false,
  disabled = false,
  type = "button",
  ...props
}) => {
  const shape = circle ? "w-12 h-12 rounded-full p-0 flex items-center justify-center" : "px-6 py-3.5 rounded-2xl";
  
  let style = "";
  
  if (primary) {
     // Primary: Glowing Teal Action
     style = `
        bg-gradient-to-br from-cyan-500 to-teal-600 text-white font-bold tracking-wide
        shadow-[0_10px_20px_-5px_rgba(45,212,191,0.4)]
        hover:shadow-[0_0_25px_rgba(45,212,191,0.6)] hover:translate-y-[-2px]
        active:translate-y-[1px] active:shadow-none
        border border-white/10
     `;
  } else if (active) {
      // Active State: Pressed In + Glow
      style = `
        bg-[#131519] text-cyan-400
        shadow-neu-pressed
        border border-cyan-500/20
      `;
  } else {
     // Default: Matte Coal Button
     style = `
        bg-[#181b21] text-slate-400 font-medium
        shadow-neu-flat
        border border-white/[0.02]
        hover:text-cyan-400 hover:-translate-y-[2px] hover:shadow-[10px_10px_20px_#0b0d10,-10px_-10px_20px_#252932]
        active:shadow-neu-pressed active:translate-y-[0px]
     `;
  }

  if (disabled) {
      style = "opacity-50 cursor-not-allowed pointer-events-none bg-[#181b21] text-slate-600 shadow-none border border-white/5";
  }

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={twMerge("relative transition-all duration-300 ease-out outline-none flex items-center justify-center gap-2", shape, style, className)}
      {...props}
    >
      {children}
    </button>
  );
};

export const NeuInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <div className="relative group w-full">
       <input
          className={twMerge(
            "relative w-full bg-[#131519] text-slate-200 px-5 py-4 rounded-2xl outline-none border border-white/[0.02]",
            "shadow-neu-pressed", // The "Carved" look
            "placeholder:text-slate-600 font-medium",
            "focus:text-cyan-50 focus:shadow-[inset_5px_5px_10px_#090a0c,inset_-5px_-5px_10px_#1e2126] focus:border-cyan-500/30",
            "transition-all duration-300",
            className
          )}
          {...props}
       />
    </div>
  );
};

export const NeuSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => {
  return (
     <div className="relative group w-full">
        <select
            className={twMerge(
                "w-full appearance-none bg-[#131519] text-slate-200 px-5 py-4 rounded-2xl outline-none border border-white/[0.02]",
                "shadow-neu-pressed",
                "focus:text-cyan-50 focus:border-cyan-500/30 transition-all cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-cyan-400 transition-colors">
            <svg width="12" height="8" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
     </div>
  );
};

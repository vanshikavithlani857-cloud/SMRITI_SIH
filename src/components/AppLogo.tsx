import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtext?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  subtext,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Visual Logo Emblem */}
      <div className={`relative ${sizeMap[size]} shrink-0 rounded-2xl overflow-hidden shadow-md shadow-emerald-950/20 ring-2 ring-amber-500/80 group cursor-pointer transition-transform duration-200 active:scale-95 bg-emerald-950`}>
        <img
          src="/logo.svg"
          alt="Smriti Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Subtle North-East Eri Silk & Gamosa edge accent */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-emerald-600 opacity-90" />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center space-x-1.5">
            <span className="font-black text-stone-900 tracking-tight text-base sm:text-lg leading-tight font-sans">
              Smriti
            </span>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300/90 px-1 py-0.2 rounded leading-none">
              स्मृति • স্মৃতি
            </span>
          </div>
          {subtext && (
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-900/70 leading-tight truncate mt-0.5">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';

interface LotusLogoProps {
  variant?: 'header' | 'footer' | 'hero-badge' | 'inverted' | 'stacked' | 'emblem-only';
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LotusLogo: React.FC<LotusLogoProps> = ({
  variant = 'header',
  className = '',
  onClick,
  size = 'md',
}) => {
  // Support custom uploaded raster image if user places logo.png into public/assets/
  const [useUploadedRaster, setUseUploadedRaster] = useState<boolean>(true);

  // Sizing configurations
  const fullBadgeHeights = {
    sm: 'h-12',
    md: 'h-14 sm:h-16',
    lg: 'h-24 sm:h-28',
    xl: 'h-32 sm:h-36',
  };

  const emblemSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const isStacked = variant === 'stacked' || variant === 'footer' || variant === 'hero-badge';
  const isEmblemOnly = variant === 'emblem-only';

  return (
    <div
      onClick={onClick}
      className={`select-none group ${onClick ? 'cursor-pointer' : ''} ${
        isStacked ? 'flex flex-col items-start' : 'flex items-center gap-3'
      } ${className}`}
      role="banner"
      aria-label="Lotus Grand Hotel"
    >
      {/* Footer / Stacked Variant: Renders the complete vertical 3D crest logo matching the uploaded design */}
      {isStacked ? (
        <div className="flex flex-col items-start justify-center">
          <img
            src="/assets/lotus-grand-logo.svg"
            alt="Lotus Grand Logo"
            className={`${fullBadgeHeights[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_8px_20px_rgba(224,195,123,0.25)]`}
            referrerPolicy="no-referrer"
          />
        </div>
      ) : isEmblemOnly ? (
        /* Emblem only */
        <div className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <img
            src="/assets/lotus-grand-emblem.svg"
            alt="Lotus Grand Golden Emblem"
            className={`${emblemSizes[size]} object-contain drop-shadow-[0_4px_12px_rgba(224,195,123,0.35)]`}
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        /* Header Horizontal Lockup: 3D Metallic Emblem + Crisp Regal Cinzel 'LOTUS' and '~ GRAND ~' */
        <div className="flex items-center gap-3">
          <div className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <img
              src="/assets/lotus-grand-emblem.svg"
              alt="Lotus Grand Golden Emblem"
              className={`${emblemSizes[size]} object-contain drop-shadow-[0_4px_12px_rgba(224,195,123,0.4)]`}
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex flex-col justify-center select-none">
            {/* "LOTUS" with Metallic 3D Gold Fill and Crisp Tracking */}
            <div className="flex items-center leading-none">
              <span
                className={`font-['Cinzel',serif] tracking-[0.2em] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5A5] via-[#E5AA2B] to-[#996205] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${
                  size === 'sm'
                    ? 'text-base'
                    : size === 'lg'
                    ? 'text-2xl sm:text-3xl'
                    : size === 'xl'
                    ? 'text-3xl sm:text-4xl'
                    : 'text-xl sm:text-2xl'
                }`}
              >
                LOTUS
              </span>
            </div>

            {/* "~ GRAND ~" with matching Calligraphic Flourishes */}
            <div className="flex items-center gap-1.5 leading-none mt-1">
              <svg
                className="w-4 h-1.5 text-[#E0C37B]/90 shrink-0"
                viewBox="0 0 20 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 3C5 0 9 6 14 3C11 2 7 4 3 2.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle cx="1" cy="3" r="0.9" fill="currentColor" />
              </svg>

              <span
                className={`font-['Cinzel',serif] tracking-[0.32em] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#E0C37B] to-[#B37E18] drop-shadow-xs ${
                  size === 'sm'
                    ? 'text-[8px]'
                    : size === 'lg'
                    ? 'text-xs sm:text-sm'
                    : size === 'xl'
                    ? 'text-sm sm:text-base'
                    : 'text-[10px] sm:text-[11px]'
                }`}
              >
                GRAND
              </span>

              <svg
                className="w-4 h-1.5 text-[#E0C37B]/90 shrink-0"
                viewBox="0 0 20 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 3C15 0 11 6 6 3C9 2 13 4 17 2.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle cx="19" cy="3" r="0.9" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

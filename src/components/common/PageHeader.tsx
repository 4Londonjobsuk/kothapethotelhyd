import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { NavPage } from '../../types';

interface PageHeaderProps {
  page: NavPage;
  eyebrow?: string;
  title: string;
  subtitle: string;
  scriptText?: string;
  bgImage: string;
  onNavigate?: (page: NavPage) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  scriptText,
  bgImage,
  onNavigate,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[340px] md:min-h-[420px] flex items-center bg-[#071324] text-white overflow-hidden">
      {/* Background Image with warm dusk gradient overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          src={bgImage}
          alt={title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
          initial={shouldReduceMotion ? { scale: 1 } : { scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/65 to-transparent" />
        <div className="absolute inset-0 bg-[#0A1830]/35 mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-14 md:pt-32 md:pb-20 relative z-10 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-3xl">
            {/* Breadcrumb or Eyebrow */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-amber-200/90 font-medium mb-3"
            >
              {onNavigate && (
                <>
                  <button
                    onClick={() => onNavigate('home')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Home
                  </button>
                  <span className="text-stone-400">/</span>
                </>
              )}
              <span>{eyebrow || title}</span>
            </motion.div>

            {/* Main Header Title */}
            <motion.h1
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white leading-tight"
            >
              {title}
            </motion.h1>

            {/* Subtitle Description */}
            <motion.p
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="mt-3 text-base sm:text-lg text-stone-200 font-light max-w-2xl leading-relaxed"
            >
              {subtitle}
            </motion.p>
          </div>

          {/* Elegant Calligraphic Script Badge (Right side in mockups) */}
          {scriptText && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="hidden lg:flex flex-col items-end text-right pr-4 border-l border-amber-400/30 pl-8"
            >
              <span className="font-script-calligraphy text-3xl xl:text-4xl text-amber-200 leading-tight">
                {scriptText}
              </span>
              <motion.div
                initial={shouldReduceMotion ? { width: '3rem' } : { width: 0 }}
                animate={{ width: '3rem' }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="h-[1px] bg-amber-300/40 mt-2"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

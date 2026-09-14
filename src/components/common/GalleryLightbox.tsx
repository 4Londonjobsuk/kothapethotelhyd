import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryItem } from '../../types';
import { useBodyScrollLock } from './MotionWrapper';

interface GalleryLightboxProps {
  items: GalleryItem[];
  currentIndex: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  items,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isOpen = currentIndex !== null && !!items[currentIndex];
  useBodyScrollLock(isOpen);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (currentIndex === null || !items[currentIndex]) return null;
  const currentItem = items[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 45) {
      onPrev();
    } else if (diff < -45) {
      onNext();
    }
    setTouchStartX(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        id="gallery-lightbox-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md select-none"
        role="dialog"
        aria-modal="true"
        aria-label="Image gallery lightbox"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Bar Controls */}
        <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between text-white z-20">
          <div className="text-xs sm:text-sm font-medium tracking-wider uppercase text-amber-300/90">
            Lotus Grand Gallery · {currentIndex + 1} / {items.length}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white transition-all cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Previous Button */}
        <button
          onClick={onPrev}
          className="absolute left-3 sm:left-6 z-20 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white transition-all cursor-pointer hover:scale-105"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center Image with caption */}
        <motion.div
          key={currentItem.id || currentIndex}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="max-w-5xl max-h-[80vh] px-4 flex flex-col items-center justify-center z-10"
        >
          <img
            src={currentItem.image}
            alt={currentItem.alt}
            referrerPolicy="no-referrer"
            className="max-h-[72vh] w-auto max-w-full rounded shadow-2xl object-contain transition-transform"
          />
          <div className="mt-4 text-center">
            <h4 className="text-white text-base sm:text-lg font-serif">{currentItem.title}</h4>
            <span className="text-xs tracking-widest text-amber-300/80 uppercase font-medium">
              Category: {currentItem.category}
            </span>
          </div>
        </motion.div>

        {/* Next Button */}
        <button
          onClick={onNext}
          className="absolute right-3 sm:right-6 z-20 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white transition-all cursor-pointer hover:scale-105"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

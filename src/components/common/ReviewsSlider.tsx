import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, MessageSquare, ExternalLink } from 'lucide-react';
import { TestimonialItem } from '../../types';
import { useSiteSettings } from '../../hooks/useSiteSettings';

interface ReviewsSliderProps {
  reviews: TestimonialItem[];
}

export const ReviewsSlider: React.FC<ReviewsSliderProps> = ({ reviews }) => {
  const siteSettings = useSiteSettings();
  const shouldReduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-slide every 5 seconds, pausing on hover/interaction
  useEffect(() => {
    if (isPaused || reviews.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, reviews.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  if (!reviews || reviews.length === 0) return null;

  // Window of reviews to show (circular index)
  // We compute cards to show for multi-column layouts
  const getVisibleReviews = () => {
    const items: { item: TestimonialItem; originalIndex: number }[] = [];
    for (let i = 0; i < Math.min(3, reviews.length); i++) {
      const idx = (currentIndex + i) % reviews.length;
      items.push({ item: reviews[idx], originalIndex: idx });
    }
    return items;
  };

  return (
    <section
      id="guest-reviews-slider-section"
      className="mt-14 pt-10 border-t border-stone-200/80"
      aria-label="Guest Reviews"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header matching Image 1: OUR GUESTS LOVE US / What Our Guests Say */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
          OUR GUESTS LOVE US
        </span>
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-[#0D1E3A] tracking-tight">
          What Our Guests Say
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-stone-500 font-light flex items-center justify-center gap-1.5">
          <span>Verified reviews from travelers on</span>
          <span className="font-semibold text-stone-700 inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5 inline-block" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </span>
        </p>
      </div>

      {/* Slider Carousel Container */}
      <div
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows for Desktop & Tablet */}
        <div className="hidden sm:flex items-center justify-between absolute -top-12 right-0 space-x-2">
          <button
            onClick={handlePrev}
            aria-label="Previous review"
            className="w-8 h-8 rounded-full border border-stone-300 bg-white hover:bg-[#0D1E3A] hover:text-white hover:border-[#0D1E3A] text-stone-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next review"
            className="w-8 h-8 rounded-full border border-stone-300 bg-white hover:bg-[#0D1E3A] hover:text-white hover:border-[#0D1E3A] text-stone-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Reviews Track */}
        <div className="overflow-hidden py-2">
          {/* Desktop/Tablet 3-card sliding view */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {getVisibleReviews().map(({ item, originalIndex }) => (
              <motion.div
                key={`${item.id}-${originalIndex}`}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="bg-white p-7 rounded-xl shadow-xs border border-stone-200/90 flex flex-col justify-between hover:shadow-md transition-shadow duration-200 h-full"
              >
                <div>
                  {/* Stars */}
                  <div className="flex items-center justify-center gap-1 mb-4 text-[#E5A93C]">
                    {[...Array(item.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                    {[...Array(5 - item.rating)].map((_, idx) => (
                      <Star key={`empty-${idx}`} className="w-4 h-4 text-stone-300" />
                    ))}
                  </div>

                  {/* Travel type badge */}
                  {item.travelerType && (
                    <div className="text-center mb-3">
                      <span className="inline-block text-[11px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                        {item.travelerType}
                      </span>
                    </div>
                  )}

                  {/* Quote */}
                  <p className="text-sm text-stone-700 leading-relaxed text-center font-light italic line-clamp-6">
                    "{item.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-5 mt-5 border-t border-stone-100 text-center">
                  <h4 className="text-sm font-serif font-bold text-[#0D1E3A] uppercase tracking-wider">
                    {item.guestName}
                  </h4>
                  <div className="text-xs text-stone-500 mt-0.5 flex items-center justify-center gap-1">
                    <span>{item.timeAgo}</span>
                    <span>•</span>
                    <span className="text-[#1A73E8] font-medium">on Google</span>
                  </div>

                  {/* Highlights Pill */}
                  {item.highlights && (
                    <p className="text-[11px] text-[#C5A059] font-medium mt-2">
                      {item.highlights}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile & Tablet view (1 or 2 cards with smooth swipe & transitions) */}
          <div className="lg:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 sm:p-7 rounded-xl shadow-xs border border-stone-200/90 flex flex-col justify-between"
              >
                <div>
                  {/* Stars */}
                  <div className="flex items-center justify-center gap-1.5 mb-4 text-[#E5A93C]">
                    {[...Array(reviews[currentIndex].rating)].map((_, idx) => (
                      <Star key={idx} className="w-5 h-5 fill-current" />
                    ))}
                    {[...Array(5 - reviews[currentIndex].rating)].map((_, idx) => (
                      <Star key={`empty-${idx}`} className="w-5 h-5 text-stone-300" />
                    ))}
                  </div>

                  {/* Traveler type tag */}
                  {reviews[currentIndex].travelerType && (
                    <div className="text-center mb-3">
                      <span className="inline-block text-[11px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                        {reviews[currentIndex].travelerType}
                      </span>
                    </div>
                  )}

                  {/* Quote */}
                  <p className="text-sm sm:text-base text-stone-700 leading-relaxed text-center font-light italic">
                    "{reviews[currentIndex].quote}"
                  </p>

                  {/* Ratings Breakdown if present */}
                  {reviews[currentIndex].ratingsBreakdown && (
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-3 border-t border-stone-100 text-xs text-stone-600">
                      {reviews[currentIndex].ratingsBreakdown.rooms && (
                        <span>Rooms: <strong>{reviews[currentIndex].ratingsBreakdown.rooms}.0</strong></span>
                      )}
                      {reviews[currentIndex].ratingsBreakdown.service && (
                        <span>Service: <strong>{reviews[currentIndex].ratingsBreakdown.service}.0</strong></span>
                      )}
                      {reviews[currentIndex].ratingsBreakdown.location && (
                        <span>Location: <strong>{reviews[currentIndex].ratingsBreakdown.location}.0</strong></span>
                      )}
                    </div>
                  )}
                </div>

                {/* Author Info */}
                <div className="pt-5 mt-5 border-t border-stone-100 text-center">
                  <h4 className="text-sm font-serif font-bold text-[#0D1E3A] uppercase tracking-wider">
                    {reviews[currentIndex].guestName}
                  </h4>
                  <div className="text-xs text-stone-500 mt-0.5 flex items-center justify-center gap-1.5">
                    <span>{reviews[currentIndex].timeAgo}</span>
                    <span>•</span>
                    <span className="text-[#1A73E8] font-medium">on Google</span>
                  </div>

                  {reviews[currentIndex].highlights && (
                    <p className="text-xs text-[#C5A059] font-medium mt-1.5">
                      Hotel highlights: {reviews[currentIndex].highlights}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Bottom Controls: Prev, Dots, Next */}
        <div className="flex items-center justify-between mt-6 pt-2">
          {/* Mobile Arrows */}
          <button
            onClick={handlePrev}
            aria-label="Previous review"
            className="sm:hidden w-8 h-8 rounded-full border border-stone-300 bg-white text-stone-600 flex items-center justify-center active:bg-stone-100 cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mx-auto">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to review ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 bg-[#0D1E3A]'
                    : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next review"
            className="sm:hidden w-8 h-8 rounded-full border border-stone-300 bg-white text-stone-600 flex items-center justify-center active:bg-stone-100 cursor-pointer shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Google Maps Link */}
          <a
            href={siteSettings.googleMapsDirectionsUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-[#0D1E3A] hover:text-[#C5A059] transition-colors"
          >
            <span>Read all reviews on Google</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Mobile Google Maps Link */}
        <div className="sm:hidden text-center mt-4">
          <a
            href={siteSettings.googleMapsDirectionsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#0D1E3A] hover:underline"
          >
            <span>Read all verified reviews on Google</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
};

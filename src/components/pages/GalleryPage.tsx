import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavPage, GalleryItem } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { PreFooterBanner } from '../common/PreFooterBanner';
import { GalleryLightbox } from '../common/GalleryLightbox';
import { galleryItems } from '../../data/hotelData';
import { hotelService, normalizeGalleryCategory } from '../../services/hotelService';
import { FadeIn, StaggerContainer, StaggerItem } from '../common/MotionWrapper';
import { ZoomIn } from 'lucide-react';

interface GalleryPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenEnquiry: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  onNavigate,
  onOpenEnquiry,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [items, setItems] = useState<GalleryItem[]>(() => galleryItems);

  useEffect(() => {
    let isMounted = true;
    const loadGallery = async () => {
      try {
        const merged = await hotelService.getGallery();
        if (isMounted && merged && merged.length > 0) {
          setItems(merged);
        }
      } catch (err) {
        console.warn('[GalleryPage] Failed to fetch dynamic gallery, preserving verified fallback:', err);
      }
    };

    loadGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = ['All', 'Rooms', 'Property', 'Dining', 'Hyderabad'];

  const filteredItems =
    activeFilter === 'All'
      ? items
      : items.filter((item) => normalizeGalleryCategory(item.category) === activeFilter);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => ((prev ?? 0) - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => ((prev ?? 0) + 1) % filteredItems.length);
    }
  };

  return (
    <div id="gallery-page" className="w-full bg-[#FAFAFA]">
      {/* 1. PAGE HEADER */}
      <PageHeader
        page="gallery"
        eyebrow="Moments That Matter"
        title="Lotus Grand Hotel Gallery"
        subtitle="A glimpse into your perfect stay"
        scriptText="Stay Dine Relax Explore"
        bgImage="/assets/hotel-assets/property/img_1_hyderabad-super-townhouse-lotus-grand-photo-1.jpg"
        onNavigate={onNavigate}
      />

      {/* 2. GALLERY SECTION */}
      <section id="gallery-grid-section" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
            EXPLORE OUR SPACES
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A]">
            Moments from Lotus Grand
          </h2>
          <div className="w-12 h-0.5 bg-[#C5A059] mx-auto my-3" />
          <p className="text-sm text-stone-600 font-light leading-relaxed">
            From elegant rooms and delightful dining to our warm hospitality and inviting spaces,
            explore the true essence of Lotus Grand through our gallery.
          </p>
        </FadeIn>

        {/* Category Filter Tabs */}
        <FadeIn className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => {
            const isActive = activeFilter === cat;
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveFilter(cat);
                  setLightboxIndex(null);
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'btn-navy-luxury shadow-md'
                    : 'bg-white border border-stone-200 text-stone-700 hover:border-[#C5A059] hover:text-[#0D1E3A] hover:shadow-xs'
                }`}
              >
                {cat}
              </motion.button>
            );
          })}
        </FadeIn>

        {/* Gallery Image Grid (Matching Mockup 4-column layout) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                onClick={() => openLightbox(index)}
                className="relative h-64 rounded-lg overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-stone-200 group cursor-pointer bg-stone-100"
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-600 ease-out"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                  <div className="self-end p-2 bg-black/40 rounded-full text-amber-200 group-hover:rotate-12 transition-transform duration-300">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[10px] tracking-widest uppercase text-amber-300 block mb-1">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-serif font-medium leading-snug">{item.title}</h4>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 3. PRE-FOOTER BANNER */}
      <PreFooterBanner
        type="gallery"
        onNavigate={onNavigate}
        onOpenEnquiry={onOpenEnquiry}
      />

      {/* 4. LIGHTBOX MODAL */}
      <GalleryLightbox
        items={filteredItems}
        currentIndex={lightboxIndex}
        onClose={closeLightbox}
        onPrev={prevLightbox}
        onNext={nextLightbox}
      />
    </div>
  );
};

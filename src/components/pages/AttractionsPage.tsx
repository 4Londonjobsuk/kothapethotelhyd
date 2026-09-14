import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { NavPage, AttractionItem } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { PreFooterBanner } from '../common/PreFooterBanner';
import { approvedAttractions, siteSettings, verifiedTransitData } from '../../data/hotelData';
import { hotelService } from '../../services/hotelService';
import { FadeIn, StaggerContainer, StaggerItem, useBodyScrollLock } from '../common/MotionWrapper';
import {
  MapPin,
  Navigation,
  ArrowRight,
  X,
  ExternalLink,
  Compass,
  Train,
  Bus,
  Plane,
  Footprints,
  Clock,
} from 'lucide-react';

interface AttractionsPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenEnquiry: () => void;
}

export const AttractionsPage: React.FC<AttractionsPageProps> = ({
  onNavigate,
  onOpenEnquiry,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [attractions, setAttractions] = useState<AttractionItem[]>(() => hotelService.getInitialAttractions());
  const [selectedAttraction, setSelectedAttraction] = useState<AttractionItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAttractions = () => {
      hotelService
        .getAttractions()
        .then((data) => {
          if (isMounted && data && data.length > 0) {
            setAttractions(data);
          }
        })
        .catch((err) => {
          console.warn('[AttractionsPage] Could not load attractions from service:', err);
        });
    };

    fetchAttractions();

    const handleUpdate = () => {
      fetchAttractions();
    };

    window.addEventListener('lotus_attractions_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('lotus_attractions_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const getAttractionPinLabel = (id: string, fallbackName: string) => {
    const item = attractions.find((a) => a.id === id);
    const name = item?.name || fallbackName;
    if (item?.showDistance === true && item?.distanceDisplay && item.distanceDisplay.trim() !== '') {
      return `${name} (${item.distanceDisplay})`;
    }
    return name;
  };

  useBodyScrollLock(!!selectedAttraction);

  // Close modal on Escape key for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAttraction(null);
      }
    };
    if (selectedAttraction) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAttraction]);

  return (
    <div id="attractions-page" className="w-full bg-[#FAFAFA]">
      {/* 1. PAGE HEADER */}
      <PageHeader
        page="attractions"
        eyebrow="Explore The City"
        title="Nearby Attractions & Things to Do"
        subtitle="Heritage. Culture. Experiences. All Within Reach."
        scriptText="A City of Timeless Experiences"
        bgImage="/assets/hotel-assets/attractions/charminar.jpg"
        onNavigate={onNavigate}
      />

      {/* 2. ATTRACTIONS INTRO & GRID */}
      <section id="attractions-grid-section" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
            DISCOVER HYDERABAD
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A]">
            Discover the Best of Hyderabad from Lotus Grand in Kothapet
          </h2>
          <div className="w-12 h-0.5 bg-[#C5A059] mx-auto my-3" />
          <p className="text-sm text-stone-600 font-light leading-relaxed">
            From historic monuments and royal heritage museums to serene lakes and premier wildlife
            reserves, explore these approved nearby attractions during your stay with us.
          </p>
        </FadeIn>

        {/* 5 Approved Attractions Grid */}
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attr) => (
            <StaggerItem key={attr.id}>
              <div className="bg-white rounded-lg overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-amber-300 transition-all duration-300 border border-stone-200 flex flex-col justify-between h-full group">
                <div>
                  <div className="h-52 relative overflow-hidden">
                    <img
                      src={attr.image}
                      alt={attr.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Distance badge matching mockup - conditionally rendered */}
                    {attr.showDistance === true && attr.distanceDisplay && attr.distanceDisplay.trim() !== '' && (
                      <div className="absolute top-3 right-3 bg-[#0A1830] text-amber-200 text-xs px-3 py-1 rounded-full font-medium shadow-md flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#C5A059]" />
                        <span>{attr.distanceDisplay}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-stone-900 mb-1 group-hover:text-[#0D1E3A] transition-colors">
                      {attr.name}
                    </h3>
                    <span className="text-[11px] text-[#C5A059] font-medium block mb-3">
                      {attr.locationArea}
                    </span>
                    <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed line-clamp-3 mb-4">
                      {attr.tagline}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <button
                    onClick={() => setSelectedAttraction(attr)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D1E3A] hover:text-[#C5A059] uppercase tracking-wider transition-colors cursor-pointer group/btn"
                  >
                    <span>Know More</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* 3. ATTRACTIONS MAP SECTION (Matching Mockup Schematic Map) */}
      <section id="attractions-map-section" className="py-16 bg-[#F1F4F8] border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
              FIND YOUR WAY
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A]">
              Attractions Map & Location
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-light mt-2">
              See the convenient location of Lotus Grand in Kothapet relative to key Hyderabad landmarks.
            </p>
          </FadeIn>

          {/* Stylized Interactive Map Board */}
          <FadeIn direction="up" delay={0.15} className="bg-white rounded-lg overflow-hidden border border-stone-300 shadow-md">
            {/* Visual Schematic Route Canvas */}
            <div className="relative h-[340px] sm:h-[400px] w-full bg-[#E5E9E7] overflow-hidden">
              {/* Soft Lake Hussain Sagar graphic representation */}
              <div className="absolute left-6 top-8 w-44 sm:w-60 h-44 sm:h-60 rounded-full bg-[#C8DCDD]/80 blur-xs border border-[#A2C7C9]" />
              <span className="absolute left-16 top-16 text-xs text-sky-900/60 font-semibold tracking-wider">
                Hussain Sagar Lake
              </span>

              {/* Road Lines Simulation */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" stroke="#CBD5E1" strokeWidth="6">
                <line x1="10%" y1="30%" x2="90%" y2="70%" />
                <line x1="30%" y1="10%" x2="70%" y2="90%" />
                <line x1="20%" y1="80%" x2="80%" y2="40%" />
              </svg>

              {/* Pin 1: Lotus Grand (Central Hub in Kothapet) */}
              <div className="absolute top-[52%] left-[58%] -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-[#0D1E3A] text-white flex items-center justify-center shadow-xl border-2 border-[#E0C37B] animate-bounce duration-1000">
                    <Compass className="w-6 h-6 text-amber-200" />
                  </div>
                  <div className="mt-1 bg-stone-950 text-white text-xs px-3 py-1 rounded shadow-md text-center font-medium whitespace-nowrap">
                    Lotus Grand <span className="text-amber-300">(Kothapet)</span>
                  </div>
                </div>
              </div>

              {/* Pin 2: Salar Jung Museum */}
              <button
                onClick={() => setSelectedAttraction(attractions.find(a => a.id === 'salar-jung') || null)}
                className="absolute top-[35%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white hover:scale-105 text-stone-900 border border-stone-300 hover:border-[#0D1E3A] rounded px-2.5 py-1 text-[11px] shadow-sm flex items-center gap-1.5 font-medium whitespace-nowrap cursor-pointer transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{getAttractionPinLabel('salar-jung', 'Salar Jung Museum')}</span>
              </button>

              {/* Pin 3: Charminar */}
              <button
                onClick={() => setSelectedAttraction(attractions.find(a => a.id === 'charminar') || null)}
                className="absolute top-[68%] left-[32%] -translate-x-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white hover:scale-105 text-stone-900 border border-stone-300 hover:border-[#0D1E3A] rounded px-2.5 py-1 text-[11px] shadow-sm flex items-center gap-1.5 font-medium whitespace-nowrap cursor-pointer transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{getAttractionPinLabel('charminar', 'Charminar')}</span>
              </button>

              {/* Pin 4: Hussain Sagar / Buddha Statue */}
              <button
                onClick={() => setSelectedAttraction(attractions.find(a => a.id === 'buddha-statue') || null)}
                className="absolute top-[20%] left-[22%] -translate-x-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white hover:scale-105 text-stone-900 border border-stone-300 hover:border-[#0D1E3A] rounded px-2.5 py-1 text-[11px] shadow-sm flex items-center gap-1.5 font-medium whitespace-nowrap cursor-pointer transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{getAttractionPinLabel('buddha-statue', 'Buddha Statue, Hussain Sagar')}</span>
              </button>

              {/* Pin 5: Birla Mandir */}
              <button
                onClick={() => setSelectedAttraction(attractions.find(a => a.id === 'birla-mandir') || null)}
                className="absolute top-[28%] left-[36%] -translate-x-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white hover:scale-105 text-stone-900 border border-stone-300 hover:border-[#0D1E3A] rounded px-2.5 py-1 text-[11px] shadow-sm flex items-center gap-1.5 font-medium whitespace-nowrap cursor-pointer transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{getAttractionPinLabel('birla-mandir', 'Birla Mandir')}</span>
              </button>

              {/* Pin 6: Nehru Zoological Park */}
              <button
                onClick={() => setSelectedAttraction(attractions.find(a => a.id === 'nehru-zoo') || null)}
                className="absolute top-[82%] left-[40%] -translate-x-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white hover:scale-105 text-stone-900 border border-stone-300 hover:border-[#0D1E3A] rounded px-2.5 py-1 text-[11px] shadow-sm flex items-center gap-1.5 font-medium whitespace-nowrap cursor-pointer transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{getAttractionPinLabel('nehru-zoo', 'Nehru Zoo Park')}</span>
              </button>
            </div>

            {/* Map Action Bar matching mockup */}
            <div className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200">
              <a
                href={siteSettings.googleMapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#0D1E3A] hover:bg-[#081427] active:scale-98 text-white px-6 py-2.5 rounded text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
              >
                <Navigation className="w-4 h-4 text-amber-200" />
                <span>Get Directions to Hotel</span>
              </a>

              <a
                href="https://www.google.com/maps/search/Hyderabad+attractions"
                target="_blank"
                rel="noreferrer"
                className="text-xs sm:text-sm font-medium text-[#0D1E3A] hover:text-[#C5A059] flex items-center gap-1.5 transition-colors group"
              >
                <span>Explore more places on Google Maps</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 4. TRANSIT & CONNECTIVITY HUB (Verified Distances) */}
      <section id="attractions-transit-section" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-2">
            EFFORTLESS CONNECTIVITY
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#0D1E3A]">
            Transit & Getting Around
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-light mt-2 leading-relaxed">
            Lotus Grand sits in a well-connected pocket of Kothapet with metro, bus, and rail access within minutes.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {verifiedTransitData.map((item) => {
            const getIcon = () => {
              if (item.type === 'metro') return <Train className="w-4 h-4 text-emerald-600" />;
              if (item.type === 'bus') return <Bus className="w-4 h-4 text-sky-600" />;
              if (item.type === 'train') return <Train className="w-4 h-4 text-amber-600" />;
              if (item.type === 'airport') return <Plane className="w-4 h-4 text-indigo-600" />;
              return <Footprints className="w-4 h-4 text-teal-600" />;
            };

            return (
              <div
                key={item.id}
                className="bg-white p-4.5 rounded-lg border border-stone-200/90 shadow-xs hover:border-amber-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-stone-100 border border-stone-200">
                        {getIcon()}
                      </div>
                      <span className="text-xs font-semibold text-stone-900">{item.name}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500 font-light leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100 font-medium">
                  <span className="text-[#0D1E3A]">{item.distance}</span>
                  <span className="text-[#9E7C32]">{item.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. PRE-FOOTER BANNER */}
      <PreFooterBanner
        type="attractions"
        onNavigate={onNavigate}
        onOpenEnquiry={onOpenEnquiry}
      />

      {/* ATTRACTION DETAIL MODAL */}
      <AnimatePresence>
        {selectedAttraction && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedAttraction(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Modal Box */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden border border-stone-200 z-10"
            >
              <div className="h-56 relative">
                <img
                  src={selectedAttraction.image}
                  alt={selectedAttraction.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedAttraction(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black active:scale-90 transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                {selectedAttraction.showDistance === true &&
                  selectedAttraction.distanceDisplay &&
                  selectedAttraction.distanceDisplay.trim() !== '' && (
                    <div className="absolute bottom-3 left-3 bg-[#0A1830] text-amber-200 text-xs px-3 py-1 rounded font-medium shadow-md">
                      Distance: {selectedAttraction.distanceDisplay} from Lotus Grand
                    </div>
                  )}
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-serif font-semibold text-stone-900 mb-1">
                  {selectedAttraction.name}
                </h3>
                <p className="text-xs text-[#C5A059] font-medium mb-3">
                  {selectedAttraction.locationArea}
                </p>

                <p className="text-sm text-stone-600 leading-relaxed font-light mb-5">
                  {selectedAttraction.description}
                </p>

                <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs text-stone-600 space-y-1 mb-5">
                  <p>
                    <strong>Getting there from Lotus Grand:</strong> Readily accessible via local auto,
                    taxi apps (Ola / Uber), or Hyderabad Metro corridors.
                  </p>
                  <p className="text-[11px] text-stone-500">
                    * Travel times and distances are approximate depending on current city traffic.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=Lotus+Grand+Kothapet+Hyderabad&destination=${encodeURIComponent(
                      selectedAttraction.name + ' Hyderabad'
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold btn-gold-luxury px-5 py-2.5 rounded-full shadow-sm"
                  >
                    <span>Directions in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#081220]" />
                  </a>

                  <button
                    onClick={() => setSelectedAttraction(null)}
                    className="text-xs font-medium text-stone-600 hover:text-stone-900 px-3 py-2 cursor-pointer active:scale-95 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

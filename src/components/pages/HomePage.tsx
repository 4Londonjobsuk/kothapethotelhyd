import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { NavPage, RoomItem, AmenityItem, AttractionItem, HeroSlideItem, TestimonialItem, HeroSliderHeightProfile } from '../../types';
import {
  roomsData,
  amenitiesData,
  approvedAttractions,
  guestHospitalityCommitments,
  testimonialsData,
} from '../../data/hotelData';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { hotelService } from '../../services/hotelService';
import { PreFooterBanner } from '../common/PreFooterBanner';
import { ReviewsSlider } from '../common/ReviewsSlider';
import { FadeIn, StaggerContainer, StaggerItem } from '../common/MotionWrapper';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Wifi,
  AirVent,
  Bell,
  Car,
  ConciergeBell,
  Utensils,
  ArrowRight,
  Calendar,
  Sparkles,
  Zap,
  Bath,
  Tv,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: NavPage) => void;
  onOpenEnquiry: (roomName?: string) => void;
  onSelectRoom: (room: RoomItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenEnquiry,
  onSelectRoom,
}) => {
  const siteSettings = useSiteSettings();
  const shouldReduceMotion = useReducedMotion();

  // Dynamic Hero Slider State
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>(() => hotelService.getHeroSlidesFallback());
  const [sliderHeight, setSliderHeight] = useState<HeroSliderHeightProfile>(() => hotelService.getHeroSliderHeightFallback());
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() => testimonialsData);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Gallery Teaser dynamic image state with verified fallback
  const [diningTeaserImage, setDiningTeaserImage] = useState<string>(
    '/assets/hotel-assets/dining/img_20_hyderabad-super-townhouse-lotus-grand-photo-20.jpg'
  );
  const [homeRooms, setHomeRooms] = useState<RoomItem[]>(() => roomsData);
  const [homeAmenities, setHomeAmenities] = useState<AmenityItem[]>(() =>
    amenitiesData.slice(0, 6)
  );
  const [homeAttractions, setHomeAttractions] = useState<AttractionItem[]>(() =>
    hotelService.getInitialAttractions().slice(0, 4)
  );

  useEffect(() => {
    let isMounted = true;

    hotelService.getHeroSlides().then((slides) => {
      if (isMounted && slides && slides.length > 0) {
        setHeroSlides(slides);
      }
    }).catch(() => {});

    hotelService.getHeroSliderHeight().then((h) => {
      if (isMounted && h) {
        setSliderHeight(h);
      }
    }).catch(() => {});

    hotelService.getTestimonials().then((items) => {
      if (isMounted && items && items.length > 0) {
        setTestimonials(items);
      }
    }).catch(() => {});

    const handleHeroUpdated = (e: CustomEvent<HeroSlideItem[]>) => {
      if (isMounted && e.detail) {
        setHeroSlides(e.detail);
      }
    };

    const handleHeightUpdated = (e: CustomEvent<HeroSliderHeightProfile>) => {
      if (isMounted && e.detail) {
        setSliderHeight(e.detail);
      }
    };

    const handleTestimonialsUpdated = (e: CustomEvent<TestimonialItem[]>) => {
      if (isMounted && e.detail) {
        setTestimonials(e.detail);
      }
    };

    window.addEventListener('lotus_hero_slides_updated', handleHeroUpdated as EventListener);
    window.addEventListener('lotus_hero_slider_height_updated', handleHeightUpdated as EventListener);
    window.addEventListener('lotus_testimonials_updated', handleTestimonialsUpdated as EventListener);

    return () => {
      isMounted = false;
      window.removeEventListener('lotus_hero_slides_updated', handleHeroUpdated as EventListener);
      window.removeEventListener('lotus_hero_slider_height_updated', handleHeightUpdated as EventListener);
      window.removeEventListener('lotus_testimonials_updated', handleTestimonialsUpdated as EventListener);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    hotelService
      .getAmenities()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setHomeAmenities(data.slice(0, 6));
        }
      })
      .catch(() => {});

    const loadAttractions = () => {
      hotelService
        .getAttractions()
        .then((data) => {
          if (isMounted && data && data.length > 0) {
            setHomeAttractions(data.slice(0, 4));
          }
        })
        .catch(() => {});
    };

    loadAttractions();

    const handleAttractionUpdate = () => {
      loadAttractions();
    };

    window.addEventListener('lotus_attractions_updated', handleAttractionUpdate);
    window.addEventListener('storage', handleAttractionUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('lotus_attractions_updated', handleAttractionUpdate);
      window.removeEventListener('storage', handleAttractionUpdate);
    };
  }, []);

  const renderHomeAmenityIcon = (iconName?: string) => {
    const iconClass = 'w-8 h-8 text-[#C5A059] mb-3 group-hover:scale-110 transition-transform';
    switch (iconName) {
      case 'Wifi':
        return <Wifi className={iconClass} />;
      case 'AirVent':
      case 'Wind':
        return <AirVent className={iconClass} />;
      case 'Bell':
        return <Bell className={iconClass} />;
      case 'Clock':
        return <Clock className={iconClass} />;
      case 'Car':
        return <Car className={iconClass} />;
      case 'ConciergeBell':
        return <ConciergeBell className={iconClass} />;
      case 'Utensils':
      case 'UtensilsCrossed':
        return <Utensils className={iconClass} />;
      case 'Zap':
        return <Zap className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'ShieldCheck':
        return <ShieldCheck className={iconClass} />;
      case 'Bath':
        return <Bath className={iconClass} />;
      case 'Tv':
        return <Tv className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  useEffect(() => {
    let isMounted = true;
    hotelService.getRooms().then((data) => {
      if (isMounted && data && data.length > 0) {
        setHomeRooms(data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    hotelService.getGallery('Dining').then((items) => {
      if (isMounted && items && items.length > 0) {
        const latest = items[items.length - 1];
        if (latest && latest.image) {
          setDiningTeaserImage(latest.image);
        }
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto transition for hero slider
  useEffect(() => {
    if (isPaused || heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, heroSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 50) {
      prevSlide();
    } else if (diff < -50) {
      nextSlide();
    }
    setTouchStartX(null);
  };

  const featuredRooms = homeRooms.slice(0, 3);
  const featuredAttractions = homeAttractions.slice(0, 4);

  // Responsive height profiles tailored safely across mobile, laptop, and ultrawide curved monitors
  const sliderHeightClass =
    sliderHeight === 'compact'
      ? 'h-[540px] sm:h-[560px] lg:h-[600px] xl:h-[620px]'
      : sliderHeight === 'cinema'
      ? 'h-[620px] sm:h-[720px] lg:h-[820px] xl:h-[88vh] min-h-[580px]'
      : 'h-[560px] sm:h-[620px] lg:h-[700px] xl:h-[720px]';

  const sliderPaddingClass =
    sliderHeight === 'compact'
      ? 'pt-20 sm:pt-24 lg:pt-28 pb-12'
      : sliderHeight === 'cinema'
      ? 'pt-28 sm:pt-36 lg:pt-40 pb-20'
      : 'pt-24 sm:pt-32 lg:pt-36 pb-16';

  return (
    <div id="home-page" className="w-full bg-[#FAFAFA]">
      {/* 1. HERO SLIDER */}
      <section
        id="hero-slider"
        className={`relative ${sliderHeightClass} w-full bg-stone-950 overflow-hidden text-white select-none transition-[height] duration-300`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-roledescription="carousel"
        aria-label="Lotus Grand Hero Highlights"
      >
        <AnimatePresence mode="wait">
          {heroSlides.length > 0 && heroSlides[currentSlide] && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              {/* Ken Burns effect on hero background image */}
              <motion.img
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].title}
                referrerPolicy="no-referrer"
                initial={shouldReduceMotion ? { scale: 1 } : { scale: 1 }}
                animate={shouldReduceMotion ? { scale: 1 } : { scale: 1.04 }}
                transition={{ duration: 6, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.05]"
              />
              {/* Cinematic dark gradients matching mockup */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-[#060F1E]/30 mix-blend-multiply z-10 pointer-events-none" />

              <div className={`relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center ${sliderPaddingClass}`}>
                <div className="max-w-3xl">
                  {/* Staggered text entrances */}
                  {heroSlides[currentSlide].eyebrow && (
                    <motion.span
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 }}
                      className="inline-block text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#E0C37B] uppercase mb-3 drop-shadow"
                    >
                      {heroSlides[currentSlide].eyebrow}
                    </motion.span>
                  )}
                  <motion.h1
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
                    className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-white leading-tight drop-shadow-md"
                  >
                    {heroSlides[currentSlide].title}
                  </motion.h1>
                  {heroSlides[currentSlide].subtitle && (
                    <motion.p
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.38, ease: [0.25, 0.1, 0.25, 1.0] }}
                      className="mt-4 text-base sm:text-xl text-stone-200 font-light max-w-2xl drop-shadow"
                    >
                      {heroSlides[currentSlide].subtitle}
                    </motion.p>
                  )}

                {/* Dual Call to Action Buttons */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="mt-8 flex flex-wrap items-center gap-4"
                >
                  <button
                    onClick={() => {
                      const action = heroSlides[currentSlide].primaryButtonAction || 'enquire';
                      if (action === 'enquire') {
                        onOpenEnquiry();
                      } else {
                        onNavigate(action as NavPage);
                      }
                    }}
                    className="btn-gold-luxury px-8 py-3.5 rounded-full text-xs sm:text-sm flex items-center gap-2.5 shadow-xl cursor-pointer"
                  >
                    <span>{heroSlides[currentSlide].primaryButtonText || 'Enquire Now'}</span>
                    <Calendar className="w-4 h-4 text-[#081220]" />
                  </button>
                  <button
                    onClick={() => {
                      const action = heroSlides[currentSlide].secondaryButtonAction || 'rooms';
                      if (action === 'enquire') {
                        onOpenEnquiry();
                      } else {
                        onNavigate(action as NavPage);
                      }
                    }}
                    className="btn-ghost-luxury px-8 py-3.5 rounded-full text-xs sm:text-sm flex items-center gap-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/40 hover:border-[#E0C37B] backdrop-blur-md cursor-pointer"
                  >
                    <span>{heroSlides[currentSlide].secondaryButtonText || 'Explore Rooms'}</span>
                    <ArrowRight className="w-4 h-4 text-[#E0C37B]" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Hero Slider Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/35 hover:bg-black/60 text-white/90 hover:text-white hover:-translate-x-0.5 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/35 hover:bg-black/60 text-white/90 hover:text-white hover:translate-x-0.5 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators Dots */}
        <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center space-x-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentSlide ? 'w-8 bg-[#C5A059]' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. HIGHLIGHTS BAR (4 Columns with Dividers) */}
      <section
        id="home-highlights-bar"
        className="bg-[#F4F6F9] border-b border-[#DCE3ED] py-6 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer
            staggerDelay={0.08}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 divide-y sm:divide-y-0 lg:divide-x divide-stone-300/70"
          >
            <StaggerItem className="flex items-center gap-3.5 px-3 py-2 group cursor-default">
              <div className="w-10 h-10 rounded-full bg-[#0D1E3A]/10 flex items-center justify-center text-[#0D1E3A] shrink-0 group-hover:scale-110 group-hover:bg-[#0D1E3A]/15 transition-transform duration-200">
                <MapPin className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900">Prime Location</h4>
                <p className="text-xs text-stone-600">In Kothapet, Hyderabad</p>
              </div>
            </StaggerItem>

            <StaggerItem className="flex items-center gap-3.5 px-3 py-2 group cursor-default">
              <div className="w-10 h-10 rounded-full bg-[#0D1E3A]/10 flex items-center justify-center text-[#0D1E3A] shrink-0 group-hover:scale-110 group-hover:bg-[#0D1E3A]/15 transition-transform duration-200">
                <Clock className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900">24/7 Front Desk</h4>
                <p className="text-xs text-stone-600">Round-the-clock service</p>
              </div>
            </StaggerItem>

            <StaggerItem className="flex items-center gap-3.5 px-3 py-2 group cursor-default">
              <div className="w-10 h-10 rounded-full bg-[#0D1E3A]/10 flex items-center justify-center text-[#0D1E3A] shrink-0 group-hover:scale-110 group-hover:bg-[#0D1E3A]/15 transition-transform duration-200">
                <Users className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900">Guest-Focused Service</h4>
                <p className="text-xs text-stone-600">Attentive care & comfort</p>
              </div>
            </StaggerItem>

            <StaggerItem className="flex items-center gap-3.5 px-3 py-2 group cursor-default">
              <div className="w-10 h-10 rounded-full bg-[#0D1E3A]/10 flex items-center justify-center text-[#0D1E3A] shrink-0 group-hover:scale-110 group-hover:bg-[#0D1E3A]/15 transition-transform duration-200">
                <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-900">Trusted by Travelers</h4>
                <p className="text-xs text-stone-600">Clean, safe & hospitable</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* 3. WELCOME SECTION (Split Layout matching mockup) */}
      <section id="home-welcome-section" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Large Lobby Photo with border styling */}
          <FadeIn direction="right" className="lg:col-span-6 relative">
            <div className="relative rounded-lg overflow-hidden shadow-xl border border-stone-200 group">
              <img
                src="/assets/hotel-assets/property/img_5_hyderabad-super-townhouse-lotus-grand-photo-5.jpg"
                alt="Lotus Grand welcoming lobby lounge"
                referrerPolicy="no-referrer"
                className="w-full h-[320px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </FadeIn>

          {/* Right: Welcome Narrative */}
          <FadeIn direction="left" className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase">
              A WARM WELCOME
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A] leading-tight">
              Welcome to Lotus Grand
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              A perfect blend of modern comfort and traditional hospitality in the heart of
              Kothapet, Hyderabad. Whether you're here for business, medical travel, or family
              leisure, we promise a comfortable and memorable stay with helpful service.
            </p>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Enjoy peaceful rooms, prompt 24-hour reception, high-speed Wi-Fi, and convenient access
              to Hyderabad’s prime cultural landmarks.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-2 text-[#0D1E3A] hover:text-[#C5A059] font-medium text-sm transition-colors group cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 4. OUR ROOMS SECTION */}
      <section id="home-rooms-section" className="py-16 bg-[#F1F4F8] border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
              STAY IN STYLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A]">
              Our Rooms
            </h2>
            <div className="w-12 h-0.5 bg-[#C5A059] mx-auto my-3" />
            <p className="text-sm text-stone-600 font-light">
              Thoughtfully designed rooms for your comfort and convenience.
            </p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <StaggerItem key={room.id}>
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-stone-200 flex flex-col h-full group">
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-xs px-2.5 py-1 rounded font-medium text-[#0D1E3A] shadow-xs">
                      {room.specs.bed}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-serif font-semibold text-stone-900 mb-2 group-hover:text-[#0D1E3A] transition-colors">
                        {room.name}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2 mb-4 leading-relaxed">
                        {room.subtitle}
                      </p>
                      <p className="text-xs font-semibold text-[#0D1E3A] mb-5">
                        {room.rateLabel}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectRoom(room);
                        onNavigate('rooms');
                      }}
                      className="btn-navy-luxury w-full py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider text-center"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* 5. HOTEL AMENITIES (Iconic Row matching mockup) */}
      <section id="home-amenities-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
            HOTEL AMENITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#0D1E3A]">
            Everything You Need for a Comfortable Stay
          </h2>
        </FadeIn>

        <StaggerContainer staggerDelay={0.06} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {homeAmenities.map((amenity) => (
            <StaggerItem key={amenity.id}>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group h-full justify-center">
                {renderHomeAmenityIcon(amenity.iconName)}
                <span className="text-sm font-medium text-stone-800">{amenity.title}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* 6. GUEST HOSPITALITY COMMITMENTS (Factual & Verified Standards) */}
      <section id="home-hospitality-section" className="py-16 bg-[#F4F6F9] border-y border-[#DCE3ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
              GUEST SATISFACTION
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A]">
              Our Hospitality Standard
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 font-light max-w-lg mx-auto">
              Committed to providing every traveler with a clean, secure, and genuinely hospitable stay in Kothapet.
            </p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guestHospitalityCommitments.map((item) => (
              <StaggerItem key={item.id}>
                <div className="bg-white p-8 rounded-lg shadow-xs border border-stone-200/90 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded bg-[#F1F4F8] text-[#0D1E3A] text-[11px] font-semibold tracking-wider uppercase mb-4 border border-[#D8E0EB]">
                      {item.badge}
                    </span>
                    <h3 className="text-lg font-serif font-semibold text-stone-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="border-t border-stone-100 pt-4 mt-6 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#C5A059]">
                      {item.subtitle}
                    </span>
                    <span className="text-[11px] text-stone-600 font-medium">Lotus Grand Standard</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Customer Reviews Slider (What Our Guests Say) */}
          <ReviewsSlider reviews={testimonials} />
        </div>
      </section>

      {/* 7. OUR GALLERY TEASER (4 Images with overlay) */}
      <section id="home-gallery-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
            A GLIMPSE OF LUXURY
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A]">
            Our Gallery
          </h2>
        </FadeIn>

        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem>
            <div className="h-60 rounded-lg overflow-hidden shadow-xs border border-stone-200 group">
              <img
                src="/assets/hotel-assets/property/img_5_hyderabad-super-townhouse-lotus-grand-photo-5.jpg"
                alt="Lotus Grand Lobby"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="h-60 rounded-lg overflow-hidden shadow-xs border border-stone-200 group">
              <img
                src="/assets/hotel-assets/rooms/img_10_hyderabad-super-townhouse-lotus-grand-photo-10.jpg"
                alt="Deluxe Room"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="h-60 rounded-lg overflow-hidden shadow-xs border border-stone-200 group">
              <img
                src={diningTeaserImage}
                alt="Dining Table Service"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </StaggerItem>

          {/* 4th Card with "View Full Gallery" Overlay */}
          <StaggerItem>
            <div
              onClick={() => onNavigate('gallery')}
              className="h-60 rounded-lg overflow-hidden shadow-xs border border-stone-200 relative group cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img
                src="/assets/hotel-assets/property/img_1_hyderabad-super-townhouse-lotus-grand-photo-1.jpg"
                alt="Property Exterior"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#060F1E]/80 group-hover:bg-[#060F1E]/70 transition-colors flex items-center justify-center p-4">
                <span className="text-white font-serif text-lg font-medium flex items-center gap-2 group-hover:scale-105 transition-transform duration-200">
                  <span>View Full Gallery</span>
                  <ArrowRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* 8. POPULAR ATTRACTIONS (Approved 4 from doc with distances) */}
      <section id="home-attractions-section" className="py-16 bg-[#F1F4F8] border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
              EXPLORE NEARBY
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A]">
              Popular Attractions
            </h2>
          </FadeIn>

          <StaggerContainer staggerDelay={0.09} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAttractions.map((attr) => (
              <StaggerItem key={attr.id}>
                <div className="bg-white rounded-lg overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 border border-stone-200 flex flex-col h-full group">
                  <div className="h-44 relative overflow-hidden">
                    <img
                      src={attr.image}
                      alt={attr.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {attr.showDistance === true && attr.distanceDisplay && attr.distanceDisplay.trim() !== '' && (
                      <div className="absolute bottom-2 left-2 bg-stone-900/85 text-amber-200 text-xs px-2.5 py-1 rounded flex items-center gap-1 font-medium backdrop-blur-xs">
                        <MapPin className="w-3 h-3" />
                        <span>{attr.distanceDisplay}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-semibold text-stone-900 text-base mb-1 group-hover:text-[#0D1E3A] transition-colors">
                        {attr.name}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {attr.tagline}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn delay={0.2} className="text-right mt-8">
            <button
              onClick={() => onNavigate('attractions')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0D1E3A] hover:text-[#C5A059] transition-colors group cursor-pointer"
            >
              <span>See All Attractions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* 9. PRE-FOOTER BANNER */}
      <PreFooterBanner
        type="home"
        onNavigate={onNavigate}
        onOpenEnquiry={() => onOpenEnquiry()}
      />
    </div>
  );
};

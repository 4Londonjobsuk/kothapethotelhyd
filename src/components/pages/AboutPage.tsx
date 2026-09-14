import React, { useState, useEffect } from 'react';
import { NavPage, StoryContentSettings } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { PreFooterBanner } from '../common/PreFooterBanner';
import { whyChooseUsData } from '../../data/hotelData';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { hotelService } from '../../services/hotelService';
import { FadeIn, StaggerContainer, StaggerItem } from '../common/MotionWrapper';
import { HeartHandshake, MapPin, Users, Hotel, Clock, Train, Ban, Zap, ShieldCheck } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenEnquiry: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenEnquiry }) => {
  const siteSettings = useSiteSettings();
  const [story, setStory] = useState<StoryContentSettings>(() => hotelService.getStoryContentFallback());

  useEffect(() => {
    let isMounted = true;
    hotelService.getStoryContent().then((data) => {
      if (isMounted && data) {
        setStory(data);
      }
    }).catch(() => {});

    const handleStoryUpdated = (e: CustomEvent<StoryContentSettings>) => {
      if (isMounted && e.detail) {
        setStory(e.detail);
      }
    };

    window.addEventListener('lotus_about_story_updated', handleStoryUpdated as EventListener);
    return () => {
      isMounted = false;
      window.removeEventListener('lotus_about_story_updated', handleStoryUpdated as EventListener);
    };
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartHandshake':
        return <HeartHandshake className="w-10 h-10 text-[#C5A059]" />;
      case 'MapPin':
        return <MapPin className="w-10 h-10 text-[#C5A059]" />;
      case 'Users':
      default:
        return <Users className="w-10 h-10 text-[#C5A059]" />;
    }
  };

  return (
    <div id="about-page" className="w-full bg-[#FAFAFA]">
      {/* 1. PAGE HEADER */}
      <PageHeader
        page="about"
        eyebrow="About Us"
        title="About Lotus Grand"
        subtitle="A Hotel with a Heart, in the Heart of Hyderabad"
        scriptText="Stay Good Feel Better"
        bgImage="/assets/hotel-assets/property/img_1_hyderabad-super-townhouse-lotus-grand-photo-1.jpg"
        onNavigate={onNavigate}
      />

      {/* 2. OUR STORY SECTION */}
      <section id="about-story-section" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Lobby Image with artistic quote overlay */}
          <FadeIn direction="right" className="lg:col-span-6 relative">
            <div className="relative rounded-lg overflow-hidden shadow-xl border border-stone-200 group">
              <img
                src="/assets/hotel-assets/property/img_5_hyderabad-super-townhouse-lotus-grand-photo-5.jpg"
                alt="Lotus Grand Reception and Living Space"
                referrerPolicy="no-referrer"
                className="w-full h-[360px] sm:h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Subtle elegant quote overlay in top-left */}
              <div className="absolute top-6 left-6 max-w-[200px] p-4 bg-black/40 backdrop-blur-sm rounded border border-white/20 text-white">
                <p className="font-serif text-sm italic leading-snug">
                  {story.aboutStoryQuote}
                </p>
                <div className="w-8 h-0.5 bg-amber-300 mt-2" />
              </div>
            </div>
          </FadeIn>

          {/* Right: Narrative */}
          <FadeIn direction="left" className="lg:col-span-6 space-y-5">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase">
              OUR STORY
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A] leading-tight">
              {story.aboutStoryTitle}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-stone-600 leading-relaxed font-light">
              {story.aboutStoryParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Calligraphic script signature from mockup */}
            <div className="pt-4 border-t border-stone-200/80">
              <p className="font-script-calligraphy text-2xl sm:text-3xl text-[#0D1E3A] leading-tight">
                {story.signatureText}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2B. VERIFIED HOTEL AT A GLANCE (Google Hotel & Super Townhouse specifications) */}
      <section id="about-property-highlights" className="py-12 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 text-center">
            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-stone-200/80 flex flex-col items-center justify-center">
              <Hotel className="w-5 h-5 text-[#C5A059] mb-2" />
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#0D1E3A]">30</span>
              <span className="text-[11px] text-stone-500 font-light mt-0.5">Boutique Rooms</span>
            </div>

            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-stone-200/80 flex flex-col items-center justify-center">
              <Train className="w-5 h-5 text-[#C5A059] mb-2" />
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#0D1E3A]">550 m</span>
              <span className="text-[11px] text-stone-500 font-light mt-0.5">To Metro Station</span>
            </div>

            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-stone-200/80 flex flex-col items-center justify-center">
              <Clock className="w-5 h-5 text-[#C5A059] mb-2" />
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#0D1E3A]">24 / 7</span>
              <span className="text-[11px] text-stone-500 font-light mt-0.5">Front Desk & Service</span>
            </div>

            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-stone-200/80 flex flex-col items-center justify-center">
              <Zap className="w-5 h-5 text-[#C5A059] mb-2" />
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#0D1E3A]">100%</span>
              <span className="text-[11px] text-stone-500 font-light mt-0.5">Power Backup</span>
            </div>

            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-stone-200/80 flex flex-col items-center justify-center">
              <Ban className="w-5 h-5 text-[#C5A059] mb-2" />
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#0D1E3A]">Smoke Free</span>
              <span className="text-[11px] text-stone-500 font-light mt-0.5">Clean Environment</span>
            </div>

            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-stone-200/80 flex flex-col items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#C5A059] mb-2" />
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#0D1E3A]">Verified</span>
              <span className="text-[11px] text-stone-500 font-light mt-0.5">Safety & Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US CARDS */}
      <section id="about-why-choose-us" className="py-16 bg-[#F1F4F8] border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
              WHY CHOOSE US
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A]">
              More Reasons to Stay with Us
            </h2>
          </FadeIn>

          <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyChooseUsData.map((item, idx) => (
              <StaggerItem key={idx}>
                <div className="bg-white p-8 rounded-lg shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-amber-300 transition-all duration-300 border border-stone-200/90 text-center flex flex-col items-center h-full group">
                  <div className="w-16 h-16 rounded-full bg-[#FAFAFA] border border-amber-200 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-amber-50/50 transition-all duration-200">
                    {getIcon(item.iconName)}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-stone-900 mb-3 group-hover:text-[#0D1E3A] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* 4. TRUST BANNER (Loved by Our Guests · Trusted Local Hospitality) */}
      <section id="about-trust-bar" className="py-10 bg-[#FAFAFA] border-b border-stone-200/80">
        <FadeIn className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-6 sm:space-x-8">
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-[#0D1E3A]/5 border border-[#0D1E3A]/15">
              <Users className="w-6 h-6 text-[#C5A059]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-serif font-medium text-[#0D1E3A]">
                Loved by Our Guests · Trusted Local Hospitality
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 font-light">
                Your comfort and satisfaction inspire us every day.
              </p>
            </div>
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-[#0D1E3A]/5 border border-[#0D1E3A]/15">
              <Users className="w-6 h-6 text-[#C5A059]" />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 5. PRE-FOOTER BANNER */}
      <PreFooterBanner
        type="about"
        onNavigate={onNavigate}
        onOpenEnquiry={onOpenEnquiry}
      />
    </div>
  );
};

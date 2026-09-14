import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sliders,
  Star,
  BookOpen,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Save,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Monitor,
  AlertTriangle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { HeroSlideItem, HeroSliderHeightProfile, TestimonialItem, StoryContentSettings, FaqItem } from '../../types';
import { hotelService } from '../../services/hotelService';
import { AdminPrivacyPage } from './AdminPrivacyPage';

type CmsTab = 'hero' | 'testimonials' | 'story' | 'faqs' | 'privacy';

export const AdminContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CmsTab>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // 1. Hero Slides State
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>([]);
  const [sliderHeight, setSliderHeight] = useState<HeroSliderHeightProfile>('balanced');

  // 2. Testimonials State
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

  // 3. Story Content State
  const [story, setStory] = useState<StoryContentSettings>({
    aboutStoryTitle: 'Our Story',
    aboutStoryQuote: 'More Than Just a Stay, A Place to Belong',
    aboutStoryParagraphs: [],
    signatureText: 'Guests Arrive as Strangers, Leave as Friends —',
  });

  // 4. FAQs State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  // Confirmation Modals State (Safety Popups)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'paragraph' | 'hero_slide' | 'testimonial' | 'faq';
    index: number;
    title: string;
    preview: string;
  } | null>(null);

  const [applyTarget, setApplyTarget] = useState<{
    type: 'hero' | 'story' | 'testimonials' | 'faqs';
    title: string;
    description: string;
    details: string[];
  } | null>(null);

  // Load all initial CMS data
  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      try {
        const [slides, heightPref, reviews, storyData, faqsData] = await Promise.all([
          hotelService.getHeroSlides(),
          hotelService.getHeroSliderHeight(),
          hotelService.getTestimonials(),
          hotelService.getStoryContent(),
          hotelService.getFaqs(),
        ]);
        if (isMounted) {
          setHeroSlides(slides);
          setSliderHeight(heightPref);
          setTestimonials(reviews);
          setStory(storyData);
          setFaqs(faqsData);
        }
      } catch (err) {
        console.error('Failed to load CMS content:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadAll();

    const handleUpdate = () => {
      loadAll();
    };

    window.addEventListener('lotus_hero_slides_updated', handleUpdate);
    window.addEventListener('lotus_testimonials_updated', handleUpdate);
    window.addEventListener('lotus_faqs_updated', handleUpdate);
    window.addEventListener('lotus_about_story_updated', handleUpdate);
    window.addEventListener('lotus_trash_updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('lotus_hero_slides_updated', handleUpdate);
      window.removeEventListener('lotus_testimonials_updated', handleUpdate);
      window.removeEventListener('lotus_faqs_updated', handleUpdate);
      window.removeEventListener('lotus_about_story_updated', handleUpdate);
      window.removeEventListener('lotus_trash_updated', handleUpdate);
    };
  }, []);

  const triggerSuccessBanner = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => {
      setSaveSuccess(null);
    }, 3500);
  };

  // ==========================================
  // HERO SLIDES HANDLERS
  // ==========================================
  const handleAddHeroSlide = () => {
    const newSlide: HeroSlideItem = {
      id: `slide-${Date.now()}`,
      image: '/assets/hotel-assets/property/img_1_hyderabad-super-townhouse-lotus-grand-photo-1.jpg',
      eyebrow: 'NEW HIGHLIGHT',
      title: 'Experience Premium Comfort',
      subtitle: 'Welcoming guests in Kothapet, Hyderabad',
      primaryButtonText: 'Enquire Now',
      primaryButtonAction: 'enquire',
      secondaryButtonText: 'Explore Rooms',
      secondaryButtonAction: 'rooms',
    };
    setHeroSlides([...heroSlides, newSlide]);
  };

  const handleUpdateHeroSlide = (index: number, field: keyof HeroSlideItem, value: string) => {
    const updated = [...heroSlides];
    updated[index] = { ...updated[index], [field]: value };
    setHeroSlides(updated);
  };

  // ==========================================
  // DELETE & APPLY CONFIRMATION LOGIC
  // ==========================================
  const promptRemoveHeroSlide = (index: number) => {
    if (heroSlides.length <= 1) {
      alert('You must have at least one hero banner slide.');
      return;
    }
    const slide = heroSlides[index];
    setDeleteTarget({
      type: 'hero_slide',
      index,
      title: `Hero Slide #${index + 1}`,
      preview: slide.title || slide.subtitle || 'Banner Slide',
    });
  };

  const promptRemoveTestimonial = (index: number) => {
    if (testimonials.length <= 1) {
      alert('You must have at least one guest testimonial.');
      return;
    }
    const item = testimonials[index];
    setDeleteTarget({
      type: 'testimonial',
      index,
      title: `Review by ${item.guestName || 'Guest'}`,
      preview: `"${item.quote}" (${item.rating} Stars)`,
    });
  };

  const promptRemoveStoryParagraph = (index: number) => {
    if (story.aboutStoryParagraphs.length <= 1) {
      alert('The story section requires at least one narrative paragraph.');
      return;
    }
    const paraText = story.aboutStoryParagraphs[index] || '';
    setDeleteTarget({
      type: 'paragraph',
      index,
      title: `Story Paragraph #${index + 1}`,
      preview: paraText.length > 120 ? paraText.slice(0, 120) + '...' : paraText,
    });
  };

  const promptRemoveFaq = (index: number) => {
    if (faqs.length <= 1) {
      alert('You must have at least one FAQ item.');
      return;
    }
    const item = faqs[index];
    setDeleteTarget({
      type: 'faq',
      index,
      title: `FAQ Question #${index + 1}`,
      preview: item.q || 'Question',
    });
  };

  const executeConfirmDelete = () => {
    if (!deleteTarget) return;
    const { type, index } = deleteTarget;

    if (type === 'paragraph') {
      const paraText = story.aboutStoryParagraphs[index];
      if (paraText) {
        hotelService.addToTrash({
          originalId: `story-para-${index}-${Date.now()}`,
          type: 'story_paragraph',
          title: `Story Paragraph #${index + 1}`,
          subtitle: paraText.length > 80 ? paraText.slice(0, 80) + '...' : paraText,
          image: '',
          data: { text: paraText, index },
        });
      }
      const paras = story.aboutStoryParagraphs.filter((_, i) => i !== index);
      setStory({ ...story, aboutStoryParagraphs: paras });
      triggerSuccessBanner(`Story Paragraph #${index + 1} moved to Recycle Bin.`);
    } else if (type === 'hero_slide') {
      const slideToDelete = heroSlides[index];
      if (slideToDelete) {
        hotelService.addToTrash({
          originalId: slideToDelete.id,
          type: 'hero_slide',
          title: slideToDelete.title || 'Hero Banner Slide',
          subtitle: slideToDelete.subtitle || '',
          image: slideToDelete.image || '',
          data: slideToDelete,
        });
      }
      setHeroSlides(heroSlides.filter((_, i) => i !== index));
      triggerSuccessBanner(`Hero Slide #${index + 1} moved to Recycle Bin.`);
    } else if (type === 'testimonial') {
      const testToDelete = testimonials[index];
      if (testToDelete) {
        hotelService.addToTrash({
          originalId: testToDelete.id,
          type: 'testimonial',
          title: testToDelete.guestName || 'Guest Review',
          subtitle: `${testToDelete.rating} Stars • ${testToDelete.travelerType}`,
          image: '',
          data: testToDelete,
        });
      }
      setTestimonials(testimonials.filter((_, i) => i !== index));
      triggerSuccessBanner(`Review by ${testToDelete.guestName} moved to Recycle Bin.`);
    } else if (type === 'faq') {
      const faqToDelete = faqs[index];
      if (faqToDelete) {
        hotelService.addToTrash({
          originalId: faqToDelete.id,
          type: 'faq',
          title: faqToDelete.q || 'FAQ Item',
          subtitle: faqToDelete.a || '',
          image: '',
          data: faqToDelete,
        });
      }
      setFaqs(faqs.filter((_, i) => i !== index));
      triggerSuccessBanner(`FAQ item moved to Recycle Bin.`);
    }

    setDeleteTarget(null);
  };

  // Save / Apply Changes Prompts
  const promptApplyHero = () => {
    setApplyTarget({
      type: 'hero',
      title: 'Hero Banner Slider & Height',
      description: 'You are about to save and publish hero slider changes to the homepage.',
      details: [
        `${heroSlides.length} active slide${heroSlides.length > 1 ? 's' : ''} configured`,
        `Slider height profile: "${sliderHeight}"`,
        'Call-to-action buttons & background imagery will update live for all guests',
      ],
    });
  };

  const promptApplyStory = () => {
    setApplyTarget({
      type: 'story',
      title: 'About Us Story & Paragraphs',
      description: 'You are about to save and publish hotel story updates to the live website.',
      details: [
        `Section Title: "${story.aboutStoryTitle}"`,
        `Story Quote: "${story.aboutStoryQuote}"`,
        `${story.aboutStoryParagraphs.length} narrative paragraph${story.aboutStoryParagraphs.length > 1 ? 's' : ''}`,
        `Signature: "${story.signatureText}"`,
      ],
    });
  };

  const promptApplyTestimonials = () => {
    setApplyTarget({
      type: 'testimonials',
      title: 'Guest Reviews & Testimonials',
      description: 'You are about to publish guest reviews to the homepage testimonial slider.',
      details: [
        `${testimonials.length} verified guest review${testimonials.length > 1 ? 's' : ''}`,
        'Ratings, quotes, and guest traveler labels will be updated live',
      ],
    });
  };

  const promptApplyFaqs = () => {
    setApplyTarget({
      type: 'faqs',
      title: 'Frequently Asked Questions (FAQs)',
      description: 'You are about to publish updated FAQ questions and answers to the Contact page.',
      details: [
        `${faqs.length} question & answer pair${faqs.length > 1 ? 's' : ''}`,
        'Visible immediately in the public FAQ accordion section',
      ],
    });
  };

  const executeConfirmApply = async () => {
    if (!applyTarget) return;
    setSaving(true);
    try {
      if (applyTarget.type === 'hero') {
        await Promise.all([
          hotelService.saveHeroSlides(heroSlides),
          hotelService.saveHeroSliderHeight(sliderHeight),
        ]);
        triggerSuccessBanner('Hero banner slider & height settings saved & live on homepage!');
      } else if (applyTarget.type === 'story') {
        await hotelService.saveStoryContent(story);
        triggerSuccessBanner('About Us story content saved & live on website!');
      } else if (applyTarget.type === 'testimonials') {
        await hotelService.saveTestimonials(testimonials);
        triggerSuccessBanner('Guest reviews saved & live on website slider!');
      } else if (applyTarget.type === 'faqs') {
        await hotelService.saveFaqs(faqs);
        triggerSuccessBanner('Guest FAQs updated & live on Contact page!');
      }
      setApplyTarget(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // TESTIMONIALS HANDLERS
  // ==========================================
  const handleAddTestimonial = () => {
    const newReview: TestimonialItem = {
      id: `review-${Date.now()}`,
      guestName: 'Delighted Guest',
      travelerType: 'Verified Stay',
      rating: 5,
      quote: 'Exceptional hospitality and very neat rooms. Will certainly visit again!',
      source: 'Google Review',
      timeAgo: 'Recent Stay',
    };
    setTestimonials([...testimonials, newReview]);
  };

  const handleUpdateTestimonial = (index: number, field: keyof TestimonialItem, value: any) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setTestimonials(updated);
  };

  // ==========================================
  // ABOUT STORY HANDLERS
  // ==========================================
  const handleUpdateStoryParagraph = (index: number, value: string) => {
    const paras = [...story.aboutStoryParagraphs];
    paras[index] = value;
    setStory({ ...story, aboutStoryParagraphs: paras });
  };

  const handleAddStoryParagraph = () => {
    setStory({
      ...story,
      aboutStoryParagraphs: [...story.aboutStoryParagraphs, 'New story narrative paragraph goes here.'],
    });
  };

  // ==========================================
  // FAQS HANDLERS
  // ==========================================
  const handleAddFaq = () => {
    const newFaq: FaqItem = {
      id: `faq-${Date.now()}`,
      q: 'Do you offer airport taxi pickup or drop?',
      a: 'Yes, airport transit and local cabs can be arranged on request at the front desk.',
    };
    setFaqs([...faqs, newFaq]);
  };

  const handleUpdateFaq = (index: number, field: keyof FaqItem, value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-stone-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E0C37B]" />
        <span className="text-xs uppercase tracking-widest font-mono">Loading CMS Content...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-md bg-[#E0C37B]/10 text-[#E0C37B]">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Content Management System (CMS)
            </h1>
          </div>
          <p className="text-sm text-stone-400">
            Control dynamic content across Hero Slider, Guest Reviews, About Story, and FAQs with zero code changes.
          </p>
        </div>

        {/* Global Save Alert Toast */}
        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-stone-800/80 pb-3">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-[#E0C37B] text-[#0A111E] shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Hero Slider ({heroSlides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('testimonials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'testimonials'
              ? 'bg-[#E0C37B] text-[#0A111E] shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Guest Reviews ({testimonials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('story')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'story'
              ? 'bg-[#E0C37B] text-[#0A111E] shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>About Story</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'faqs'
              ? 'bg-[#E0C37B] text-[#0A111E] shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Guest FAQs ({faqs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'privacy'
              ? 'bg-[#E0C37B] text-[#0A111E] shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy Notice</span>
        </button>
      </div>

      {/* TAB 1: HERO SLIDER */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Homepage Hero Banners</h2>
              <p className="text-xs text-stone-400">
                Manage background photos, headlines, and callout phrases shown in the main slider.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddHeroSlide}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#E0C37B]" />
                <span>Add Slide</span>
              </button>
              <button
                type="button"
                onClick={promptApplyHero}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#E0C37B] hover:bg-[#c59a47] text-[#081220] text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Slider Changes</span>
              </button>
            </div>
          </div>

          {/* SLIDER HEIGHT & DISPLAY PROFILE CONTROLLER */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#0F172A] border border-stone-800/90 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-[#E0C37B]" />
                  <span>Slider Height & Display Profile</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Choose the height of the homepage hero banner. All profiles are 100% responsive across mobile, laptops, and ultrawide curved monitors.
                </p>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#070E1A] text-[#E0C37B] border border-[#E0C37B]/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E0C37B] animate-pulse" />
                Active: {sliderHeight.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. Compact Profile */}
              <button
                type="button"
                onClick={() => setSliderHeight('compact')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  sliderHeight === 'compact'
                    ? 'bg-[#E0C37B]/10 border-[#E0C37B] ring-1 ring-[#E0C37B]/40 shadow-sm'
                    : 'bg-[#070E1A] border-stone-800 hover:border-stone-700 hover:bg-stone-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Minimize2 className={`w-3.5 h-3.5 ${sliderHeight === 'compact' ? 'text-[#E0C37B]' : 'text-stone-400'}`} />
                    Compact View
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-800/70 px-1.5 py-0.5 rounded">
                    ~540px
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed mb-3">
                  Shorter banner. Brings room categories and booking perks immediately above the fold for faster scanning.
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-stone-500 uppercase">
                    <span>Banner Ratio</span>
                    <span>540px</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${sliderHeight === 'compact' ? 'bg-[#E0C37B] w-2/5' : 'bg-stone-600 w-2/5'}`} />
                  </div>
                </div>
              </button>

              {/* 2. Balanced Profile (Default) */}
              <button
                type="button"
                onClick={() => setSliderHeight('balanced')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  sliderHeight === 'balanced'
                    ? 'bg-[#E0C37B]/10 border-[#E0C37B] ring-1 ring-[#E0C37B]/40 shadow-sm'
                    : 'bg-[#070E1A] border-stone-800 hover:border-stone-700 hover:bg-stone-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Monitor className={`w-3.5 h-3.5 ${sliderHeight === 'balanced' ? 'text-[#E0C37B]' : 'text-stone-400'}`} />
                    Balanced (Recommended)
                  </span>
                  <span className="text-[10px] font-mono text-[#E0C37B] bg-[#E0C37B]/10 border border-[#E0C37B]/20 px-1.5 py-0.5 rounded">
                    ~680px
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed mb-3">
                  Standard hotel benchmark. Harmonious balance between photo atmosphere, headlines, and call-to-action buttons.
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-stone-500 uppercase">
                    <span>Banner Ratio</span>
                    <span>680px</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${sliderHeight === 'balanced' ? 'bg-[#E0C37B] w-3/5' : 'bg-stone-600 w-3/5'}`} />
                  </div>
                </div>
              </button>

              {/* 3. Cinema Large Profile */}
              <button
                type="button"
                onClick={() => setSliderHeight('cinema')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  sliderHeight === 'cinema'
                    ? 'bg-[#E0C37B]/10 border-[#E0C37B] ring-1 ring-[#E0C37B]/40 shadow-sm'
                    : 'bg-[#070E1A] border-stone-800 hover:border-stone-700 hover:bg-stone-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Maximize2 className={`w-3.5 h-3.5 ${sliderHeight === 'cinema' ? 'text-[#E0C37B]' : 'text-stone-400'}`} />
                    Cinema Large (Immersive)
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-800/70 px-1.5 py-0.5 rounded">
                    ~820px / 88vh
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed mb-3">
                  Full luxury showcase. Expansive height ideal for high-resolution property photography and grand visual impact.
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-stone-500 uppercase">
                    <span>Banner Ratio</span>
                    <span>820px</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${sliderHeight === 'cinema' ? 'bg-[#E0C37B] w-full' : 'bg-stone-600 w-full'}`} />
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center gap-2 text-[11px] text-stone-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                <strong>Mobile Safety Lock Active:</strong> Small phone screens automatically enforce a comfortable minimum vertical breathing space so text and buttons never overlap or get clipped.
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="p-4 rounded-xl bg-[#0F172A] border border-stone-800/90 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs font-mono text-[#E0C37B] font-semibold">
                    Slide #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => promptRemoveHeroSlide(idx)}
                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded transition-colors cursor-pointer"
                    title="Remove Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Image Preview & URL */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-[11px] font-medium text-stone-300 uppercase tracking-wider block">
                      Image Asset URL / Path
                    </label>
                    <div className="relative rounded-lg overflow-hidden border border-stone-700 bg-black/40 aspect-video flex items-center justify-center">
                      <img
                        src={slide.image}
                        alt={`Slide ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            '/assets/hotel-assets/property/img_1_hyderabad-super-townhouse-lotus-grand-photo-1.jpg';
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={slide.image}
                      onChange={(e) => handleUpdateHeroSlide(idx, 'image', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none"
                      placeholder="/assets/..."
                    />
                  </div>

                  {/* Text Details */}
                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-stone-300 uppercase tracking-wider block mb-1">
                        Gold Eyebrow Callout (Uppercase)
                      </label>
                      <input
                        type="text"
                        value={slide.eyebrow}
                        onChange={(e) => handleUpdateHeroSlide(idx, 'eyebrow', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-stone-300 uppercase tracking-wider block mb-1">
                        Main Headline / Title
                      </label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleUpdateHeroSlide(idx, 'title', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-stone-300 uppercase tracking-wider block mb-1">
                        Subtitle / Supporting Description
                      </label>
                      <input
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) => handleUpdateHeroSlide(idx, 'subtitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none"
                      />
                    </div>

                    {/* Action Buttons Configuration (CTAs) */}
                    <div className="pt-3 border-t border-stone-800/90">
                      <div className="text-[11px] font-semibold text-[#E0C37B] uppercase tracking-wider mb-2.5">
                        Slide Action Buttons (CTAs)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Primary Button (Gold) */}
                        <div className="p-3 rounded-lg bg-[#070E1A]/80 border border-stone-800 space-y-2">
                          <div className="text-[10px] font-semibold text-[#E0C37B] uppercase tracking-wider">
                            Primary Button (Gold)
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-400 block mb-1">Button Text</label>
                            <input
                              type="text"
                              value={slide.primaryButtonText ?? 'Enquire Now'}
                              onChange={(e) => handleUpdateHeroSlide(idx, 'primaryButtonText', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-[#0A1628] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none"
                              placeholder="e.g. Enquire Now"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-400 block mb-1">Action / Link Target</label>
                            <select
                              value={slide.primaryButtonAction ?? 'enquire'}
                              onChange={(e) => handleUpdateHeroSlide(idx, 'primaryButtonAction', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-[#0A1628] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none cursor-pointer"
                            >
                              <option value="enquire">Open Booking Enquiry Modal</option>
                              <option value="rooms">Go to Rooms Page</option>
                              <option value="contact">Go to Contact Page</option>
                              <option value="amenities">Go to Amenities Page</option>
                              <option value="gallery">Go to Gallery Page</option>
                              <option value="about">Go to About Us Page</option>
                            </select>
                          </div>
                        </div>

                        {/* Secondary Button (Outline) */}
                        <div className="p-3 rounded-lg bg-[#070E1A]/80 border border-stone-800 space-y-2">
                          <div className="text-[10px] font-semibold text-stone-300 uppercase tracking-wider">
                            Secondary Button (Outline)
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-400 block mb-1">Button Text</label>
                            <input
                              type="text"
                              value={slide.secondaryButtonText ?? 'Explore Rooms'}
                              onChange={(e) => handleUpdateHeroSlide(idx, 'secondaryButtonText', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-[#0A1628] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none"
                              placeholder="e.g. Explore Rooms"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-400 block mb-1">Action / Link Target</label>
                            <select
                              value={slide.secondaryButtonAction ?? 'rooms'}
                              onChange={(e) => handleUpdateHeroSlide(idx, 'secondaryButtonAction', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-[#0A1628] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none cursor-pointer"
                            >
                              <option value="rooms">Go to Rooms Page</option>
                              <option value="enquire">Open Booking Enquiry Modal</option>
                              <option value="contact">Go to Contact Page</option>
                              <option value="amenities">Go to Amenities Page</option>
                              <option value="gallery">Go to Gallery Page</option>
                              <option value="about">Go to About Us Page</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TESTIMONIALS */}
      {activeTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Guest Reviews & Feedback</h2>
              <p className="text-xs text-stone-400">
                Display genuine guest testimonials on the homepage carousel with star ratings and reviewer badges.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddTestimonial}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#E0C37B]" />
                <span>Add Review</span>
              </button>
              <button
                type="button"
                onClick={promptApplyTestimonials}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#E0C37B] hover:bg-[#c59a47] text-[#081220] text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Reviews</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((review, idx) => (
              <div
                key={review.id || idx}
                className="p-4 rounded-xl bg-[#0F172A] border border-stone-800/90 shadow-md space-y-3"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs font-mono text-[#E0C37B] font-semibold">
                    Review #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => promptRemoveTestimonial(idx)}
                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded transition-colors cursor-pointer"
                    title="Remove Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                      Guest Name
                    </label>
                    <input
                      type="text"
                      value={review.guestName}
                      onChange={(e) => handleUpdateTestimonial(idx, 'guestName', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                      Traveler Type / City
                    </label>
                    <input
                      type="text"
                      value={review.travelerType || ''}
                      onChange={(e) => handleUpdateTestimonial(idx, 'travelerType', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none"
                      placeholder="e.g. Business Traveler"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                    Review Quote
                  </label>
                  <textarea
                    rows={3}
                    value={review.quote}
                    onChange={(e) => handleUpdateTestimonial(idx, 'quote', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                      Rating (1-5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={review.rating}
                      onChange={(e) => handleUpdateTestimonial(idx, 'rating', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                      Platform Source
                    </label>
                    <input
                      type="text"
                      value={review.source || 'Google Review'}
                      onChange={(e) => handleUpdateTestimonial(idx, 'source', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                      Time / Date
                    </label>
                    <input
                      type="text"
                      value={review.timeAgo || 'Recent Stay'}
                      onChange={(e) => handleUpdateTestimonial(idx, 'timeAgo', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ABOUT STORY */}
      {activeTab === 'story' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">About Us Story & Mission</h2>
              <p className="text-xs text-stone-400">
                Tailor the narrative, quote, and hospitality signature shown on the About Us page.
              </p>
            </div>
            <button
              type="button"
              onClick={promptApplyStory}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#E0C37B] hover:bg-[#c59a47] text-[#081220] text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save About Story</span>
            </button>
          </div>

          <div className="p-5 rounded-xl bg-[#0F172A] border border-stone-800/90 shadow-md space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-1.5">
                Section Heading
              </label>
              <input
                type="text"
                value={story.aboutStoryTitle}
                onChange={(e) => setStory({ ...story, aboutStoryTitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-sm focus:border-[#E0C37B] focus:outline-none font-serif"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-1.5">
                Artistic Floating Quote on Lobby Image
              </label>
              <input
                type="text"
                value={story.aboutStoryQuote}
                onChange={(e) => setStory({ ...story, aboutStoryQuote: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-sm focus:border-[#E0C37B] focus:outline-none italic"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Story Paragraphs
                </label>
                <button
                  type="button"
                  onClick={handleAddStoryParagraph}
                  className="flex items-center gap-1 text-xs text-[#E0C37B] hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Paragraph</span>
                </button>
              </div>

              <div className="space-y-3">
                {story.aboutStoryParagraphs.map((para, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-xs font-mono text-stone-500 mt-2 shrink-0">{idx + 1}.</span>
                    <textarea
                      rows={3}
                      value={para}
                      onChange={(e) => handleUpdateStoryParagraph(idx, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none leading-relaxed"
                    />
                    <button
                      type="button"
                      onClick={() => promptRemoveStoryParagraph(idx)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded mt-1 cursor-pointer"
                      title="Delete Paragraph"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-1.5">
                Calligraphic Signature Text
              </label>
              <input
                type="text"
                value={story.signatureText}
                onChange={(e) => setStory({ ...story, signatureText: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-sm focus:border-[#E0C37B] focus:outline-none font-serif"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Frequently Asked Questions (FAQs)</h2>
              <p className="text-xs text-stone-400">
                Update or add questions and answers shown in the accordion on the Contact Us page.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddFaq}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#E0C37B]" />
                <span>Add FAQ</span>
              </button>
              <button
                type="button"
                onClick={promptApplyFaqs}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#E0C37B] hover:bg-[#c59a47] text-[#081220] text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save FAQs</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={faq.id || idx}
                className="p-4 rounded-xl bg-[#0F172A] border border-stone-800/90 shadow-md space-y-3"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs font-mono text-[#E0C37B] font-semibold">
                    Question #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => promptRemoveFaq(idx)}
                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded transition-colors cursor-pointer"
                    title="Remove Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={faq.q}
                    onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                    Answer / Information
                  </label>
                  <textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs focus:border-[#E0C37B] focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY NOTICE & LEGAL POLICIES */}
      {activeTab === 'privacy' && (
        <div className="pt-2">
          <AdminPrivacyPage isEmbedded={true} />
        </div>
      )}

      {/* Delete Confirmation Modal (Non-blocking in-app safety dialog) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B1526] border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-stone-100">Delete Confirmation</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Are you sure you want to delete <span className="text-stone-200 font-semibold">{deleteTarget.title}</span>?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#070E1A] border border-stone-800/80 space-y-1.5">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                Content Preview
              </div>
              <p className="text-xs text-stone-300 italic line-clamp-3">
                "{deleteTarget.preview}"
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300/90 flex items-start gap-2">
              <span className="font-bold shrink-0">ℹ Safety note:</span>
              <span>
                This item will be safely moved to the <strong>Recycle Bin</strong>. You can restore it anytime with 1 click.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-stone-800 text-stone-300 hover:text-white text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer transition-colors shadow-lg shadow-rose-900/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply / Save Changes Confirmation Modal */}
      {applyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B1526] border border-[#E0C37B]/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E0C37B]/15 border border-[#E0C37B]/40 flex items-center justify-center text-[#E0C37B] shrink-0">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-stone-100">Apply & Publish Changes?</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {applyTarget.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {applyTarget.description}
            </p>

            {applyTarget.details.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#070E1A] border border-stone-800 space-y-2">
                <div className="text-[10px] font-semibold text-[#E0C37B] uppercase tracking-wider">
                  Changes Summary:
                </div>
                <ul className="space-y-1.5 text-xs text-stone-300">
                  {applyTarget.details.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E0C37B] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setApplyTarget(null)}
                className="px-4 py-2 rounded-xl border border-stone-800 text-stone-300 hover:text-white text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel / Review
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={executeConfirmApply}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#C59A47] to-[#E0C37B] text-black text-xs font-semibold hover:opacity-95 cursor-pointer transition-all shadow-lg shadow-[#E0C37B]/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>Confirm & Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

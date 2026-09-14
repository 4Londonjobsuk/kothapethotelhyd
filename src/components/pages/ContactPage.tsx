import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavPage, FaqItem } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { initiatePhoneCall } from '../../utils/callUtils';
import { hotelService } from '../../services/hotelService';
import { FadeIn, StaggerContainer, StaggerItem } from '../common/MotionWrapper';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Navigation,
  Facebook,
  Instagram,
  Youtube,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: NavPage) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const siteSettings = useSiteSettings();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FaqItem[]>(() => hotelService.getFaqsFallback());

  useEffect(() => {
    let isMounted = true;
    hotelService.getFaqs().then((data) => {
      if (isMounted && data && data.length > 0) {
        setFaqs(data);
      }
    }).catch(() => {});

    const handleFaqsUpdated = (e: CustomEvent<FaqItem[]>) => {
      if (isMounted && e.detail) {
        setFaqs(e.detail);
      }
    };

    window.addEventListener('lotus_faqs_updated', handleFaqsUpdated as EventListener);
    return () => {
      isMounted = false;
      window.removeEventListener('lotus_faqs_updated', handleFaqsUpdated as EventListener);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const res = await hotelService.submitContactMessage({
      fullName,
      phone,
      email,
      subject,
      message,
    });

    setIsSubmitting(false);
    setResult(res);

    if (res.success) {
      setFullName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    }
  };

  return (
    <div id="contact-page" className="w-full bg-[#FAFAFA]">
      {/* 1. PAGE HEADER */}
      <PageHeader
        page="contact"
        eyebrow="Get in Touch"
        title="Contact Lotus Grand"
        subtitle="We're here to make your stay exceptional."
        bgImage="/assets/hotel-assets/property/img_1_hyderabad-super-townhouse-lotus-grand-photo-1.jpg"
        onNavigate={onNavigate}
      />

      {/* 2. CONTACT US SECTION (Card & Form Split matching mockup) */}
      <section id="contact-details-section" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Column: Dark Wine Contact Information Panel */}
          <FadeIn direction="right" className="lg:col-span-5 bg-[#0A1830] text-white p-8 sm:p-10 rounded-xl shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.25em] text-[#E0C37B] uppercase block mb-2">
                REACH OUT TO US
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white mb-3">
                Contact Information
              </h2>
              <p className="text-xs sm:text-sm text-slate-300/90 font-light leading-relaxed mb-8">
                Have questions about room availability, rates, amenities, or special arrangements?
                Reach out to our team in Kothapet anytime.
              </p>

              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#E0C37B]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-200/90 mb-1">
                      Hotel Address
                    </h4>
                    <p className="text-slate-200 font-light leading-relaxed text-xs">
                      {siteSettings.postalAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#E0C37B]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-200/90 mb-1">
                      Phone Number
                    </h4>
                    <a
                      href={`tel:${siteSettings.phone}`}
                      onClick={(e) => {
                        e.preventDefault();
                        initiatePhoneCall(siteSettings.phone, siteSettings.phoneDisplay);
                      }}
                      className="text-slate-200 hover:text-[#E0C37B] font-medium transition text-sm cursor-pointer inline-flex items-center gap-1.5 group"
                    >
                      <span>{siteSettings.phoneDisplay}</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#E0C37B]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-200/90 mb-1">
                      Email Address
                    </h4>
                    <a
                      href={`mailto:${siteSettings.email}`}
                      className="text-slate-200 hover:text-white font-light transition break-all text-xs"
                    >
                      {siteSettings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#E0C37B]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-200/90 mb-1">
                      Front Desk & Policies
                    </h4>
                    <p className="text-slate-200 font-light text-xs">
                      24/7 Front Desk · Check-in: {siteSettings.checkInTime} · Check-out: {siteSettings.checkOutTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links & WhatsApp Button */}
            <div className="pt-8 mt-8 border-t border-white/15">
              <div className="flex items-center space-x-3 mb-5">
                <a
                  href={siteSettings.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 hover:scale-110 active:scale-95 flex items-center justify-center text-white transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={siteSettings.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 hover:scale-110 active:scale-95 flex items-center justify-center text-white transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={siteSettings.socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 hover:scale-110 active:scale-95 flex items-center justify-center text-white transition-all"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>

              <a
                href={`https://wa.me/${siteSettings.whatsAppNumber.replace('+', '')}?text=${encodeURIComponent(
                  'Hi i am looking for Room'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <svg
                  className="w-4 h-4 fill-current text-white shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </FadeIn>

          {/* Right Column: Send Us a Message Form */}
          <FadeIn direction="left" className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-xl shadow-xs border border-stone-200">
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
              SEND A MESSAGE
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#0D1E3A] mb-2">
              We'd Love to Hear from You
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mb-8 font-light leading-relaxed">
              Fill out the form below, and our staff will respond to you as soon as possible.
            </p>

            {result && (
              <div
                className={`p-4 rounded-md mb-6 flex items-start gap-3 ${
                  result.success
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-medium">{result.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Your Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName || ''}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Srinivas Rao"
                    className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-[#0D1E3A] focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-[#0D1E3A] focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-[#0D1E3A] focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject || ''}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Room booking / Event inquiry"
                    className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-[#0D1E3A] focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Message <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message || ''}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your dates, number of guests, or any specific requests..."
                  className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-[#0D1E3A] focus:border-transparent outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold-luxury py-3.5 px-8 rounded-xl text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#081220]" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </FadeIn>
        </div>
      </section>

      {/* 3. FIND US ON THE MAP SECTION */}
      <section id="contact-map-section" className="py-16 bg-[#F1F4F8] border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
              LOCATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#0D1E3A]">
              Find Us on the Map
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-light mt-2">
              Located conveniently in Kothapet / Saroornagar, Hyderabad with easy connectivity.
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.1} className="bg-white rounded-xl overflow-hidden border border-stone-300 shadow-md">
            {/* Interactive Map Embed */}
            <div className="relative h-[360px] sm:h-[420px] w-full bg-stone-200">
              <iframe
                title="Lotus Grand Hotel Location Map"
                src={siteSettings.googleMapsEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200">
              <div className="text-xs sm:text-sm text-stone-700">
                <strong>Address:</strong> {siteSettings.postalAddress}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <a
                  href={siteSettings.googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-navy-luxury px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
                >
                  <span>Get Directions</span>
                  <Navigation className="w-3.5 h-3.5 text-[#E0C37B]" />
                </a>
                {siteSettings.googleMapsPlaceUrl && (
                  <a
                    href={siteSettings.googleMapsPlaceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium text-[#0D1E3A] border border-stone-300 hover:bg-stone-50 flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Place</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                  </a>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section id="contact-faq-section" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-10">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-1">
            FREQUENT QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#0D1E3A]">
            Guest FAQs
          </h2>
        </FadeIn>

        <StaggerContainer staggerDelay={0.08} className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <StaggerItem key={idx}>
                <div className="bg-white rounded-lg border border-stone-200 shadow-xs hover:border-amber-300 transition-colors overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-3 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start gap-2.5">
                      <HelpCircle className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base font-serif font-semibold text-stone-900">
                        {faq.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0D1E3A]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed px-5 pb-5 pl-11.5 border-t border-stone-100 pt-3">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>
    </div>
  );
};

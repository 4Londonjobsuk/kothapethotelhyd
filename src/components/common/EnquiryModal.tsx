import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Send, Phone, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { hotelService } from '../../services/hotelService';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useBodyScrollLock } from './MotionWrapper';
import { LotusLogo } from './LotusLogo';
import { initiatePhoneCall } from '../../utils/callUtils';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledRoom?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  prefilledRoom,
}) => {
  const siteSettings = useSiteSettings();
  const shouldReduceMotion = useReducedMotion();
  useBodyScrollLock(isOpen);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    prefilledRoom ? `Hello, I would like to inquire about booking the ${prefilledRoom} at Lotus Grand.` : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const res = await hotelService.submitEnquiry({
      fullName,
      email,
      phone,
      message,
    });

    setIsSubmitting(false);
    setResult(res);

    if (res.success) {
      setTimeout(() => {
        setFullName('');
        setEmail('');
        setPhone('');
        setMessage('');
      }, 1000);
    }
  };

  const whatsAppDirectUrl = `https://wa.me/${siteSettings.whatsAppNumber.replace('+', '')}?text=${encodeURIComponent(
    prefilledRoom ? `Hi i am looking for Room (${prefilledRoom})` : 'Hi i am looking for Room'
  )}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="enquiry-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden border border-stone-200"
          >
            {/* Modal Header */}
            <div className="bg-[#0A1830] text-white px-6 py-4 flex items-center justify-between border-b border-[#E0C37B]/30">
              <div className="flex items-center gap-3">
                <LotusLogo variant="emblem-only" size="sm" />
                <div>
                  <h3 id="enquiry-modal-title" className="font-serif text-base sm:text-lg font-medium tracking-wide">
                    Hotel Stay Enquiry
                  </h3>
                  <p className="text-[10px] text-[#E0C37B] tracking-wider uppercase font-semibold">Lotus Grand • Hyderabad</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-stone-300 hover:text-white p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer active:scale-95"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-xs sm:text-sm text-stone-600 mb-5 leading-relaxed">
                Send us your travel dates, room requirements, or special requests. Our front desk team in
                Kothapet, Hyderabad will respond promptly with confirmed availability and direct rates.
              </p>

              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-md mb-4 flex items-start gap-3 ${
                    result.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium">{result.message}</p>
                    {result.success && (
                      <button
                        onClick={onClose}
                        className="mt-3 text-xs bg-emerald-700 text-white px-3 py-1.5 rounded hover:bg-emerald-800 transition-colors cursor-pointer"
                      >
                        Close Window
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName || ''}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-[#0D1E3A]/30 focus:border-[#0D1E3A] outline-none transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                        Phone Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone || ''}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-[#0D1E3A]/30 focus:border-[#0D1E3A] outline-none transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email || ''}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-[#0D1E3A]/30 focus:border-[#0D1E3A] outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                      Enquiry / Message <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={message || ''}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please specify check-in date, number of guests, or room preferences..."
                      className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-[#0D1E3A]/30 focus:border-[#0D1E3A] outline-none transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-gold-luxury flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Submitting Enquiry...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#081220]" />
                          <span>Send Stay Enquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Direct Instant Actions */}
              <div className="mt-5 pt-5 border-t border-stone-100 grid grid-cols-2 gap-3 text-center text-xs">
                <a
                  href={`tel:${siteSettings.phone}`}
                  onClick={(e) => {
                    e.preventDefault();
                    initiatePhoneCall(siteSettings.phone, siteSettings.phoneDisplay);
                  }}
                  className="p-2.5 border border-stone-200 rounded hover:border-amber-400 hover:bg-stone-50 active:scale-98 transition-all flex items-center justify-center gap-2 text-stone-800 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Call Front Desk</span>
                </a>
                <a
                  href={whatsAppDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white rounded transition-all flex items-center justify-center gap-2 font-medium shadow-xs"
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

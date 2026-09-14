import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Phone, MessageSquare, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useBodyScrollLock } from './MotionWrapper';
import { LotusLogo } from './LotusLogo';

interface CallActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallActionModal: React.FC<CallActionModalProps> = ({ isOpen, onClose }) => {
  const siteSettings = useSiteSettings();
  const shouldReduceMotion = useReducedMotion();
  useBodyScrollLock(isOpen);

  const [copied, setCopied] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }
  }, []);

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

  const handleCopyNumber = () => {
    try {
      const numOnly = siteSettings.phoneDisplay.replace(/\s+/g, '');
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(numOnly);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = numOnly;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.debug('Failed to copy', e);
    }
  };

  const handleDirectDial = () => {
    handleCopyNumber();
    try {
      window.location.href = `tel:${siteSettings.phone}`;
    } catch {
      try {
        window.open(`tel:${siteSettings.phone}`, '_top');
      } catch {
        // Fallback
      }
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  const whatsAppUrl = `https://wa.me/${siteSettings.whatsAppNumber.replace('+', '')}?text=${encodeURIComponent(
    'Hi Lotus Grand Front Desk, I am looking for a room enquiry.'
  )}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#040914]/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-[#071324] border border-[#E0C37B]/40 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 sm:p-7 text-white z-10 overflow-hidden"
          >
            {/* Ambient Gold Glow Corner */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#E0C37B]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Brand */}
            <div className="flex items-center gap-3 mb-4">
              <LotusLogo variant="icon" size="sm" />
              <div>
                <span className="text-[10px] tracking-[0.25em] font-serif font-bold text-[#E0C37B] uppercase block">
                  Lotus Grand Hyderabad
                </span>
                <h3 className="text-lg font-serif font-bold text-white tracking-wide">
                  24/7 Live Front Desk
                </h3>
              </div>
            </div>

            {/* Phone Display Card */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-[#0B1A2E] to-[#07101E] border border-[#E0C37B]/30 mb-5 text-center relative">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Reception • Available Now
              </div>

              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#FDE8A5] tracking-wider mb-1">
                {siteSettings.phoneDisplay}
              </div>
              <p className="text-xs text-stone-400 font-light">
                Direct hotel desk for instant bookings & assistance
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 mb-4">
              {/* Primary Call Button */}
              <a
                href={`tel:${siteSettings.phone}`}
                onClick={handleDirectDial}
                target="_top"
                className="w-full py-3 px-4 rounded-xl font-serif text-sm font-bold tracking-wide uppercase text-[#050C17] bg-gradient-to-r from-[#FDE8A5] via-[#E4C277] to-[#B98E34] hover:from-[#FFF0B8] hover:to-[#CA9B3C] shadow-[0_4px_16px_rgba(224,195,123,0.3)] hover:shadow-[0_6px_22px_rgba(224,195,123,0.45)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#050C17]" />
                <span>Call Directly in Phone App</span>
              </a>

              {/* Chat on WhatsApp */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-emerald-100 hover:text-white bg-[#063321] hover:bg-[#09472e] border border-emerald-500/40 hover:border-emerald-400 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>Chat Instantly on WhatsApp</span>
              </a>

              {/* Copy Phone Number */}
              <button
                onClick={handleCopyNumber}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-stone-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E0C37B]/40 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">Phone Number Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#E0C37B]" />
                    <span>Copy Phone Number ({siteSettings.phoneDisplay})</span>
                  </>
                )}
              </button>
            </div>

            {/* Iframe or Desktop Help Note */}
            <div className="pt-3 border-t border-stone-800/80 text-[11px] text-stone-400 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E0C37B] shrink-0 mt-0.5" />
                <span>
                  On laptops or desktop computers without a phone app, you can use WhatsApp or copy the number to dial from your phone.
                </span>
              </div>

              {isInIframe && (
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-stone-400">Testing in preview window?</span>
                  <button
                    onClick={handleOpenInNewTab}
                    className="inline-flex items-center gap-1 text-[#E0C37B] hover:text-[#FFF] underline font-medium cursor-pointer"
                  >
                    <span>Open site in new tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

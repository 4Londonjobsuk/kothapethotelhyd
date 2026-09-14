import React, { useState, useEffect } from 'react';
import { Settings, Phone, Mail, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { siteSettings as defaultSettings } from '../../data/hotelData';
import { hotelService } from '../../services/hotelService';

export const AdminSettingsPage: React.FC = () => {
  const [phone, setPhone] = useState(defaultSettings.phoneDisplay);
  const [whatsApp, setWhatsApp] = useState(defaultSettings.whatsAppNumber);
  const [email, setEmail] = useState(defaultSettings.email);
  const [checkIn, setCheckIn] = useState(defaultSettings.checkInTime);
  const [checkOut, setCheckOut] = useState(defaultSettings.checkOutTime);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        const data = await hotelService.getSettings();
        if (isMounted && data) {
          setPhone(data.phoneDisplay || data.phone || defaultSettings.phoneDisplay);
          setWhatsApp(data.whatsAppNumber || defaultSettings.whatsAppNumber);
          setEmail(data.email || defaultSettings.email);
          setCheckIn(data.checkInTime || defaultSettings.checkInTime);
          setCheckOut(data.checkOutTime || defaultSettings.checkOutTime);
        }
      } catch (err) {
        console.warn('Failed to load settings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await hotelService.updateSiteSettings({
        phone,
        phoneDisplay: phone,
        whatsAppNumber: whatsApp,
        email,
        checkInTime: checkIn,
        checkOutTime: checkOut,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.warn('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px] text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-[#C59A47]" />
        <span>Loading hotel settings...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-stone-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D1E3A] border border-[#C59A47]/40 flex items-center justify-center text-[#E0C37B]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-medium text-stone-100">
              Hotel Global Settings
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Super Admin module: Configure front-desk contact phone numbers, WhatsApp reservation link, and check-in timings.
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Hotel settings successfully updated and saved across the website.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#0B1526] rounded-2xl border border-stone-800/80 p-6 space-y-5 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Front Desk Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              WhatsApp Reservation Hotline
            </label>
            <input
              type="text"
              value={whatsApp}
              onChange={(e) => setWhatsApp(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Official Enquiries Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Standard Check-In
              </label>
              <input
                type="text"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Standard Check-Out
              </label>
              <input
                type="text"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-[#C59A47]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#C59A47] hover:bg-[#b0873a] text-stone-950 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Hotel Configuration</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

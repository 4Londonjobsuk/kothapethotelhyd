import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  HelpCircle,
  FileText,
  X,
  Sparkles,
  Loader2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PrivacyNoticeSettings, PrivacySection } from '../../types';
import { hotelService } from '../../services/hotelService';

interface AdminPrivacyPageProps {
  isEmbedded?: boolean;
}

export const AdminPrivacyPage: React.FC<AdminPrivacyPageProps> = ({ isEmbedded = false }) => {
  const [data, setData] = useState<PrivacyNoticeSettings>(() => hotelService.getPrivacyNoticeFallback());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Expanded sections accordion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Safety Confirmation Modals
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; index: number } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Load Privacy Notice on Mount
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await hotelService.getPrivacyNotice();
        if (isMounted && res) {
          setData(res);
          // Expand first 2 sections by default
          const initialExpanded: Record<string, boolean> = {};
          (res.sections || []).forEach((sec, idx) => {
            initialExpanded[sec.id || `sec-${idx}`] = idx < 2;
          });
          setExpandedSections(initialExpanded);
        }
      } catch (err) {
        console.error('Failed to load Privacy Notice:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();

    const handleUpdate = () => {
      load();
    };

    window.addEventListener('lotus_privacy_notice_updated', handleUpdate);
    window.addEventListener('lotus_trash_updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('lotus_privacy_notice_updated', handleUpdate);
      window.removeEventListener('lotus_trash_updated', handleUpdate);
    };
  }, []);

  const triggerSuccessBanner = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await hotelService.savePrivacyNotice(data);
      if (res.success) {
        triggerSuccessBanner('Privacy Notice successfully updated and published to the live website!');
      } else {
        setErrorMsg(res.error || 'Failed to save changes.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    const fallback = hotelService.getPrivacyNoticeFallback();
    setData(fallback);
    setShowResetConfirm(false);
    triggerSuccessBanner('Reset to standard compliant hotel privacy notice template. Click Save to publish.');
  };

  const toggleSectionExpand = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Section updates
  const updateSectionField = (index: number, field: keyof PrivacySection, value: any) => {
    setData((prev) => {
      const copy = [...prev.sections];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, sections: copy };
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.sections.length) return;
    setData((prev) => {
      const copy = [...prev.sections];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, sections: copy };
    });
  };

  const handleAddSection = () => {
    const newId = `privacy-sec-${Date.now()}`;
    const newSection: PrivacySection = {
      id: newId,
      title: 'New Policy Clause',
      badge: 'Guest Guideline',
      iconName: 'ShieldCheck',
      content: 'Enter detailed policy description and guest guidelines here.',
      bulletPoints: ['First key requirement or standard for staying guests.'],
      displayOrder: data.sections.length + 1,
      isActive: true,
    };
    setData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setExpandedSections((prev) => ({ ...prev, [newId]: true }));
  };

  const confirmDeleteSection = () => {
    if (!deleteTarget) return;
    const removed = data.sections[deleteTarget.index];
    if (removed) {
      // Send to Trash
      hotelService.addToTrash({
        originalId: removed.id,
        type: 'privacy_section',
        title: removed.title,
        subtitle: removed.badge,
        data: removed,
      });
    }

    setData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== deleteTarget.index),
    }));
    setDeleteTarget(null);
    triggerSuccessBanner(`Section "${deleteTarget.title}" moved to Recycle Bin.`);
  };

  // Bullet points helpers
  const handleAddBullet = (secIndex: number) => {
    setData((prev) => {
      const copy = [...prev.sections];
      const bullets = Array.isArray(copy[secIndex].bulletPoints) ? [...copy[secIndex].bulletPoints!] : [];
      bullets.push('New key guideline item');
      copy[secIndex] = { ...copy[secIndex], bulletPoints: bullets };
      return { ...prev, sections: copy };
    });
  };

  const handleUpdateBullet = (secIndex: number, bulletIndex: number, text: string) => {
    setData((prev) => {
      const copy = [...prev.sections];
      const bullets = [...(copy[secIndex].bulletPoints || [])];
      bullets[bulletIndex] = text;
      copy[secIndex] = { ...copy[secIndex], bulletPoints: bullets };
      return { ...prev, sections: copy };
    });
  };

  const handleRemoveBullet = (secIndex: number, bulletIndex: number) => {
    setData((prev) => {
      const copy = [...prev.sections];
      const bullets = (copy[secIndex].bulletPoints || []).filter((_, idx) => idx !== bulletIndex);
      copy[secIndex] = { ...copy[secIndex], bulletPoints: bullets };
      return { ...prev, sections: copy };
    });
  };

  // Quick Clause Templates
  const handleInsertClauseTemplate = (templateType: 'alcohol' | 'pets' | 'visitors' | 'lost_found') => {
    let newSec: PrivacySection;
    const newId = `privacy-template-${Date.now()}`;
    switch (templateType) {
      case 'alcohol':
        newSec = {
          id: newId,
          title: 'Guest Conduct & Non-Smoking Guidelines',
          badge: 'Premises Standards',
          iconName: 'Shield',
          content:
            'Lotus Grand maintains a family-friendly, comfortable atmosphere for all guests. Smoking is strictly restricted to designated open-air zones.',
          bulletPoints: [
            'Smoking inside air-conditioned guest bedrooms is strictly prohibited to maintain fresh air standards.',
            'Disorderly behavior or noise disturbance past 10:00 PM will result in immediate front desk intervention.',
          ],
          displayOrder: data.sections.length + 1,
          isActive: true,
        };
        break;
      case 'pets':
        newSec = {
          id: newId,
          title: 'Pet & Animal Accommodation Policy',
          badge: 'Hygiene & Comfort',
          iconName: 'CheckCircle2',
          content:
            'In order to ensure strict allergy-safe hygiene and comfort for all our resident guests, pets are generally not permitted within guest rooms.',
          bulletPoints: [
            'Assistance and guide animals are permitted with advance intimation at the time of reservation.',
            'Please contact front desk management prior to booking for special assistance arrangements.',
          ],
          displayOrder: data.sections.length + 1,
          isActive: true,
        };
        break;
      case 'visitors':
        newSec = {
          id: newId,
          title: 'Lobby Lounge & Outside Visitor Policy',
          badge: 'Premises Security',
          iconName: 'UserCheck',
          content:
            'In adherence to local law enforcement security guidelines, non-registered visitors are welcomed to meet guests in the main reception lounge.',
          bulletPoints: [
            'All non-resident visitors must register their name and contact number at the front desk.',
            'Overnight stays in guest rooms require mandatory registered check-in with physical government ID.',
          ],
          displayOrder: data.sections.length + 1,
          isActive: true,
        };
        break;
      case 'lost_found':
        newSec = {
          id: newId,
          title: 'Safe Keeping & Lost Property Policy',
          badge: 'Guest Care',
          iconName: 'Lock',
          content:
            'Items left behind by guests are logged into our secure housekeeping register and safely stored for a duration of 30 days.',
          bulletPoints: [
            'Valuable personal items (electronic devices, jewelry, documents) are kept in the manager safe.',
            'Guests may coordinate parcel dispatch or personal collection by presenting booking proof.',
          ],
          displayOrder: data.sections.length + 1,
          isActive: true,
        };
        break;
    }
    setData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSec],
    }));
    setExpandedSections((prev) => ({ ...prev, [newId]: true }));
    triggerSuccessBanner(`Added "${newSec.title}" clause! Don't forget to click Save.`);
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-stone-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E0C37B]" />
        <span className="text-xs uppercase tracking-widest font-sans">Loading Privacy Notice CMS...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isEmbedded ? 'pt-2' : ''}`}>
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0D1E3A] border border-[#E0C37B]/30 flex items-center justify-center text-[#E0C37B]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif text-[#E0C37B] font-bold">
                Guest Privacy Notice & Policies
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                Update public legal clauses, CCTV surveillance policies, statutory guest ID rules, and grievance contacts.
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 hover:text-white text-xs transition-colors cursor-pointer"
            title="Preview how guests see this notice"
          >
            <Eye className="w-3.5 h-3.5 text-[#E0C37B]" />
            <span>Preview Notice</span>
          </button>

          <a
            href="#privacy"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 hover:text-[#E0C37B] text-xs transition-colors"
            title="View Live Public Page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Website</span>
          </a>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-400 hover:text-rose-300 text-xs transition-colors cursor-pointer"
            title="Reset to standard hotel template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Template</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#FDE8A5] via-[#E4C277] to-[#B98E34] hover:from-[#FFF0B8] hover:to-[#CA9B3C] text-stone-950 text-xs font-serif font-bold uppercase tracking-wider shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-stone-950" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{saveSuccess}</span>
          </div>
          <button
            onClick={() => setSaveSuccess(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. DOCUMENT HEADER & META CARD */}
      <div className="p-6 rounded-2xl bg-[#0B1526] border border-[#C59A47]/20 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#E0C37B]" />
            <h2 className="text-sm font-serif font-bold text-stone-100 uppercase tracking-wider">
              Document Header & Preamble
            </h2>
          </div>
          <span className="text-[11px] text-stone-400">
            Public Heading & Legal Introduction
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-stone-300 font-medium">Policy Title</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-700 focus:border-[#E0C37B] text-stone-100 text-xs outline-none transition-colors"
              placeholder="e.g. Guest Privacy Notice & Data Protection Policy"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-stone-300 font-medium">Last Updated Revision</label>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const months = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ];
                  const formatted = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
                  setData({ ...data, lastUpdated: formatted });
                }}
                className="text-[10px] text-[#E0C37B] hover:underline cursor-pointer"
              >
                Set to Today
              </button>
            </div>
            <input
              type="text"
              value={data.lastUpdated}
              onChange={(e) => setData({ ...data, lastUpdated: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-700 focus:border-[#E0C37B] text-stone-100 text-xs outline-none transition-colors"
              placeholder="e.g. September 12, 2026"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs text-stone-300 font-medium">Subtitle / Hotel Scope</label>
            <input
              type="text"
              value={data.subtitle}
              onChange={(e) => setData({ ...data, subtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-700 focus:border-[#E0C37B] text-stone-100 text-xs outline-none transition-colors"
              placeholder="e.g. Lotus Grand Hotel, Kothapet, Hyderabad — Safeguarding guest confidentiality"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs text-stone-300 font-medium">Introduction / Preamble Statement</label>
            <textarea
              rows={3}
              value={data.introText}
              onChange={(e) => setData({ ...data, introText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070E1A] border border-stone-700 focus:border-[#E0C37B] text-stone-100 text-xs outline-none transition-colors leading-relaxed resize-y"
              placeholder="Welcome to Lotus Grand Hotel. We are committed to protecting your privacy..."
            />
          </div>
        </div>
      </div>

      {/* 2. PRE-WRITTEN CLAUSE TEMPLATES QUICK INSERTER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#081222] border border-[#E0C37B]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#E0C37B]" />
          <div>
            <span className="text-xs text-white font-serif font-bold">
              Quick Hotel Clause Inserter
            </span>
            <p className="text-[11px] text-stone-400">
              One-click standard clauses for hospitality compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleInsertClauseTemplate('alcohol')}
            className="px-2.5 py-1.5 rounded-lg bg-[#0D1E3A] border border-stone-700 hover:border-[#E0C37B] text-[11px] text-stone-200 transition-colors cursor-pointer"
          >
            + Smoking & Conduct
          </button>
          <button
            onClick={() => handleInsertClauseTemplate('visitors')}
            className="px-2.5 py-1.5 rounded-lg bg-[#0D1E3A] border border-stone-700 hover:border-[#E0C37B] text-[11px] text-stone-200 transition-colors cursor-pointer"
          >
            + Outside Visitors
          </button>
          <button
            onClick={() => handleInsertClauseTemplate('pets')}
            className="px-2.5 py-1.5 rounded-lg bg-[#0D1E3A] border border-stone-700 hover:border-[#E0C37B] text-[11px] text-stone-200 transition-colors cursor-pointer"
          >
            + Pet Accommodation
          </button>
          <button
            onClick={() => handleInsertClauseTemplate('lost_found')}
            className="px-2.5 py-1.5 rounded-lg bg-[#0D1E3A] border border-stone-700 hover:border-[#E0C37B] text-[11px] text-stone-200 transition-colors cursor-pointer"
          >
            + Lost & Found
          </button>
        </div>
      </div>

      {/* 3. POLICY SECTIONS MANAGER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-[#E0C37B]">
              Policy Sections ({data.sections.length})
            </h2>
            <p className="text-xs text-stone-400">
              Add, reorder, edit, or toggle visibility for each privacy policy module.
            </p>
          </div>

          <button
            onClick={handleAddSection}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D1E3A] hover:bg-[#132c58] text-[#E0C37B] border border-[#E0C37B]/40 text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Section</span>
          </button>
        </div>

        <div className="space-y-4">
          {data.sections.map((sec, idx) => {
            const isExpanded = expandedSections[sec.id || `sec-${idx}`] !== false;
            return (
              <div
                key={sec.id || idx}
                className="rounded-2xl bg-[#0B1526] border border-stone-800 hover:border-stone-700 transition-all overflow-hidden shadow-sm"
              >
                {/* Section Header Accordion Bar */}
                <div
                  className="px-5 py-3.5 flex items-center justify-between gap-3 bg-[#081120] cursor-pointer select-none"
                  onClick={() => toggleSectionExpand(sec.id || `sec-${idx}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#070E1A] text-stone-400 text-xs font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-medium text-stone-200 truncate">
                      {sec.title || 'Untitled Section'}
                    </h3>
                    {sec.badge && (
                      <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#070E1A] text-[#E0C37B] border border-[#E0C37B]/30">
                        {sec.badge}
                      </span>
                    )}
                    {!sec.isActive && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60">
                        Draft / Hidden
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === data.sections.length - 1}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() =>
                        setDeleteTarget({
                          id: sec.id,
                          title: sec.title,
                          index: idx,
                        })
                      }
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleSectionExpand(sec.id || `sec-${idx}`)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Section Expanded Body */}
                {isExpanded && (
                  <div className="p-5 space-y-4 border-t border-stone-800/80">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                      <div className="sm:col-span-6 space-y-1">
                        <label className="text-[11px] text-stone-400 font-medium">Section Title</label>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => updateSectionField(idx, 'title', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#070E1A] border border-stone-700 text-stone-100 text-xs outline-none focus:border-[#E0C37B]"
                          placeholder="e.g. 1. Information We Collect from Guests"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] text-stone-400 font-medium">Category Badge</label>
                        <input
                          type="text"
                          value={sec.badge || ''}
                          onChange={(e) => updateSectionField(idx, 'badge', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#070E1A] border border-stone-700 text-stone-100 text-xs outline-none focus:border-[#E0C37B]"
                          placeholder="e.g. Mandatory Compliance"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] text-stone-400 font-medium">Status Visibility</label>
                        <div className="pt-1 flex items-center gap-2">
                          <label className="inline-flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sec.isActive !== false}
                              onChange={(e) => updateSectionField(idx, 'isActive', e.target.checked)}
                              className="rounded border-stone-700 text-[#C59A47] focus:ring-[#C59A47]"
                            />
                            <span>{sec.isActive !== false ? 'Active (Live)' : 'Draft (Hidden)'}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-stone-400 font-medium">Detailed Explanation</label>
                      <textarea
                        rows={3}
                        value={sec.content}
                        onChange={(e) => updateSectionField(idx, 'content', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070E1A] border border-stone-700 text-stone-100 text-xs outline-none focus:border-[#E0C37B] leading-relaxed resize-y"
                        placeholder="Provide full legal and operational details..."
                      />
                    </div>

                    {/* Bullet Points Manager */}
                    <div className="space-y-2 pt-2 border-t border-stone-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-stone-300">
                          Bullet Highlights ({(sec.bulletPoints || []).length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddBullet(idx)}
                          className="text-[10px] text-[#E0C37B] hover:underline cursor-pointer"
                        >
                          + Add Bullet
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(sec.bulletPoints || []).map((bText, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2">
                            <span className="text-stone-500 text-xs">•</span>
                            <input
                              type="text"
                              value={bText}
                              onChange={(e) => handleUpdateBullet(idx, bIdx, e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-[#070E1A] border border-stone-700 text-stone-200 text-xs outline-none focus:border-[#E0C37B]"
                              placeholder="Key bullet point..."
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(idx, bIdx)}
                              className="p-1 rounded text-stone-500 hover:text-rose-400 cursor-pointer"
                              title="Delete Bullet"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. GRIEVANCE REDRESSAL OFFICER DETAILS */}
      <div className="p-6 rounded-2xl bg-[#0B1526] border border-[#C59A47]/20 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#E0C37B]" />
            <h2 className="text-sm font-serif font-bold text-stone-100 uppercase tracking-wider">
              Data Protection & Grievance Redressal Desk
            </h2>
          </div>
          <span className="text-[11px] text-stone-400">
            Mandatory Statutory Compliance Info
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-stone-300 font-medium">Designated Officer / Department Name</label>
            <input
              type="text"
              value={data.grievanceOfficer?.name || ''}
              onChange={(e) =>
                setData({
                  ...data,
                  grievanceOfficer: { ...data.grievanceOfficer, name: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-[#070E1A] border border-stone-700 text-stone-100 text-xs outline-none focus:border-[#E0C37B]"
              placeholder="e.g. Guest Relations & Privacy Compliance Officer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-stone-300 font-medium">Designation / Role Title</label>
            <input
              type="text"
              value={data.grievanceOfficer?.designation || ''}
              onChange={(e) =>
                setData({
                  ...data,
                  grievanceOfficer: { ...data.grievanceOfficer, designation: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-[#070E1A] border border-stone-700 text-stone-100 text-xs outline-none focus:border-[#E0C37B]"
              placeholder="e.g. General Manager / Front Office Compliance"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-stone-300 font-medium">Official Privacy Email</label>
            <input
              type="email"
              value={data.grievanceOfficer?.email || ''}
              onChange={(e) =>
                setData({
                  ...data,
                  grievanceOfficer: { ...data.grievanceOfficer, email: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-[#070E1A] border border-stone-700 text-stone-100 text-xs outline-none focus:border-[#E0C37B]"
              placeholder="info@lotusgrand.in"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-stone-300 font-medium">Official Contact Helpline</label>
            <input
              type="text"
              value={data.grievanceOfficer?.phone || ''}
              onChange={(e) =>
                setData({
                  ...data,
                  grievanceOfficer: { ...data.grievanceOfficer, phone: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-[#070E1A] border border-stone-700 text-stone-100 text-xs outline-none focus:border-[#E0C37B]"
              placeholder="090326 66941"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-stone-300 font-medium">Operating Hours & Desk Availability</label>
            <input
              type="text"
              value={data.grievanceOfficer?.workingHours || ''}
              onChange={(e) =>
                setData({
                  ...data,
                  grievanceOfficer: { ...data.grievanceOfficer, workingHours: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-[#070E1A] border border-stone-700 text-stone-100 text-xs outline-none focus:border-[#E0C37B]"
              placeholder="10:00 AM – 7:00 PM (Monday to Saturday)"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs text-stone-300 font-medium">Postal Address for Formal Legal Communications</label>
            <input
              type="text"
              value={data.grievanceOfficer?.address || ''}
              onChange={(e) =>
                setData({
                  ...data,
                  grievanceOfficer: { ...data.grievanceOfficer, address: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-[#070E1A] border border-stone-700 text-stone-100 text-xs outline-none focus:border-[#E0C37B]"
              placeholder="Lotus Grand Hotel, Beside PVT Market, Kothapet, Hyderabad, Telangana 500035"
            />
          </div>
        </div>
      </div>

      {/* 5. FOOTER DISCLAIMER */}
      <div className="p-6 rounded-2xl bg-[#0B1526] border border-[#C59A47]/20 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
          <h2 className="text-xs font-serif font-bold text-stone-200 uppercase tracking-wider">
            Footer Policy Modification Disclaimer
          </h2>
          <span className="text-[10px] text-stone-400">Displayed at bottom of the policy page</span>
        </div>
        <textarea
          rows={2}
          value={data.footerNotice || ''}
          onChange={(e) => setData({ ...data, footerNotice: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl bg-[#070E1A] border border-stone-700 text-stone-200 text-xs outline-none focus:border-[#E0C37B] resize-y"
          placeholder="Lotus Grand Hotel reserves the right to periodically review and update this Privacy Notice..."
        />
      </div>

      {/* Floating Save Bar */}
      <div className="sticky bottom-4 z-20 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FDE8A5] via-[#E4C277] to-[#B98E34] text-stone-950 font-serif font-bold text-xs uppercase tracking-wider shadow-2xl hover:scale-102 active:scale-98 transition-all cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Publishing Changes...' : 'Save & Publish Privacy Notice'}</span>
        </button>
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0B1526] border border-rose-800/60 rounded-2xl p-6 text-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800/80 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-white">Delete Policy Section?</h4>
                <p className="text-xs text-stone-400">This section will be moved to the Recycle Bin.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 p-3 rounded-xl bg-[#070E1A] border border-stone-800">
              <strong className="text-white block mb-0.5">{deleteTarget.title}</strong>
              You can restore this clause anytime from the Recycle Bin if needed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white bg-stone-800/70"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSection}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-700 hover:bg-rose-600"
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET TEMPLATE MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0B1526] border border-[#E0C37B]/40 rounded-2xl p-6 text-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0D1E3A] border border-[#E0C37B]/40 flex items-center justify-center text-[#E0C37B] shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-white">Reset to Standard Template?</h4>
                <p className="text-xs text-stone-400">Reverts to statutory standard hotel policy clauses.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              This will restore the standard 8 sections covering mandatory Indian guest registration, CCTV surveillance, payment security, zero-spam confidentiality, and the Kothapet compliance desk.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white bg-stone-800/70"
              >
                Cancel
              </button>
              <button
                onClick={handleResetToDefault}
                className="px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider text-stone-950 bg-gradient-to-r from-[#FDE8A5] to-[#E4C277]"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#FAFAFA] text-stone-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-300">
            {/* Modal Header */}
            <div className="p-4 bg-[#0A1830] text-stone-200 flex items-center justify-between border-b border-[#E0C37B]/30 shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#E0C37B]" />
                <span className="font-serif text-sm font-bold text-white">
                  Live Guest Preview — Privacy Notice
                </span>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="space-y-2 text-center max-w-2xl mx-auto">
                <span className="text-[11px] font-mono text-[#7A5B18] font-bold uppercase tracking-wider">
                  Effective: {data.lastUpdated}
                </span>
                <h2 className="font-serif text-2xl font-bold text-stone-900">{data.title}</h2>
                <p className="text-xs text-stone-600">{data.subtitle}</p>
                <p className="text-xs sm:text-sm text-stone-700 pt-2 leading-relaxed font-normal">{data.introText}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-stone-200">
                {data.sections.filter((s) => s.isActive !== false).map((sec, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900">{sec.title}</h3>
                      {sec.badge && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                          {sec.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">{sec.content}</p>
                    {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                      <ul className="space-y-1 pt-2">
                        {sec.bulletPoints.map((b, bIdx) => (
                          <li key={bIdx} className="text-xs text-stone-600 flex items-start gap-2">
                            <span className="text-[#C59A47]">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Grievance Desk in Preview */}
              <div className="p-5 rounded-2xl bg-[#071122] text-stone-200 space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#E0C37B]">
                  Grievance Redressal & Privacy Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-300">
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Officer</span>
                    <strong className="text-white">{data.grievanceOfficer?.name}</strong> (
                    {data.grievanceOfficer?.designation})
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Helpline</span>
                    <span className="text-[#E0C37B]">{data.grievanceOfficer?.phone}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Email</span>
                    <span>{data.grievanceOfficer?.email}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase">Hours</span>
                    <span>{data.grievanceOfficer?.workingHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end shrink-0">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-serif uppercase tracking-wider"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

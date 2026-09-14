import React, { useState, useEffect, useMemo } from 'react';
import {
  Trash2,
  RotateCcw,
  Search,
  Filter,
  Bed,
  Sparkles,
  Compass,
  Image as ImageIcon,
  Mail,
  Layers,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Info,
  FileText,
} from 'lucide-react';
import { hotelService } from '../../services/hotelService';
import { TrashItem, TrashItemType } from '../../types';

interface AdminTrashPageProps {
  onNavigate?: (page: any) => void;
}

export const AdminTrashPage: React.FC<AdminTrashPageProps> = () => {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [purgingId, setPurgingId] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState<boolean>(false);
  const [showRestoreAllConfirm, setShowRestoreAllConfirm] = useState<boolean>(false);
  const [itemToPurge, setItemToPurge] = useState<TrashItem | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setBannerMessage({ text, type });
    setTimeout(() => {
      setBannerMessage(null);
    }, 4500);
  };

  const loadTrash = async () => {
    try {
      setLoading(true);
      const data = await hotelService.getTrashItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load trash items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();

    const handleTrashUpdate = (e: any) => {
      if (e.detail) {
        setItems(e.detail);
      } else {
        loadTrash();
      }
    };

    window.addEventListener('lotus_trash_updated', handleTrashUpdate);
    return () => {
      window.removeEventListener('lotus_trash_updated', handleTrashUpdate);
    };
  }, []);

  const handleRestore = async (item: TrashItem) => {
    setRestoringId(item.id);
    try {
      const res = await hotelService.restoreTrashItem(item.id);
      if (res.success) {
        showNotification(res.message || `"${item.title}" successfully restored!`);
        await loadTrash();
      } else {
        showNotification(res.error || 'Failed to restore item.', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'An error occurred during restore.', 'error');
    } finally {
      setRestoringId(null);
    }
  };

  const handlePurge = async (item: TrashItem) => {
    setPurgingId(item.id);
    try {
      const res = await hotelService.purgeTrashItem(item.id);
      if (res.success) {
        showNotification(`"${item.title}" permanently removed.`);
        setItemToPurge(null);
        await loadTrash();
      } else {
        showNotification(res.error || 'Failed to purge item.', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error purging item.', 'error');
    } finally {
      setPurgingId(null);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await hotelService.emptyTrash();
      setShowEmptyConfirm(false);
      showNotification('Recycle Bin has been completely emptied.');
      await loadTrash();
    } catch (err: any) {
      showNotification('Failed to empty Recycle Bin.', 'error');
    }
  };

  const handleRestoreAll = async () => {
    try {
      const res = await hotelService.restoreAllTrash();
      setShowRestoreAllConfirm(false);
      showNotification(`All ${res.count} items have been restored successfully!`);
      await loadTrash();
    } catch (err: any) {
      showNotification('Failed to restore all items.', 'error');
    }
  };

  const getTypeMeta = (type: TrashItemType) => {
    switch (type) {
      case 'room':
        return {
          label: 'Room',
          icon: Bed,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'amenity':
        return {
          label: 'Amenity',
          icon: Sparkles,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'attraction':
        return {
          label: 'Attraction',
          icon: Compass,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'gallery':
        return {
          label: 'Gallery',
          icon: ImageIcon,
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'enquiry':
        return {
          label: 'Enquiry',
          icon: Mail,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'hero_slide':
        return {
          label: 'Banner Slide',
          icon: Layers,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'testimonial':
        return {
          label: 'Review',
          icon: Layers,
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      case 'faq':
        return {
          label: 'FAQ',
          icon: Info,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
        };
      case 'story_paragraph':
        return {
          label: 'Story Paragraph',
          icon: FileText,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      default:
        return {
          label: 'Item',
          icon: Layers,
          bg: 'bg-stone-50 text-stone-700 border-stone-200',
        };
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
        item.originalId.toLowerCase().includes(query);
      return matchesType && matchesQuery;
    });
  }, [items, selectedType, searchQuery]);

  const countsByType = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const item of items) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
    return counts;
  }, [items]);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div id="admin-trash-page" className="space-y-6">
      {/* Toast Banner */}
      {bannerMessage && (
        <div
          id="trash-toast-banner"
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-4 ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-700'
              : 'bg-rose-900/95 text-white border-rose-700'
          }`}
        >
          {bannerMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{bannerMessage.text}</span>
          <button
            onClick={() => setBannerMessage(null)}
            className="ml-3 text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-44 h-44 bg-amber-50 rounded-full blur-2xl pointer-events-none opacity-60" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold tracking-wider text-amber-900 uppercase">
                Data Safety & Recovery Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Recycle Bin (రీసైకిల్ బిన్)
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Deleted rooms, amenities, attractions, gallery photos, or enquiries are safely kept here. If an item was deleted by mistake, you can restore it back to the live site at any time with full data intact.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="refresh-trash-btn"
              onClick={loadTrash}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors disabled:opacity-50"
              title="Refresh Bin"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {items.length > 0 && (
              <>
                <button
                  id="restore-all-btn"
                  onClick={() => setShowRestoreAllConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore All ({items.length})</span>
                </button>

                <button
                  id="empty-bin-btn"
                  onClick={() => setShowEmptyConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Empty Bin</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Safety Highlights */}
        <div className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Instant Restoration:</strong> Restores directly back into the live inventory.</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span><strong>Timestamped History:</strong> Exact deletion time recorded for safety.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Zero Data Loss:</strong> Complete properties & image links preserved.</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="trash-search-input"
              type="text"
              placeholder="Search deleted items by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-stone-500 flex items-center gap-1.5 self-start sm:self-center">
            <Filter className="w-3.5 h-3.5" />
            <span>
              Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> deleted items
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'room', label: 'Rooms' },
            { id: 'amenity', label: 'Amenities' },
            { id: 'attraction', label: 'Attractions' },
            { id: 'gallery', label: 'Gallery' },
            { id: 'enquiry', label: 'Enquiries' },
            { id: 'hero_slide', label: 'Banner Slides' },
            { id: 'testimonial', label: 'Reviews' },
            { id: 'story_paragraph', label: 'Story Paragraphs' },
            { id: 'faq', label: 'FAQs' },
          ].map((tab) => {
            const count = countsByType[tab.id] || 0;
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                id={`trash-filter-tab-${tab.id}`}
                onClick={() => setSelectedType(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-amber-800 text-amber-100' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-stone-200 text-center">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-600">Loading Recycle Bin contents...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 sm:p-16 border border-stone-200 text-center">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-1">
            {items.length === 0
              ? 'Recycle Bin is Empty'
              : 'No deleted items matching this filter'}
          </h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            {items.length === 0
              ? 'All your hotel rooms, amenities, attractions, gallery photos, and enquiries are active and safe. When you delete any item in the admin dashboard, it will appear here so you can restore it anytime.'
              : 'Try selecting a different filter category or clearing your search keywords.'}
          </p>
          {items.length > 0 && selectedType !== 'all' && (
            <button
              onClick={() => {
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const meta = getTypeMeta(item.type);
            const Icon = meta.icon;
            const isRestoring = restoringId === item.id;
            const isPurging = purgingId === item.id;

            return (
              <div
                key={item.id}
                id={`trash-item-${item.id}`}
                className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  {/* Thumbnail / Icon preview */}
                  <div className="w-14 h-14 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image && item.image.startsWith('http') ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Icon className="w-6 h-6 text-stone-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold border rounded-md uppercase tracking-wider ${meta.bg}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{meta.label}</span>
                      </span>
                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(item.deletedAt)}</span>
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-stone-900 truncate">
                      {item.title}
                    </h4>

                    {item.subtitle && (
                      <p className="text-xs text-stone-500 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}

                    <p className="text-[11px] text-stone-400 font-mono mt-1">
                      ID: {item.originalId}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Safe to restore</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      id={`purge-btn-${item.id}`}
                      onClick={() => setItemToPurge(item)}
                      disabled={isRestoring || isPurging}
                      className="px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Permanently remove"
                    >
                      Purge
                    </button>

                    <button
                      id={`restore-btn-${item.id}`}
                      onClick={() => handleRestore(item)}
                      disabled={isRestoring || isPurging}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      <RotateCcw
                        className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`}
                      />
                      <span>{isRestoring ? 'Restoring...' : 'Restore'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal: Single Item Purge */}
      {itemToPurge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Permanently delete "{itemToPurge.title}"?
            </h3>
            <p className="text-sm text-stone-600 mb-6">
              This action cannot be undone. Once purged, this {itemToPurge.type} cannot be restored from the Recycle Bin.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setItemToPurge(null)}
                className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePurge(itemToPurge)}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                Yes, Purge Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Empty Bin */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Empty Entire Recycle Bin?
            </h3>
            <p className="text-sm text-stone-600 mb-6">
              Are you sure you want to permanently clear all <strong>{items.length}</strong> items from the Recycle Bin? Once cleared, these items cannot be restored.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEmptyConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyTrash}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                Yes, Empty Bin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Restore All */}
      {showRestoreAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Restore All {items.length} Items?
            </h3>
            <p className="text-sm text-stone-600 mb-6">
              All items currently in the Recycle Bin will be restored back to their active sections (rooms, amenities, attractions, gallery, enquiries, etc.).
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRestoreAllConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreAll}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm"
              >
                Yes, Restore All Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

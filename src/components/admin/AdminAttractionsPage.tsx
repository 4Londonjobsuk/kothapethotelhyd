import React, { useState, useEffect } from 'react';
import { hotelService, findAttractionFallback } from '../../services/hotelService';
import { referenceAttractionDistances } from '../../data/hotelData';
import { AdminAttractionRecord } from '../../types';
import {
  Compass,
  Edit2,
  Check,
  X,
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Save,
  MapPin,
  Clock,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

const NEHRU_ZOO_NEW_IMAGE =
  'https://kubyquytyviyigumtnbc.supabase.co/storage/v1/object/public/hotel-assets/rooms/chatgpt-image-sep-10--2026--12_44_40-am-1788981319343.png';

export const AdminAttractionsPage: React.FC = () => {
  const [attractions, setAttractions] = useState<AdminAttractionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<AdminAttractionRecord | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState<AdminAttractionRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [distanceApprox, setDistanceApprox] = useState('');
  const [showDistance, setShowDistance] = useState(true);
  const [travelTimeApprox, setTravelTimeApprox] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const loadAttractions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hotelService.getAdminAttractions();
      setAttractions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load attractions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttractions();

    const handleUpdate = () => {
      loadAttractions();
    };

    window.addEventListener('lotus_attractions_updated', handleUpdate);
    window.addEventListener('lotus_trash_updated', handleUpdate);

    return () => {
      window.removeEventListener('lotus_attractions_updated', handleUpdate);
      window.removeEventListener('lotus_trash_updated', handleUpdate);
    };
  }, []);

  const handleOpenEdit = (item: AdminAttractionRecord) => {
    const fallback = findAttractionFallback(item.id, item.title);

    setEditingItem(item);
    setTitle(item.title || fallback?.name || '');
    const currentDist =
      item.distance_approx !== undefined && item.distance_approx !== null
        ? String(item.distance_approx).trim()
        : '';
    setDistanceApprox(currentDist);
    setShowDistance(item.show_distance === true && Boolean(currentDist));
    setTravelTimeApprox(item.travel_time_approx || fallback?.tagline || '');
    setDescription(item.description || fallback?.description || '');

    // Default to the requested image if Nehru Zoo or if old lion image was present
    let img = item.image_url || fallback?.image || '';
    const isNehru =
      item.id === 'nehru-zoo' ||
      (item.title && item.title.toLowerCase().includes('nehru')) ||
      (typeof img === 'string' && img.includes('nehru-zoological-park'));
    if (isNehru && (!img || img.includes('nehru-zoological-park') || !img.startsWith('http'))) {
      img = NEHRU_ZOO_NEW_IMAGE;
    }

    setImageUrl(img);
    setIsActive(item.is_active);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    setError(null);
    try {
      const cleanDist = distanceApprox.trim();
      const effectiveShow = showDistance && Boolean(cleanDist);

      if (!effectiveShow && cleanDist) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`attraction_distance_saved_${editingItem.id}`, cleanDist);
        }
      }

      await hotelService.updateAdminAttraction(editingItem.id, {
        title,
        distance_approx: effectiveShow ? cleanDist : '',
        show_distance: effectiveShow,
        travel_time_approx: travelTimeApprox,
        description,
        image_url: imageUrl.trim(),
        is_active: isActive,
      });

      setSuccessMsg(`Landmark "${title}" updated successfully.`);
      setEditingItem(null);
      await loadAttractions();
    } catch (err: any) {
      setError(err.message || 'Failed to update landmark.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    setError(null);
    try {
      await hotelService.deleteAdminAttraction(deletingItem.id);
      setAttractions((prev) => prev.filter((a) => a.id !== deletingItem.id));
      setSuccessMsg(`Landmark "${deletingItem.title}" deleted successfully.`);
      setDeletingItem(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete landmark.');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleShowDistance = async (item: AdminAttractionRecord) => {
    const isCurrentlyOn = item.show_distance === true && Boolean(item.distance_approx && item.distance_approx.trim());
    const newShow = !isCurrentlyOn;
    try {
      let distVal = (item.distance_approx || '').trim();
      if (newShow && !distVal) {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(`attraction_distance_saved_${item.id}`) : null;
        distVal = (saved && saved.trim()) || referenceAttractionDistances[item.id] || '';
      } else if (!newShow && distVal) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`attraction_distance_saved_${item.id}`, distVal);
        }
      }

      const effectiveDist = newShow ? distVal : '';
      const effectiveShow = newShow && Boolean(effectiveDist);

      await hotelService.updateAdminAttraction(item.id, {
        ...item,
        distance_approx: effectiveDist,
        show_distance: effectiveShow,
      });
      setAttractions((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? { ...a, show_distance: effectiveShow, distance_approx: effectiveDist }
            : a
        )
      );
      setSuccessMsg(`Distance visibility for "${item.title}" turned ${effectiveShow ? `ON (${effectiveDist})` : 'OFF (Hidden)'}.`);
    } catch {
      setError('Failed to update distance visibility.');
    }
  };

  const handleToggleAllDistances = async (hideAll: boolean) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lotus_hide_all_attraction_distances', String(hideAll));
      }

      for (const item of attractions) {
        let distVal = (item.distance_approx || '').trim();
        if (!hideAll && !distVal) {
          const saved = typeof window !== 'undefined' ? localStorage.getItem(`attraction_distance_saved_${item.id}`) : null;
          distVal = (saved && saved.trim()) || referenceAttractionDistances[item.id] || '';
        } else if (hideAll && distVal) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`attraction_distance_saved_${item.id}`, distVal);
          }
        }

        const effectiveDist = hideAll ? '' : distVal;
        const effectiveShow = !hideAll && Boolean(effectiveDist);

        await hotelService.updateAdminAttraction(item.id, {
          ...item,
          distance_approx: effectiveDist,
          show_distance: effectiveShow,
        });
      }

      setAttractions((prev) =>
        prev.map((a) => ({
          ...a,
          show_distance: !hideAll && Boolean(a.distance_approx?.trim()),
          distance_approx: hideAll ? '' : a.distance_approx,
        }))
      );

      setSuccessMsg(
        hideAll
          ? 'All landmark distances are now HIDDEN across the public website.'
          : 'All landmark distances are now VISIBLE across the public website.'
      );
    } catch {
      setError('Failed to update distance visibility for all landmarks.');
    }
  };

  const handleToggleActive = async (item: AdminAttractionRecord) => {
    try {
      await hotelService.toggleAdminAttractionActive(item.id, !item.is_active);
      setAttractions((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, is_active: !item.is_active } : a))
      );
      setSuccessMsg(`Landmark status set to ${!item.is_active ? 'Active' : 'Inactive'}.`);
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= attractions.length) return;

    const updated = [...attractions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setAttractions(updated);
    try {
      await hotelService.reorderAdminAttractions(updated.map((a) => a.id));
      setSuccessMsg('Attraction order saved.');
    } catch {
      setError('Failed to save order.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <h1 className="text-2xl font-serif text-[#E0C37B]">Hyderabad Landmarks & Attractions</h1>
          <p className="text-xs text-stone-400 mt-1">
            Approved landmarks relative to Lotus Grand Hotel, Kothapet (Approximate road distances).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              const allCurrentlyHidden = attractions.every(
                (a) => a.show_distance === false || !a.distance_approx || !a.distance_approx.trim()
              );
              handleToggleAllDistances(!allCurrentlyHidden);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 cursor-pointer transition-colors shadow-sm ${
              attractions.every((a) => a.show_distance === false || !a.distance_approx || !a.distance_approx.trim())
                ? 'bg-amber-950/70 border-amber-800/80 text-amber-200 hover:bg-amber-900/80'
                : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700/80 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#E0C37B]" />
            <span>
              {attractions.every((a) => a.show_distance === false || !a.distance_approx || !a.distance_approx.trim())
                ? 'Show All Distances'
                : 'Hide All Distances'}
            </span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attractions List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E0C37B]" />
          <span className="text-xs">Loading approved landmarks...</span>
        </div>
      ) : (
        <div className="space-y-3.5">
          {attractions.map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl bg-[#0B1526] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                item.is_active ? 'border-stone-800' : 'border-stone-800/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#070E1A] border border-stone-800 flex items-center justify-center font-mono text-xs text-stone-400 shrink-0">
                  {idx + 1}
                </div>

                <div className="w-16 h-12 rounded-lg bg-[#070E1A] overflow-hidden shrink-0 border border-stone-800">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>

                <div>
                  <h3 className="text-sm font-serif text-stone-100">{item.title}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-[#E0C37B] font-medium">
                      <MapPin className="w-3 h-3" />
                      {item.show_distance === true && item.distance_approx && item.distance_approx.trim() ? (
                        <span>{item.distance_approx}</span>
                      ) : (
                        <span className="text-stone-500 italic font-normal">
                          {item.distance_approx && item.distance_approx.trim()
                            ? `${item.distance_approx} (Hidden)`
                            : 'No distance set (Hidden)'}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleShowDistance(item)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer border transition-colors flex items-center gap-1 ${
                        item.show_distance === true && item.distance_approx && item.distance_approx.trim()
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/80'
                          : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:text-stone-200'
                      }`}
                      title="Click to toggle public distance visibility"
                    >
                      <span>Show Distance:</span>
                      <span className={item.show_distance === true && item.distance_approx && item.distance_approx.trim() ? 'text-emerald-300 font-bold' : 'text-stone-300'}>
                        {item.show_distance === true && item.distance_approx && item.distance_approx.trim() ? 'ON' : 'OFF'}
                      </span>
                    </button>
                    {item.travel_time_approx && (
                      <span className="flex items-center gap-1 text-stone-400">
                        <Clock className="w-3 h-3" />
                        {item.travel_time_approx}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-stone-400/90 line-clamp-2 mt-1.5 font-light leading-relaxed max-w-xl">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium cursor-pointer ${
                    item.is_active
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {item.is_active ? 'Active' : 'Hidden'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-stone-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === attractions.length - 1}
                    className="p-1.5 text-stone-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="px-3 py-1.5 text-xs text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg flex items-center gap-1.5 cursor-pointer ml-1 transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-[#E0C37B]" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    className="p-1.5 text-stone-400 hover:text-red-400 bg-stone-900/60 hover:bg-red-950/40 border border-stone-800 hover:border-red-800/50 rounded-lg cursor-pointer transition-colors ml-1"
                    title={`Delete ${item.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0B1526] border border-[#C59A47]/40 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h2 className="text-base font-serif text-[#E0C37B]">Edit Landmark Details</h2>
              <button onClick={() => setEditingItem(null)} className="text-stone-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1">Landmark Title</label>
                <input
                  type="text"
                  required
                  value={title || ''}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              {/* Distance and Show Distance Control */}
              <div className="p-3.5 rounded-xl bg-[#070E1A] border border-stone-800 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-stone-300 font-medium">
                      Distance <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-stone-400">Leave blank if no distance</span>
                  </div>
                  <input
                    type="text"
                    value={distanceApprox || ''}
                    onChange={(e) => setDistanceApprox(e.target.value)}
                    placeholder="e.g., 3.46 km (leave empty if none)"
                    className="w-full px-3 py-2 bg-[#0B1526] border border-stone-700 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                  />
                </div>

                <div className="pt-2 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs text-stone-300 font-medium">Show Distance</label>
                    <p className="text-[11px] text-stone-400">
                      {showDistance
                        ? 'Display distance publicly if a value is set'
                        : 'Keep distance saved, but hide from website'}
                    </p>
                  </div>
                  <div className="inline-flex rounded-lg p-0.5 bg-[#0B1526] border border-stone-700 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowDistance(true)}
                      className={`px-3.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                        showDistance
                          ? 'bg-[#C59A47] text-stone-950 shadow-sm'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      ON
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDistance(false)}
                      className={`px-3.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                        !showDistance
                          ? 'bg-stone-700 text-white shadow-sm'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      OFF
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Travel Time / Tagline</label>
                <input
                  type="text"
                  value={travelTimeApprox || ''}
                  onChange={(e) => setTravelTimeApprox(e.target.value)}
                  placeholder="e.g., ~15 mins drive"
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description || ''}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              {/* Image Input & Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs text-stone-300">Landmark Image URL</label>
                  {(editingItem.id === 'nehru-zoo' || title.toLowerCase().includes('nehru')) && (
                    <button
                      type="button"
                      onClick={() => setImageUrl(NEHRU_ZOO_NEW_IMAGE)}
                      className="text-[11px] text-[#E0C37B] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      Use Updated Zoo Photo
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={imageUrl || ''}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />

                {imageUrl && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-stone-800 h-32 bg-stone-950 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-stone-300 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-[#E0C37B]" />
                      <span>Live Preview</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="attractionActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-stone-700 text-[#C59A47] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="attractionActive" className="text-xs text-stone-300 cursor-pointer">
                  Display on public website (Active)
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs bg-[#C59A47] hover:bg-[#D4AA55] text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0B1526] border border-red-900/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-800/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-medium text-white">Delete Landmark?</h3>
                <p className="text-xs text-stone-400 mt-0.5">This landmark will be removed from attractions & home.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 my-3 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
              <span className="text-stone-400">Selected: </span>
              <strong className="text-white">{deletingItem.title}</strong>
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={deleting}
                className="px-3.5 py-1.5 text-xs text-stone-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

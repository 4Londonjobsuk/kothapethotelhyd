import React, { useState, useEffect } from 'react';
import { hotelService } from '../../services/hotelService';
import { AdminGalleryItem, AdminCategoryItem } from '../../types';
import {
  Images,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Plus,
  Save,
  Star,
  AlertTriangle,
} from 'lucide-react';

export const AdminGalleryPage: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [images, setImages] = useState<AdminGalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit / Add Modal State
  const [editingItem, setEditingItem] = useState<AdminGalleryItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<AdminGalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [categoryId, setCategoryId] = useState('rooms');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, imgs] = await Promise.all([
        hotelService.getAdminGalleryCategories(),
        hotelService.getAdminGalleryImages(selectedCategory),
      ]);
      setCategories(cats);
      setImages(imgs);
    } catch (err: any) {
      setError(err.message || 'Failed to load gallery data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('lotus_gallery_updated', handleUpdate);
    window.addEventListener('lotus_trash_updated', handleUpdate);

    return () => {
      window.removeEventListener('lotus_gallery_updated', handleUpdate);
      window.removeEventListener('lotus_trash_updated', handleUpdate);
    };
  }, [selectedCategory]);

  const handleOpenEdit = (item: AdminGalleryItem) => {
    setEditingItem(item);
    setIsNew(false);
    setTitle(item.title || '');
    setAltText(item.alt_text || '');
    setCategoryId(item.category_id || 'rooms');
    setImageUrl(item.image_url || '');
    setIsFeatured(item.is_featured);
    setIsActive(item.is_active);
  };

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsNew(true);
    setTitle('');
    setAltText('');
    setCategoryId(selectedCategory !== 'All' ? selectedCategory.toLowerCase() : 'rooms');
    setImageUrl('');
    setIsFeatured(false);
    setIsActive(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      setError('Title and Image URL are required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const res = await hotelService.createAdminGalleryImage({
          title,
          alt_text: altText || title,
          category_id: categoryId,
          image_url: imageUrl,
          is_featured: isFeatured,
          is_active: isActive,
          display_order: images.length + 1,
        });
        if (!res.success) throw new Error(res.error);
        setSuccessMsg('Gallery photo added successfully.');
      } else if (editingItem) {
        const res = await hotelService.updateAdminGalleryImage(editingItem.id, {
          title,
          alt_text: altText,
          category_id: categoryId,
          image_url: imageUrl,
          is_featured: isFeatured,
          is_active: isActive,
        });
        if (!res.success) throw new Error(res.error);
        setSuccessMsg('Gallery photo updated successfully.');
      }

      setEditingItem(null);
      setIsNew(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save gallery item.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: AdminGalleryItem) => {
    try {
      await hotelService.updateAdminGalleryImage(item.id, { is_active: !item.is_active });
      setImages((prev) =>
        prev.map((img) => (img.id === item.id ? { ...img, is_active: !item.is_active } : img))
      );
      setSuccessMsg(`Photo status set to ${!item.is_active ? 'Active' : 'Hidden'}.`);
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleOpenDelete = (item: AdminGalleryItem) => {
    setDeleteTarget(item);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await hotelService.deleteAdminGalleryImage(deleteTarget.id);
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete photo.');
      }
      setImages((prev) => prev.filter((img) => img.id !== deleteTarget.id));
      setSuccessMsg(`Photo "${deleteTarget.title}" removed.`);
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete photo.');
    } finally {
      setDeleting(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setImages(updated);
    try {
      await hotelService.reorderAdminGalleryImages(updated.map((img) => img.id));
      setSuccessMsg('Order updated.');
    } catch {
      setError('Failed to persist order.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <h1 className="text-2xl font-serif text-[#E0C37B]">Hotel Gallery Categories & Photos</h1>
          <p className="text-xs text-stone-400 mt-1">
            4 Approved Categories: Rooms, Property, Dining, Hyderabad.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-[#C59A47] hover:bg-[#D4AA55] text-white text-xs font-semibold tracking-wide flex items-center gap-2 shadow-[0_2px_10px_rgba(197,154,71,0.3)] transition-all cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Gallery Photo</span>
        </button>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-[#C59A47] text-white font-semibold'
              : 'bg-[#0B1526] border border-stone-800 text-stone-400 hover:text-white'
          }`}
        >
          All ({images.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer capitalize ${
              selectedCategory.toLowerCase() === cat.id
                ? 'bg-[#C59A47] text-white font-semibold'
                : 'bg-[#0B1526] border border-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Images List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E0C37B]" />
          <span className="text-xs">Loading gallery items...</span>
        </div>
      ) : images.length === 0 ? (
        <div className="py-16 text-center bg-[#0B1526] border border-stone-800 rounded-2xl">
          <Images className="w-10 h-10 text-stone-600 mx-auto mb-2" />
          <p className="text-stone-300 text-sm font-medium">No photos in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((item, idx) => (
            <div
              key={item.id}
              className={`rounded-2xl bg-[#0B1526] border overflow-hidden flex flex-col transition-all ${
                item.is_active ? 'border-stone-800' : 'border-stone-800/40 opacity-60'
              }`}
            >
              <div className="aspect-[4/3] relative bg-black/40 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.alt_text}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#070E1A]/80 backdrop-blur-xs text-[10px] text-[#E0C37B] font-medium border border-[#E0C37B]/20 uppercase">
                  {item.category_label || item.category_id}
                </span>
                {item.is_featured && (
                  <span className="absolute top-2.5 right-2.5 p-1 rounded-full bg-[#C59A47] text-white">
                    <Star className="w-3 h-3 fill-white" />
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-stone-200 line-clamp-1">{item.title}</h3>
                  <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{item.alt_text}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-stone-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === images.length - 1}
                      className="p-1 text-stone-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`ml-1 px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer ${
                        item.is_active
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {item.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-[#E0C37B] hover:text-[#FFF5A5] cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(item)}
                      className="p-1 text-stone-400 hover:text-rose-400 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {(editingItem || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0B1526] border border-[#C59A47]/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h2 className="text-base font-serif text-[#E0C37B]">
                {isNew ? 'Add Gallery Image' : `Edit: ${editingItem?.title}`}
              </h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsNew(false);
                }}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={title || ''}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Category *</label>
                <select
                  value={categoryId || 'rooms'}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                >
                  <option value="rooms">Rooms</option>
                  <option value="property">Property</option>
                  <option value="dining">Dining</option>
                  <option value="hyderabad">Hyderabad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={imageUrl || ''}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={altText || ''}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeaturedCheck"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-stone-700 text-[#C59A47] focus:ring-0"
                  />
                  <label htmlFor="isFeaturedCheck" className="text-xs text-stone-300 cursor-pointer">
                    Featured
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-stone-700 text-[#C59A47] focus:ring-0"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs text-stone-300 cursor-pointer">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsNew(false);
                  }}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs bg-[#C59A47] hover:bg-[#D4AA55] text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
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
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0B1526] border border-rose-500/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <h2 className="text-base font-serif font-semibold">Delete Photo Record</h2>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="my-4 p-2 bg-[#070E1A] rounded-xl border border-rose-900/30 flex items-center gap-3">
              <img
                src={deleteTarget.image_url}
                alt={deleteTarget.title}
                className="w-16 h-16 object-cover rounded-lg border border-stone-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="inline-block px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/40 mb-1">
                  {deleteTarget.category_label || deleteTarget.category_id}
                </span>
                <p className="text-xs text-stone-200 font-medium truncate">{deleteTarget.title}</p>
                <p className="text-[10px] text-stone-400 truncate mt-0.5">{deleteTarget.alt_text || 'No alt text'}</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-white">"{deleteTarget.title}"</span>? This will immediately remove this image from the hotel library and website views.
            </p>

            <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs text-stone-400 hover:text-white cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Photo</span>
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

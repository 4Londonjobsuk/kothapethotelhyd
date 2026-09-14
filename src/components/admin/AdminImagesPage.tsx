import React, { useState, useEffect, useRef } from 'react';
import { hotelService, normalizeGalleryCategory } from '../../services/hotelService';
import { supabase } from '../../services/supabaseClient';
import { AdminGalleryItem } from '../../types';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Plus,
  Check,
  AlertCircle,
  Eye,
  Loader2,
  X,
  ExternalLink,
  Pencil,
  AlertTriangle,
} from 'lucide-react';

export const AdminImagesPage: React.FC = () => {
  const [images, setImages] = useState<AdminGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'rooms' | 'property' | 'dining' | 'hyderabad'>('rooms');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');

  // Replace Modal State
  const [replaceTarget, setReplaceTarget] = useState<AdminGalleryItem | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<AdminGalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editCategory, setEditCategory] = useState<'rooms' | 'property' | 'dining' | 'hyderabad'>('rooms');
  const [editIsActive, setEditIsActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<AdminGalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'rooms', label: 'Rooms' },
    { id: 'property', label: 'Property' },
    { id: 'dining', label: 'Dining' },
    { id: 'hyderabad', label: 'Hyderabad' },
  ];

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hotelService.getAdminGalleryImages(selectedCategory);
      setImages(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [selectedCategory]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle.trim()) {
      setError('Please provide an image file and a title.');
      return;
    }

    if (!supabase) {
      setError('Supabase client is not available.');
      return;
    }

    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr || !sessionData?.session) {
      setError('Admin authentication session is missing. Please log in again.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      // 1. Upload to Supabase Storage (Bucket: hotel-assets, folder: category)
      const uploadRes = await hotelService.uploadAsset(selectedFile, uploadCategory);
      if (!uploadRes.publicUrl) {
        throw new Error(uploadRes.error || 'Failed to upload image file to storage.');
      }

      // 2. Save record into gallery_images table
      const createRes = await hotelService.createAdminGalleryImage({
        category_id: uploadCategory,
        title: uploadTitle.trim(),
        alt_text: uploadAlt.trim() || uploadTitle.trim(),
        image_url: uploadRes.publicUrl,
        is_active: true,
        display_order: images.length + 1,
      });

      if (!createRes.success) {
        throw new Error(createRes.error || 'Failed to save image record.');
      }

      setSuccessMsg('Image uploaded and registered successfully!');
      setShowUploadModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadTitle('');
      setUploadAlt('');
      loadImages();
    } catch (err: any) {
      setError(err.message || 'Upload process failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (item: AdminGalleryItem) => {
    const updatedStatus = !item.is_active;
    try {
      const res = await hotelService.updateAdminGalleryImage(item.id, { is_active: updatedStatus });
      if (!res.success) {
        throw new Error(res.error || 'Failed to update image status.');
      }
      setImages((prev) =>
        prev.map((img) => (img.id === item.id ? { ...img, is_active: updatedStatus } : img))
      );
      setSuccessMsg(`Image status updated to ${updatedStatus ? 'Active' : 'Inactive'}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to update image status.');
    }
  };

  const handleOpenEdit = (item: AdminGalleryItem) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditAltText(item.alt_text || '');
    setEditCategory((item.category_id?.toLowerCase() as any) || 'rooms');
    setEditIsActive(item.is_active ?? true);
    setError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editTitle.trim()) {
      setError('Please provide a title for the image.');
      return;
    }

    setSavingEdit(true);
    setError(null);
    try {
      const trimmedTitle = editTitle.trim();
      const trimmedAlt = editAltText.trim() || trimmedTitle;
      const res = await hotelService.updateAdminGalleryImage(editingItem.id, {
        title: trimmedTitle,
        alt_text: trimmedAlt,
        category_id: editCategory,
        is_active: editIsActive,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to update image details.');
      }

      setImages((prev) =>
        prev.map((img) =>
          img.id === editingItem.id
            ? {
                ...img,
                title: trimmedTitle,
                alt_text: trimmedAlt,
                category_id: editCategory,
                category_label: normalizeGalleryCategory(editCategory),
                is_active: editIsActive,
              }
            : img
        )
      );

      setSuccessMsg('Image details updated successfully.');
      setEditingItem(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update image.');
    } finally {
      setSavingEdit(false);
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
        throw new Error(res.error || 'Failed to delete image record.');
      }

      setImages((prev) => prev.filter((img) => img.id !== deleteTarget.id));
      setSuccessMsg(`Image "${deleteTarget.title}" removed successfully.`);
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete image.');
    } finally {
      setDeleting(false);
    }
  };

  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceTarget || !replaceFile) return;

    if (!supabase) {
      setError('Supabase client is not available.');
      return;
    }

    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr || !sessionData?.session) {
      setError('Admin authentication session is missing. Please log in again.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const uploadRes = await hotelService.uploadAsset(replaceFile, replaceTarget.category_id);
      if (!uploadRes.publicUrl) {
        throw new Error(uploadRes.error || 'Failed to upload replacement file.');
      }

      const updateRes = await hotelService.updateAdminGalleryImage(replaceTarget.id, {
        image_url: uploadRes.publicUrl,
      });

      if (!updateRes.success) {
        throw new Error(updateRes.error || 'Failed to update image URL in database.');
      }

      setSuccessMsg('Image replaced successfully.');
      setReplaceTarget(null);
      setReplaceFile(null);
      setReplacePreview(null);
      loadImages();
    } catch (err: any) {
      setError(err.message || 'Image replacement failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <h1 className="text-2xl font-serif text-[#E0C37B]">Hotel Image & Storage Manager</h1>
          <p className="text-xs text-stone-400 mt-1">
            Connected to Supabase Storage (<code className="text-stone-300">hotel-assets</code> bucket).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadImages}
            className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh images"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#C59A47] hover:bg-[#D4AA55] text-white text-xs font-semibold tracking-wide flex items-center gap-2 shadow-[0_2px_10px_rgba(197,154,71,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Photo</span>
          </button>
        </div>
      </div>

      {/* Status Notifications */}
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

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-[#C59A47] text-white font-semibold'
              : 'bg-[#0B1526] border border-stone-800 text-stone-400 hover:text-white'
          }`}
        >
          All Photos ({images.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory.toLowerCase() === cat.id
                ? 'bg-[#C59A47] text-white font-semibold'
                : 'bg-[#0B1526] border border-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E0C37B]" />
          <span className="text-xs">Loading hotel photos...</span>
        </div>
      ) : images.length === 0 ? (
        <div className="py-16 text-center bg-[#0B1526] border border-stone-800 rounded-2xl">
          <ImageIcon className="w-10 h-10 text-stone-600 mx-auto mb-2" />
          <p className="text-stone-300 text-sm font-medium">No images found in this category.</p>
          <p className="text-stone-500 text-xs mt-1">Upload verified hotel images to display them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl overflow-hidden bg-[#0B1526] border transition-all flex flex-col ${
                item.is_active ? 'border-stone-800 hover:border-[#C59A47]/50' : 'border-stone-800/40 opacity-60'
              }`}
            >
              {/* Image Preview */}
              <div className="aspect-[4/3] relative bg-black/40 overflow-hidden group">
                <img
                  src={item.image_url}
                  alt={item.alt_text || item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLElement).style.opacity = '0.5';
                  }}
                />

                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#070E1A]/80 backdrop-blur-xs text-[10px] text-[#E0C37B] uppercase tracking-wider font-semibold border border-[#E0C37B]/20">
                    {item.category_label || item.category_id}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                  <a
                    href={item.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md bg-black/60 text-white hover:bg-black/90 transition-colors"
                    title="Open original"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Details & Controls */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-stone-200 line-clamp-1">{item.title}</h3>
                  <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{item.alt_text || 'No alt text'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                      item.is_active
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {item.is_active ? 'Active' : 'Hidden'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-[#E0C37B] hover:text-[#FFF5A5] hover:bg-[#E0C37B]/10 rounded transition-colors cursor-pointer"
                      title="Edit image details"
                      aria-label={`Edit ${item.title}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReplaceTarget(item);
                        setReplaceFile(null);
                        setReplacePreview(null);
                      }}
                      className="px-2 py-1 text-[10px] text-stone-300 hover:text-white bg-stone-800/60 hover:bg-stone-800 rounded cursor-pointer transition-colors"
                      title="Replace image file"
                    >
                      Replace
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDelete(item)}
                      className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                      title="Delete image"
                      aria-label={`Delete ${item.title}`}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0B1526] border border-[#C59A47]/40 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h2 className="text-base font-serif text-[#E0C37B]">Upload to Supabase Storage</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-stone-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4">
              {/* File Dropzone */}
              <div>
                <label className="block text-xs text-stone-300 mb-2">Select Image File</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-700 hover:border-[#C59A47]/60 rounded-xl p-6 text-center cursor-pointer bg-[#070E1A] transition-colors"
                >
                  {previewUrl ? (
                    <div className="flex flex-col items-center">
                      <img src={previewUrl} alt="Preview" className="h-32 object-contain rounded-lg mb-2" />
                      <span className="text-xs text-emerald-400">File selected: {selectedFile?.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-stone-400 mb-2" />
                      <span className="text-xs text-stone-300 font-medium">Click to choose image file</span>
                      <span className="text-[10px] text-stone-500 mt-1">JPEG, PNG, WebP up to 10MB</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-stone-300 mb-1.5">Category</label>
                <select
                  value={uploadCategory || 'rooms'}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                >
                  <option value="rooms">Rooms</option>
                  <option value="property">Property</option>
                  <option value="dining">Dining</option>
                  <option value="hyderabad">Hyderabad</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs text-stone-300 mb-1.5">Photo Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle || ''}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Lotus Grand Reception Area"
                  className="w-full px-3 py-2.5 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-xs text-stone-300 mb-1.5">Alt Text / Caption</label>
                <input
                  type="text"
                  value={uploadAlt || ''}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="e.g., Front desk counter at Lotus Grand Hotel"
                  className="w-full px-3 py-2.5 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-5 py-2 text-xs bg-[#C59A47] hover:bg-[#D4AA55] text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Confirm & Upload</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replace Modal */}
      {replaceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0B1526] border border-[#C59A47]/40 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-base font-serif text-[#E0C37B] mb-2">Replace Image File</h2>
            <p className="text-xs text-stone-300 mb-4">Replacing photo: <span className="font-semibold">{replaceTarget.title}</span></p>

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div
                onClick={() => replaceInputRef.current?.click()}
                className="border-2 border-dashed border-stone-700 rounded-xl p-4 text-center cursor-pointer bg-[#070E1A]"
              >
                {replacePreview ? (
                  <img src={replacePreview} alt="New Preview" className="h-28 mx-auto object-contain rounded mb-1" />
                ) : (
                  <span className="text-xs text-stone-400">Click to select new image file</span>
                )}
                <input
                  ref={replaceInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setReplaceFile(e.target.files[0]);
                      setReplacePreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setReplaceTarget(null)}
                  className="px-4 py-2 text-xs text-stone-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !replaceFile}
                  className="px-4 py-2 text-xs bg-[#C59A47] text-white rounded-lg font-medium cursor-pointer disabled:opacity-50"
                >
                  {uploading ? 'Replacing...' : 'Replace File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Image Details Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0B1526] border border-[#C59A47]/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2 text-[#E0C37B]">
                <Pencil className="w-4 h-4" />
                <h2 className="text-base font-serif font-semibold">Edit Image Details</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="my-4 p-2 bg-[#070E1A] rounded-xl border border-stone-800 flex items-center gap-3">
              <img
                src={editingItem.image_url}
                alt={editingItem.title}
                className="w-16 h-16 object-cover rounded-lg border border-stone-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="inline-block px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold bg-[#E0C37B]/10 text-[#E0C37B] border border-[#E0C37B]/20 mb-1">
                  {editingItem.category_label || editingItem.category_id}
                </span>
                <p className="text-xs text-stone-300 font-medium truncate">{editingItem.title}</p>
                <p className="text-[10px] text-stone-400 truncate mt-0.5">{editingItem.alt_text || 'No alt text'}</p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1">Image Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Grand Presidential Suite"
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Category *</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B] transition-colors cursor-pointer"
                >
                  <option value="rooms">Rooms</option>
                  <option value="property">Property</option>
                  <option value="dining">Dining</option>
                  <option value="hyderabad">Hyderabad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Alt Text (Accessibility & SEO)</label>
                <input
                  type="text"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="Descriptive caption for screen readers & search engines"
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B] transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActiveCheck"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded border-stone-700 text-[#C59A47] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="editIsActiveCheck" className="text-xs text-stone-300 cursor-pointer select-none">
                  Active (visible on website galleries)
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-white cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 text-xs bg-[#C59A47] hover:bg-[#D4AA55] text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
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
                <h2 className="text-base font-serif font-semibold">Delete Image Record</h2>
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
                    <span>Delete Image</span>
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

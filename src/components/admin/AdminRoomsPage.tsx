import React, { useState, useEffect } from 'react';
import { hotelService, findRoomFallback } from '../../services/hotelService';
import { AdminRoomRecord } from '../../types';
import {
  BedDouble,
  Plus,
  Edit2,
  Check,
  X,
  AlertCircle,
  Loader2,
  Users,
  Maximize2,
  Layers,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

const AVAILABLE_AMENITIES = [
  'Air Conditioning',
  'High-Speed Wi-Fi',
  'Flat-Screen TV',
  '24/7 Room Service',
  'Daily Housekeeping',
  'Complimentary Bottled Water',
  'Work Desk & Chair',
  'Attached Bathroom',
  'Private Shower & Toiletries',
  'Power Backup',
];

export const AdminRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<AdminRoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit / Add Modal State
  const [editingRoom, setEditingRoom] = useState<AdminRoomRecord | null>(null);
  const [isNewRoom, setIsNewRoom] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete Modal State
  const [deletingRoom, setDeletingRoom] = useState<AdminRoomRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [occupancy, setOccupancy] = useState('');
  const [bedType, setBedType] = useState('');
  const [roomSize, setRoomSize] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [rateLabel, setRateLabel] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const loadRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hotelService.getAdminRooms();
      setRooms(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();

    const handleUpdate = () => {
      loadRooms();
    };

    window.addEventListener('lotus_rooms_updated', handleUpdate);
    window.addEventListener('lotus_trash_updated', handleUpdate);

    return () => {
      window.removeEventListener('lotus_rooms_updated', handleUpdate);
      window.removeEventListener('lotus_trash_updated', handleUpdate);
    };
  }, []);

  const handleOpenEdit = (room: AdminRoomRecord) => {
    const fallback = findRoomFallback(room.id, room.title);
    setEditingRoom(room);
    setIsNewRoom(false);
    setTitle(room.title || fallback?.name || '');
    setSubtitle(room.subtitle || fallback?.subtitle || '');
    setDescription(room.description || fallback?.description || '');
    setOccupancy(room.occupancy || fallback?.specs?.capacity || '2 Guests');
    setBedType(room.bed_type || fallback?.specs?.bed || 'King Bed');
    setRoomSize(room.room_size || fallback?.specs?.size || '280 sq ft');
    setImageUrl(room.image_url || fallback?.image || '');
    setBadge(room.badge || fallback?.statusNote || '');
    setRateLabel(room.badge || fallback?.rateLabel || 'Contact for Rates');
    setDisplayOrder(room.display_order ?? 1);
    setSelectedAmenities(
      room.amenities && room.amenities.length > 0
        ? room.amenities
        : fallback?.amenities || [
            'Air Conditioning',
            'High-Speed Wi-Fi',
            'Flat-Screen TV',
            'Attached Bathroom',
          ]
    );
    setIsActive(room.is_active);
  };

  const handleOpenNew = () => {
    setEditingRoom(null);
    setIsNewRoom(true);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setOccupancy('');
    setBedType('');
    setRoomSize('');
    setImageUrl('');
    setBadge('');
    setRateLabel('Contact for Rates');
    setDisplayOrder(rooms.length + 1);
    setSelectedAmenities([
      'Air Conditioning',
      'High-Speed Wi-Fi',
      'Flat-Screen TV',
      'Attached Bathroom',
    ]);
    setIsActive(true);
  };

  const toggleAmenity = (amen: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amen) ? prev.filter((a) => a !== amen) : [...prev, amen]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Room title is required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const effectiveBadge =
        badge.trim() ||
        (rateLabel.trim() && rateLabel !== 'Contact for Rates' ? rateLabel.trim() : null);

      if (isNewRoom) {
        const res = await hotelService.createAdminRoom({
          title,
          subtitle,
          description,
          occupancy,
          bed_type: bedType,
          room_size: roomSize,
          image_url: imageUrl,
          badge: effectiveBadge,
          is_active: isActive,
          display_order: Number(displayOrder) || rooms.length + 1,
          amenities: selectedAmenities,
        });
        if (!res.success) throw new Error(res.error);
        setSuccessMsg('Verified room record added successfully!');
      } else if (editingRoom) {
        const res = await hotelService.updateAdminRoom(editingRoom.id, {
          title,
          subtitle,
          description,
          occupancy,
          bed_type: bedType,
          room_size: roomSize,
          image_url: imageUrl,
          badge: effectiveBadge,
          is_active: isActive,
          display_order: Number(displayOrder) || editingRoom.display_order,
          amenities: selectedAmenities,
        });
        if (!res.success) throw new Error(res.error);
        setSuccessMsg('Room record updated successfully!');
      }

      setEditingRoom(null);
      setIsNewRoom(false);
      loadRooms();
    } catch (err: any) {
      setError(err.message || 'Failed to save room record.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (room: AdminRoomRecord) => {
    try {
      await hotelService.toggleAdminRoomActive(room.id, !room.is_active);
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, is_active: !room.is_active } : r))
      );
      setSuccessMsg(`Room status set to ${!room.is_active ? 'Active' : 'Inactive'}.`);
    } catch {
      setError('Failed to update room active state.');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rooms.length) return;

    const newRooms = [...rooms];
    const temp = newRooms[index];
    newRooms[index] = newRooms[targetIndex];
    newRooms[targetIndex] = temp;

    setRooms(newRooms);
    try {
      const ids = newRooms.map((r) => r.id);
      const res = await hotelService.reorderAdminRooms(ids);
      if (!res.success) throw new Error(res.error);
      setSuccessMsg('Room display order updated successfully.');
      loadRooms();
    } catch (err: any) {
      setError(err.message || 'Failed to reorder rooms.');
      loadRooms();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRoom) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await hotelService.deleteAdminRoom(deletingRoom.id);
      if (!res.success) throw new Error(res.error);
      setSuccessMsg(`Room "${deletingRoom.title}" deleted successfully.`);
      setDeletingRoom(null);
      loadRooms();
    } catch (err: any) {
      setError(err.message || 'Failed to delete room record.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <h1 className="text-2xl font-serif text-[#E0C37B]">Room Inventory Management</h1>
          <p className="text-xs text-stone-400 mt-1">
            Verified room accommodations database. (No unverified mock categories).
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-[#C59A47] hover:bg-[#D4AA55] text-white text-xs font-semibold tracking-wide flex items-center gap-2 shadow-[0_2px_10px_rgba(197,154,71,0.3)] transition-all cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Verified Room</span>
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

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E0C37B]" />
          <span className="text-xs">Loading rooms inventory...</span>
        </div>
      ) : rooms.length === 0 ? (
        <div className="py-16 text-center bg-[#0B1526] border border-stone-800 rounded-2xl p-8">
          <BedDouble className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h2 className="text-base font-serif text-stone-200">No Verified Room Inventory in Database</h2>
          <p className="text-xs text-stone-400 max-w-md mx-auto mt-2 leading-relaxed">
            In accordance with data integrity guidelines, room categories are strictly not fabricated. You can add verified room inventory specifications when available.
          </p>
          <button
            onClick={handleOpenNew}
            className="mt-6 px-5 py-2.5 rounded-xl bg-[#C59A47] hover:bg-[#D4AA55] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Verified Room Record</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room, index) => (
            <div
              key={room.id}
              className={`rounded-2xl bg-[#0B1526] border overflow-hidden flex flex-col transition-all ${
                room.is_active ? 'border-stone-800' : 'border-stone-800/40 opacity-60'
              }`}
            >
              {room.image_url ? (
                <div className="aspect-[16/9] relative bg-black/40 overflow-hidden">
                  <img
                    src={room.image_url}
                    alt={room.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {room.badge && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#C59A47] text-white text-[10px] font-semibold uppercase tracking-wider shadow-sm">
                      {room.badge}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[#E0C37B] text-[10px] font-mono font-medium">
                    #{room.display_order ?? index + 1}
                  </span>
                </div>
              ) : (
                <div className="aspect-[16/9] bg-[#070E1A] relative flex items-center justify-center text-stone-600 border-b border-stone-800">
                  <BedDouble className="w-8 h-8" />
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 text-[#E0C37B] text-[10px] font-mono font-medium">
                    #{room.display_order ?? index + 1}
                  </span>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-lg text-stone-100">{room.title}</h3>
                    {/* Reorder controls */}
                    <div className="flex items-center gap-1 shrink-0 bg-stone-900/90 rounded-lg p-0.5 border border-stone-800">
                      <button
                        title="Move room up in order"
                        disabled={index === 0}
                        onClick={() => handleMoveOrder(index, 'up')}
                        className="p-1 rounded text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        title="Move room down in order"
                        disabled={index === rooms.length - 1}
                        onClick={() => handleMoveOrder(index, 'down')}
                        className="p-1 rounded text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {room.subtitle && <p className="text-xs text-[#E0C37B] mt-0.5">{room.subtitle}</p>}
                  {room.description && (
                    <p className="text-xs text-stone-400 mt-2 line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-stone-800/80 grid grid-cols-2 gap-2 text-[11px] text-stone-400">
                    {room.occupancy && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-stone-500" />
                        <span>{room.occupancy}</span>
                      </div>
                    )}
                    {room.room_size && (
                      <div className="flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-stone-500" />
                        <span>{room.room_size}</span>
                      </div>
                    )}
                    {room.bed_type && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Layers className="w-3.5 h-3.5 text-stone-500" />
                        <span>{room.bed_type}</span>
                      </div>
                    )}
                  </div>

                  {/* Room Amenities Badges */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((amen, aIdx) => (
                        <span
                          key={aIdx}
                          className="px-1.5 py-0.5 rounded bg-stone-900 text-[10px] text-stone-300 border border-stone-800"
                        >
                          {amen}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-stone-900 text-[10px] text-stone-500 border border-stone-800">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleActive(room)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium cursor-pointer ${
                      room.is_active
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {room.is_active ? 'Active' : 'Inactive'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeletingRoom(room)}
                      title="Delete Room Record"
                      className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(room)}
                      className="px-3 py-1.5 text-xs text-stone-200 hover:text-white bg-stone-800/80 hover:bg-stone-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-[#E0C37B]" />
                      <span>Edit Specs</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0B1526] border border-rose-800/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-700/60 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-serif text-rose-200">Delete Room Record</h3>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  Are you sure you want to delete room{' '}
                  <span className="font-semibold text-white">"{deletingRoom.title}"</span>? This will permanently remove it from the inventory database and website.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-stone-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingRoom(null)}
                className="px-4 py-2 text-xs text-stone-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Room</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Room Modal */}
      {(editingRoom || isNewRoom) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#0B1526] border border-[#C59A47]/40 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h2 className="text-base font-serif text-[#E0C37B]">
                {isNewRoom ? 'Add Verified Room Record' : `Edit: ${editingRoom?.title}`}
              </h2>
              <button
                onClick={() => {
                  setEditingRoom(null);
                  setIsNewRoom(false);
                }}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1">Room Title *</label>
                <input
                  type="text"
                  required
                  value={title || ''}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Executive Suite"
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-300 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={subtitle || ''}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g., Spacious City Living"
                    className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-300 mb-1">Badge / Tag</label>
                  <input
                    type="text"
                    value={badge || ''}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g., Premium Choice, Best Seller"
                    className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                  />
                </div>
              </div>

              {/* Room Rate / Tariff Field */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-300 mb-1">
                    Room Rate / Tariff Label
                  </label>
                  <input
                    type="text"
                    value={rateLabel}
                    onChange={(e) => setRateLabel(e.target.value)}
                    placeholder="Contact for Rates"
                    className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Standard policy is "Contact for Rates". Custom tariffs appear as rate badges.
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-stone-300 mb-1">
                    Display Order #
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Numerical order shown on the website (1 = first).
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description || ''}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Verified description of the room..."
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-stone-300 mb-1">Occupancy</label>
                  <input
                    type="text"
                    value={occupancy || ''}
                    onChange={(e) => setOccupancy(e.target.value)}
                    placeholder="e.g., 2 Adults"
                    className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-300 mb-1">Bed Type</label>
                  <input
                    type="text"
                    value={bedType || ''}
                    onChange={(e) => setBedType(e.target.value)}
                    placeholder="e.g., King Bed"
                    className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-300 mb-1">Room Dimensions</label>
                  <input
                    type="text"
                    value={roomSize || ''}
                    onChange={(e) => setRoomSize(e.target.value)}
                    placeholder="e.g., 320 sq.ft."
                    className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                  />
                </div>
              </div>

              {/* Room Amenities Selection */}
              <div>
                <label className="block text-xs text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Room Amenities Included</span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    {selectedAmenities.length} selected
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#070E1A] border border-stone-800 rounded-xl">
                  {AVAILABLE_AMENITIES.map((amen) => {
                    const isChecked = selectedAmenities.includes(amen);
                    return (
                      <button
                        key={amen}
                        type="button"
                        onClick={() => toggleAmenity(amen)}
                        className={`flex items-center gap-2 p-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-[#C59A47]/15 text-[#E0C37B] border border-[#C59A47]/30'
                            : 'text-stone-400 hover:text-stone-300 border border-transparent'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#C59A47] shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                        )}
                        <span className="truncate">{amen}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl || ''}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Storage or verified image URL (/assets/... or https://...)"
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-stone-700 text-[#C59A47] focus:ring-0"
                />
                <label htmlFor="isActiveCheck" className="text-xs text-stone-300 cursor-pointer">
                  Display room on website (Active)
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoom(null);
                    setIsNewRoom(false);
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
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

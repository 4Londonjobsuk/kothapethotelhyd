import React, { useState, useEffect, useMemo } from 'react';
import { hotelService, findAmenityFallback } from '../../services/hotelService';
import { AdminAmenityRecord } from '../../types';
import {
  Sparkles,
  Edit2,
  Check,
  X,
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Save,
  Plus,
  Wifi,
  AirVent,
  Bell,
  Utensils,
  Car,
  ConciergeBell,
  Zap,
  ShieldCheck,
  Clock,
  Bath,
  Tv,
  Coffee,
  Laptop,
  Droplets,
  CreditCard,
  Ban,
  Globe2,
  Flame,
  HeartPulse,
  Luggage,
  UserCheck,
  Search,
  Building2,
  Shield,
  Activity,
  Home,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminAmenitiesPage: React.FC = () => {
  const [amenities, setAmenities] = useState<AdminAmenityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showStandardsSection, setShowStandardsSection] = useState<boolean>(() =>
    hotelService.getStandardsSectionVisibility()
  );

  const handleToggleStandardsVisibility = () => {
    const next = !showStandardsSection;
    setShowStandardsSection(next);
    hotelService.setStandardsSectionVisibility(next);
    setSuccessMsg(
      next
        ? 'In-Room Standards & Guest Policies section is now VISIBLE on the public website.'
        : 'In-Room Standards & Guest Policies section is now HIDDEN from the public website.'
    );
  };

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<AdminAmenityRecord | null>(null);
  const [amenityToDelete, setAmenityToDelete] = useState<AdminAmenityRecord | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('');
  const [category, setCategory] = useState<string>('basic');
  const [isActive, setIsActive] = useState(true);

  const categories = [
    { id: 'all', label: 'All Facilities', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'basic', label: 'Basic Facilities', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'general', label: 'General Services', icon: <Globe2 className="w-3.5 h-3.5" /> },
    { id: 'health', label: 'Health & Wellness', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'room', label: 'Room Amenities', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'safety', label: 'Safety & Security', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'common', label: 'Common Area', icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  const popularIcons = [
    'Wifi',
    'ConciergeBell',
    'AirVent',
    'Zap',
    'Sparkles',
    'Car',
    'Globe2',
    'Luggage',
    'UserCheck',
    'HeartPulse',
    'Droplets',
    'Bath',
    'Laptop',
    'ShieldCheck',
    'Flame',
    'Clock',
    'Bell',
    'Utensils',
    'Tv',
    'Coffee',
  ];

  const renderIcon = (name: string, sizeClass = 'w-4 h-4') => {
    switch (name) {
      case 'Wifi':
        return <Wifi className={sizeClass} />;
      case 'AirVent':
      case 'Wind':
        return <AirVent className={sizeClass} />;
      case 'Bell':
        return <Bell className={sizeClass} />;
      case 'Utensils':
      case 'UtensilsCrossed':
        return <Utensils className={sizeClass} />;
      case 'Car':
        return <Car className={sizeClass} />;
      case 'ConciergeBell':
        return <ConciergeBell className={sizeClass} />;
      case 'Zap':
      case 'Power':
        return <Zap className={sizeClass} />;
      case 'Sparkles':
        return <Sparkles className={sizeClass} />;
      case 'ShieldCheck':
      case 'Shield':
        return <ShieldCheck className={sizeClass} />;
      case 'Clock':
        return <Clock className={sizeClass} />;
      case 'Bath':
        return <Bath className={sizeClass} />;
      case 'Tv':
        return <Tv className={sizeClass} />;
      case 'Coffee':
        return <Coffee className={sizeClass} />;
      case 'Laptop':
        return <Laptop className={sizeClass} />;
      case 'Droplets':
        return <Droplets className={sizeClass} />;
      case 'CreditCard':
        return <CreditCard className={sizeClass} />;
      case 'Ban':
        return <Ban className={sizeClass} />;
      case 'Globe2':
        return <Globe2 className={sizeClass} />;
      case 'Flame':
        return <Flame className={sizeClass} />;
      case 'HeartPulse':
      case 'Cross':
        return <HeartPulse className={sizeClass} />;
      case 'Luggage':
      case 'Briefcase':
        return <Luggage className={sizeClass} />;
      case 'UserCheck':
        return <UserCheck className={sizeClass} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={sizeClass} />;
      default:
        return <Sparkles className={sizeClass} />;
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'basic':
      case 'core':
        return 'bg-amber-950/70 border-amber-800/50 text-amber-300';
      case 'general':
      case 'additional':
        return 'bg-blue-950/70 border-blue-800/50 text-blue-300';
      case 'health':
        return 'bg-rose-950/70 border-rose-800/50 text-rose-300';
      case 'room':
        return 'bg-emerald-950/70 border-emerald-800/50 text-emerald-300';
      case 'safety':
        return 'bg-red-950/70 border-red-800/50 text-red-300';
      case 'common':
        return 'bg-purple-950/70 border-purple-800/50 text-purple-300';
      default:
        return 'bg-stone-900 border-stone-800 text-stone-300';
    }
  };

  const normalizeCategory = (cat: string) => {
    if (cat === 'core') return 'basic';
    if (cat === 'additional') return 'general';
    return cat;
  };

  const loadAmenities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hotelService.getAdminAmenities();
      setAmenities(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load amenities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAmenities();

    const handleUpdate = () => {
      loadAmenities();
    };

    window.addEventListener('lotus_amenities_updated', handleUpdate);
    window.addEventListener('lotus_trash_updated', handleUpdate);

    return () => {
      window.removeEventListener('lotus_amenities_updated', handleUpdate);
      window.removeEventListener('lotus_trash_updated', handleUpdate);
    };
  }, []);

  const filteredAmenities = useMemo(() => {
    return amenities.filter((item) => {
      const normCat = normalizeCategory(item.category);
      const matchesCat = selectedCategory === 'all' || normCat === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.icon_name.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [amenities, selectedCategory, searchQuery]);

  const handleOpenEdit = (item: AdminAmenityRecord) => {
    const fallback = findAmenityFallback(item.id, item.title);
    setEditingItem(item);
    setIsNew(false);
    setTitle(item.title || fallback?.title || '');
    setDescription(item.description || fallback?.description || '');
    setIconName(item.icon_name || fallback?.iconName || 'Sparkles');
    setCategory(normalizeCategory(item.category || fallback?.category || 'basic'));
    setIsActive(item.is_active);
  };

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsNew(true);
    setTitle('');
    setDescription('');
    setIconName('Sparkles');
    setCategory(selectedCategory !== 'all' ? selectedCategory : 'basic');
    setIsActive(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Amenity name is required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const res = await hotelService.createAdminAmenity({
          title: title.trim(),
          description: description.trim(),
          icon_name: iconName.trim() || 'Sparkles',
          category,
          is_active: isActive,
          display_order: amenities.length + 1,
        });
        if (!res.success) throw new Error(res.error);
        setSuccessMsg('Amenity added successfully.');
      } else if (editingItem) {
        const res = await hotelService.updateAdminAmenity(editingItem.id, {
          title: title.trim(),
          description: description.trim(),
          icon_name: iconName.trim() || 'Sparkles',
          category,
          is_active: isActive,
        });
        if (!res.success) throw new Error(res.error);
        setSuccessMsg('Amenity updated successfully.');
      }

      setEditingItem(null);
      setIsNew(false);
      loadAmenities();
    } catch (err: any) {
      setError(err.message || 'Failed to save amenity.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: AdminAmenityRecord) => {
    try {
      await hotelService.toggleAdminAmenityActive(item.id, !item.is_active);
      setAmenities((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, is_active: !item.is_active } : a))
      );
      setSuccessMsg(`Amenity status set to ${!item.is_active ? 'Active' : 'Inactive'}.`);
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= amenities.length) return;

    const updated = [...amenities];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setAmenities(updated);
    try {
      await hotelService.reorderAdminAmenities(updated.map((a) => a.id));
      setSuccessMsg('Amenity order updated.');
    } catch {
      setError('Failed to persist order.');
    }
  };

  const handleDeleteAmenity = (item: AdminAmenityRecord) => {
    setAmenityToDelete(item);
  };

  const confirmDeleteAmenity = async () => {
    if (!amenityToDelete) return;
    try {
      const res = await hotelService.deleteAdminAmenity(amenityToDelete.id);
      if (!res.success) throw new Error(res.error);
      setAmenities((prev) => prev.filter((a) => a.id !== amenityToDelete.id));
      setSuccessMsg(`Amenity "${amenityToDelete.title}" deleted successfully.`);
      setAmenityToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete amenity.');
    }
  };

  const activeCount = amenities.filter((a) => a.is_active).length;
  const inactiveCount = amenities.length - activeCount;

  return (
    <div className="space-y-6">
      {/* 1. Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif text-[#E0C37B]">Hotel Amenities Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C59A47]/20 border border-[#C59A47]/40 text-[#FFF5A5]">
              Icon-Focused CMS
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Manage verified hotel facilities, services, icons, categories, and public display visibility.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-[#C59A47] hover:bg-[#D4AA55] text-white text-xs font-semibold tracking-wide flex items-center gap-2 shadow-[0_2px_10px_rgba(197,154,71,0.3)] transition-all cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Amenity</span>
        </button>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0B1526] border border-stone-800/80">
          <span className="text-[11px] text-stone-400 block mb-1">Total Amenities</span>
          <span className="text-xl font-serif font-bold text-stone-100">{amenities.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0B1526] border border-stone-800/80">
          <span className="text-[11px] text-emerald-400 block mb-1">Active on Website</span>
          <span className="text-xl font-serif font-bold text-emerald-300">{activeCount}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0B1526] border border-stone-800/80">
          <span className="text-[11px] text-stone-400 block mb-1">Inactive / Hidden</span>
          <span className="text-xl font-serif font-bold text-stone-400">{inactiveCount}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0B1526] border border-stone-800/80">
          <span className="text-[11px] text-[#E0C37B] block mb-1">Facility Categories</span>
          <span className="text-xl font-serif font-bold text-[#E0C37B]">6 Categories</span>
        </div>
      </div>

      {/* 2b. Public Section Visibility Control: In-Room Standards & Policies */}
      <div className="p-4 rounded-2xl bg-[#0B1526] border border-[#C59A47]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
              showStandardsSection
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-stone-900 border-stone-700/80 text-stone-400'
            }`}
          >
            {showStandardsSection ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-stone-100 font-serif">
                In-Room Standards & Guest Policies Section
              </h3>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                  showStandardsSection
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}
              >
                {showStandardsSection ? 'Shown on Website' : 'Hidden on Website'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
              Control whether the Hospitality Standards card section (In-Room Comforts, Bath & Personal Care, Safety & Flexibility) is visible or hidden on the public Amenities page.
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleStandardsVisibility}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
            showStandardsSection
              ? 'bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border-rose-700/60'
              : 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-200 border-emerald-600/60'
          }`}
        >
          {showStandardsSection ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Hide from Website</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Show on Website</span>
            </>
          )}
        </button>
      </div>

      {/* 3. Alerts */}
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

      {/* 4. Filter Bar & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-[#0B1526] border border-stone-800/80 rounded-xl">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((c) => {
            const count =
              c.id === 'all'
                ? amenities.length
                : amenities.filter((a) => normalizeCategory(a.category) === c.id).length;
            const isSelected = selectedCategory === c.id;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#C59A47] text-white'
                    : 'bg-[#070E1A] text-stone-400 border border-stone-800 hover:text-stone-200'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/25 text-white' : 'bg-stone-800 text-stone-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility or icon..."
            className="w-full pl-8 pr-7 py-1.5 bg-[#070E1A] border border-stone-700/80 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#E0C37B]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Amenities Data Table (Completely Image-Free) */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E0C37B]" />
          <span className="text-xs">Loading amenities...</span>
        </div>
      ) : (
        <div className="bg-[#0B1526] border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 bg-[#070E1A]/60">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-28">Icon</th>
                  <th className="py-3 px-4">Amenity Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredAmenities.map((item, idx) => {
                  const normCat = normalizeCategory(item.category);
                  const catBadgeStyle = getCategoryBadgeColor(normCat);
                  const catLabel =
                    categories.find((c) => c.id === normCat)?.label || normCat;

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-stone-500">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#E0C37B]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-[#E0C37B]/10 border border-[#E0C37B]/25 flex items-center justify-center text-[#E0C37B] shrink-0">
                            {renderIcon(item.icon_name, 'w-4 h-4')}
                          </div>
                          <span className="text-stone-300 font-mono text-[11px]">{item.icon_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-100">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md border text-[10px] font-medium uppercase tracking-wider ${catBadgeStyle}`}>
                          {catLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-400 max-w-sm truncate">
                        {item.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-medium cursor-pointer transition-colors ${
                            item.is_active
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/80'
                              : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                          }`}
                        >
                          {item.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleMove(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-20 cursor-pointer transition-colors"
                            title="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMove(idx, 'down')}
                            disabled={idx === filteredAmenities.length - 1}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-20 cursor-pointer transition-colors"
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-[#E0C37B] hover:text-[#FFF5A5] hover:bg-[#C59A47]/20 cursor-pointer ml-1 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAmenity(item)}
                            className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40 cursor-pointer ml-1 transition-colors"
                            title="Delete Amenity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Edit / Add Modal (100% Image-Free) */}
      {(editingItem || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0B1526] border border-[#C59A47]/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#C59A47]/20 border border-[#C59A47]/40 flex items-center justify-center text-[#E0C37B]">
                  {renderIcon(iconName || 'Sparkles', 'w-4 h-4')}
                </div>
                <h2 className="text-base font-serif text-[#E0C37B]">
                  {isNew ? 'Add Hotel Amenity' : `Edit: ${editingItem?.title}`}
                </h2>
              </div>
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
                <label className="block text-xs text-stone-300 mb-1">Amenity Name *</label>
                <input
                  type="text"
                  required
                  value={title || ''}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Wi-Fi, Room Service, Power Backup"
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-300 mb-1">Category</label>
                  <select
                    value={category || 'basic'}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                  >
                    <option value="basic">Basic Facilities</option>
                    <option value="general">General Services</option>
                    <option value="health">Health & Wellness</option>
                    <option value="room">Room Amenities</option>
                    <option value="safety">Safety & Security</option>
                    <option value="common">Common Area</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-stone-300 mb-1">Icon Identifier</label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#070E1A] border border-stone-700 flex items-center justify-center text-[#E0C37B] shrink-0">
                      {renderIcon(iconName || 'Sparkles', 'w-4 h-4')}
                    </div>
                    <input
                      type="text"
                      value={iconName || ''}
                      onChange={(e) => setIconName(e.target.value)}
                      placeholder="e.g., Wifi, Zap"
                      className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description || ''}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Concise description of the amenity or service standard..."
                  className="w-full px-3 py-2 bg-[#070E1A] border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-[#E0C37B]"
                />
              </div>

              {/* Quick Icon Chips */}
              <div>
                <label className="block text-[11px] text-stone-400 mb-1.5">
                  Quick Icon Selector (Click to Apply)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[#070E1A]/70 rounded-xl border border-stone-800">
                  {popularIcons.map((pIcon) => (
                    <button
                      key={pIcon}
                      type="button"
                      onClick={() => setIconName(pIcon)}
                      className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                        iconName === pIcon
                          ? 'bg-[#C59A47]/25 border-[#E0C37B] text-[#FFF5A5]'
                          : 'bg-[#0B1526] border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      {renderIcon(pIcon, 'w-3 h-3')}
                      <span>{pIcon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="amenityActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-stone-700 text-[#C59A47] focus:ring-0"
                />
                <label htmlFor="amenityActive" className="text-xs text-stone-300 cursor-pointer">
                  Display on public website (Active)
                </label>
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
                  <span>Save Facility</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {amenityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B1526] border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-stone-100">Delete Facility</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Are you sure you want to delete <span className="text-stone-200 font-semibold">{amenityToDelete.title}</span>?
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 bg-[#070E1A] p-3 rounded-xl border border-stone-800/80">
              This facility will be removed from your hotel facilities list and public displays.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAmenityToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-800 text-stone-300 hover:text-white text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAmenity}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

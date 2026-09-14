import React, { useState, useEffect } from 'react';
import { AdminPage, AdminProfile, AdminPermission } from '../../types';
import { useAdminTheme } from './AdminThemeContext';
import {
  LayoutDashboard,
  Image as ImageIcon,
  BedDouble,
  Sparkles,
  Compass,
  Images,
  Inbox,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Users,
  Search,
  Settings,
  Shield,
  Key,
  Sun,
  Moon,
  FileText,
  Trash2,
} from 'lucide-react';

interface AdminLayoutProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  onViewPublicSite: () => void;
  adminEmail?: string;
  profile?: AdminProfile | null;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPage,
  onNavigate,
  onLogout,
  onViewPublicSite,
  adminEmail = 'admin@lotusgrand.com',
  profile,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useAdminTheme();
  const [trashCount, setTrashCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = localStorage.getItem('lotus_admin_trash_items');
      return raw ? JSON.parse(raw).length : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setTrashCount(e.detail.length);
      } else {
        try {
          const raw = localStorage.getItem('lotus_admin_trash_items');
          setTrashCount(raw ? JSON.parse(raw).length : 0);
        } catch {
          setTrashCount(0);
        }
      }
    };
    window.addEventListener('lotus_trash_updated', handleUpdate);
    return () => window.removeEventListener('lotus_trash_updated', handleUpdate);
  }, []);

  const hasAccess = (requiredPerm?: AdminPermission): boolean => {
    if (!profile) return true; // fallback
    if (profile.isSuperAdmin) return true;
    if (!requiredPerm) return true;
    return profile.permissions.includes(requiredPerm);
  };

  const rawNavItems: {
    id: AdminPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    perm?: AdminPermission;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'images', label: 'Image Manager', icon: ImageIcon, perm: 'images.view' },
    { id: 'rooms', label: 'Rooms', icon: BedDouble, perm: 'rooms.view' },
    { id: 'amenities', label: 'Amenities', icon: Sparkles, perm: 'amenities.view' },
    { id: 'attractions', label: 'Attractions', icon: Compass, perm: 'attractions.view' },
    { id: 'gallery', label: 'Gallery', icon: Images, perm: 'gallery.view' },
    { id: 'content', label: 'Content (CMS)', icon: FileText, perm: 'content.view' },
    { id: 'privacy', label: 'Privacy Notice', icon: ShieldCheck, perm: 'content.view' },
    { id: 'enquiries', label: 'Enquiries', icon: Inbox, perm: 'enquiries.view' },
    { id: 'trash', label: 'Recycle Bin', icon: Trash2, perm: 'trash.view' },
    { id: 'users', label: 'Admin Users', icon: Users, perm: 'users.manage' },
    { id: 'seo', label: 'SEO & Analytics', icon: Search, perm: 'seo.manage' },
    { id: 'settings', label: 'Site Settings', icon: Settings, perm: 'settings.manage' },
  ];

  // Filter items based on actual permissions
  const navItems = rawNavItems.filter((item) => {
    if (item.id === 'seo') {
      return hasAccess('seo.manage') || hasAccess('analytics.manage');
    }
    return hasAccess(item.perm);
  });

  const handleItemClick = (page: AdminPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const getRoleBadge = () => {
    if (profile?.isSuperAdmin || profile?.roles.includes('SUPER_ADMIN')) {
      return (
        <span className="text-[10px] text-[#E0C37B] flex items-center gap-1 mt-0.5 font-medium">
          <ShieldCheck className="w-3 h-3 text-[#E0C37B]" />
          <span>Super Administrator</span>
        </span>
      );
    }
    if (profile?.roles.includes('CONTENT_ADMIN')) {
      return (
        <span className="text-[10px] text-sky-400 flex items-center gap-1 mt-0.5 font-medium">
          <Shield className="w-3 h-3 text-sky-400" />
          <span>Content Admin</span>
        </span>
      );
    }
    if (profile?.roles.includes('ENQUIRY_ADMIN')) {
      return (
        <span className="text-[10px] text-purple-400 flex items-center gap-1 mt-0.5 font-medium">
          <Key className="w-3 h-3 text-purple-400" />
          <span>Enquiry Admin</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Approved Admin</span>
      </span>
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row selection:bg-[#C59A47] selection:text-white transition-colors duration-200 ${
        theme === 'light'
          ? 'admin-theme-light bg-[#F8FAFC] text-slate-800'
          : 'bg-[#070E1A] text-stone-200'
      }`}
    >
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0B1526] border-b border-[#C59A47]/20 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0D1E3A] border border-[#E0C37B]/40 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#E0C37B]" />
          </div>
          <div>
            <span className="font-serif text-sm font-medium tracking-wide text-[#E0C37B]">Lotus Grand</span>
            <span className="block text-[10px] text-stone-400 uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#070E1A] text-stone-300 hover:text-white border border-stone-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C59A47]/50"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-[#E0C37B]" />
            ) : (
              <Sun className="w-4 h-4 text-[#996515]" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#070E1A] text-stone-300 hover:text-white border border-stone-800"
            aria-label="Toggle admin menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar (Desktop Permanent, Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-[#0B1526] border-r border-[#C59A47]/20 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Title */}
        <div className="p-6 border-b border-stone-800/80 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D1E3A] border border-[#E0C37B]/40 flex items-center justify-center shadow-[0_2px_10px_rgba(197,154,71,0.2)]">
            <ShieldCheck className="w-5 h-5 text-[#E0C37B]" />
          </div>
          <div>
            <div className="font-serif text-base tracking-wide text-[#E0C37B]">Lotus Grand</div>
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-sans">Admin Console</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#C59A47]/20 to-[#C59A47]/5 text-[#E0C37B] border border-[#C59A47]/40 shadow-sm'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E0C37B]' : 'text-stone-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'trash' && trashCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {trashCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-stone-800/80 bg-[#070E1A]/40">
          <div className="mb-3 px-1">
            <div className="text-[11px] font-medium text-stone-200 truncate">{adminEmail}</div>
            {getRoleBadge()}
          </div>

          <div className="space-y-1.5">
            <button
              onClick={onViewPublicSite}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-stone-900/60 hover:bg-stone-900 text-stone-300 hover:text-white text-xs border border-stone-800 transition-colors cursor-pointer"
            >
              <span>Public Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 text-xs border border-rose-900/40 transition-colors cursor-pointer"
            >
              <span>Sign Out</span>
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Admin Content Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Desktop Top Header Bar (Subtle & Compact) */}
        <div className="admin-top-header hidden md:flex items-center justify-between px-6 lg:px-8 py-3.5 bg-[#0B1526]/60 border-b border-stone-800/80 backdrop-blur-sm sticky top-0 z-20 transition-colors duration-200">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="font-serif text-[#E0C37B] font-medium tracking-wide">Lotus Grand Hotel</span>
            <span>•</span>
            <span className="capitalize">{currentPage}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#070E1A] hover:bg-[#0D1E3A] border border-stone-800 hover:border-[#C59A47]/40 text-stone-300 hover:text-white text-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C59A47]/40 shadow-xs"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#E0C37B]" />
                  <span className="text-[11px] font-medium">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#996515]" />
                  <span className="text-[11px] font-medium">Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { AdminPage } from '../../types';
import { hotelService } from '../../services/hotelService';
import {
  BedDouble,
  Images,
  Sparkles,
  Compass,
  Inbox,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
  Phone,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (page: AdminPage) => void;
  adminEmail?: string;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  adminEmail = 'admin@lotusgrand.com',
}) => {
  const [stats, setStats] = useState({
    roomsCount: 0,
    galleryCount: 0,
    amenitiesCount: 0,
    attractionsCount: 0,
    newEnquiriesCount: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, enquiriesData] = await Promise.all([
        hotelService.getDashboardStats(),
        hotelService.getAdminEnquiries(),
      ]);
      setStats(statsData);
      setRecentEnquiries(enquiriesData.slice(0, 5));
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('lotus_enquiries_updated', handleUpdate);
    window.addEventListener('lotus_rooms_updated', handleUpdate);
    window.addEventListener('lotus_trash_updated', handleUpdate);

    return () => {
      window.removeEventListener('lotus_enquiries_updated', handleUpdate);
      window.removeEventListener('lotus_rooms_updated', handleUpdate);
      window.removeEventListener('lotus_trash_updated', handleUpdate);
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#E0C37B]">Hotel Operations Dashboard</h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Logged in as <span className="text-stone-200 font-medium">{adminEmail}</span> • Lotus Grand Hotel, Kothapet
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs transition-colors self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#E0C37B]' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Cards Grid (Simple, Practical Hotel Counts) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Rooms */}
        <div
          onClick={() => onNavigate('rooms')}
          className="p-5 rounded-2xl bg-[#0B1526] border border-[#C59A47]/20 hover:border-[#C59A47]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Rooms</span>
            <div className="w-8 h-8 rounded-lg bg-[#0D1E3A] flex items-center justify-center text-[#E0C37B] group-hover:scale-110 transition-transform">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-stone-100">
            {loading ? '—' : stats.roomsCount}
          </div>
          <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-1 group-hover:text-[#E0C37B] transition-colors">
            <span>Manage Inventory</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Gallery Images */}
        <div
          onClick={() => onNavigate('gallery')}
          className="p-5 rounded-2xl bg-[#0B1526] border border-[#C59A47]/20 hover:border-[#C59A47]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Gallery</span>
            <div className="w-8 h-8 rounded-lg bg-[#0D1E3A] flex items-center justify-center text-[#E0C37B] group-hover:scale-110 transition-transform">
              <Images className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-stone-100">
            {loading ? '—' : stats.galleryCount}
          </div>
          <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-1 group-hover:text-[#E0C37B] transition-colors">
            <span>View Photos</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Total Amenities */}
        <div
          onClick={() => onNavigate('amenities')}
          className="p-5 rounded-2xl bg-[#0B1526] border border-[#C59A47]/20 hover:border-[#C59A47]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Amenities</span>
            <div className="w-8 h-8 rounded-lg bg-[#0D1E3A] flex items-center justify-center text-[#E0C37B] group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-stone-100">
            {loading ? '—' : stats.amenitiesCount}
          </div>
          <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-1 group-hover:text-[#E0C37B] transition-colors">
            <span>Verified Facilities</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Approved Attractions */}
        <div
          onClick={() => onNavigate('attractions')}
          className="p-5 rounded-2xl bg-[#0B1526] border border-[#C59A47]/20 hover:border-[#C59A47]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Attractions</span>
            <div className="w-8 h-8 rounded-lg bg-[#0D1E3A] flex items-center justify-center text-[#E0C37B] group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-stone-100">
            {loading ? '—' : stats.attractionsCount}
          </div>
          <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-1 group-hover:text-[#E0C37B] transition-colors">
            <span>5 Approved Landmarks</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* New / Pending Enquiries */}
        <div
          onClick={() => onNavigate('enquiries')}
          className="p-5 rounded-2xl bg-[#0B1526] border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer group col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-wider text-amber-300 font-medium">New Enquiries</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-amber-300">
            {loading ? '—' : stats.newEnquiriesCount}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1 flex items-center gap-1 group-hover:text-amber-300 transition-colors">
            <span>Pending Front Desk</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="p-6 rounded-2xl bg-[#0B1526] border border-stone-800">
        <h2 className="text-base font-serif text-[#E0C37B] mb-4">Quick Management Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('images')}
            className="p-3.5 rounded-xl bg-[#070E1A] hover:bg-[#0D1E3A] border border-stone-800 hover:border-[#C59A47]/40 text-left transition-all cursor-pointer"
          >
            <div className="text-xs font-semibold text-stone-200">Manage Images</div>
            <div className="text-[10px] text-stone-400 mt-1">Storage & Uploads</div>
          </button>

          <button
            onClick={() => onNavigate('rooms')}
            className="p-3.5 rounded-xl bg-[#070E1A] hover:bg-[#0D1E3A] border border-stone-800 hover:border-[#C59A47]/40 text-left transition-all cursor-pointer"
          >
            <div className="text-xs font-semibold text-stone-200">Manage Rooms</div>
            <div className="text-[10px] text-stone-400 mt-1">Inventory & Specs</div>
          </button>

          <button
            onClick={() => onNavigate('amenities')}
            className="p-3.5 rounded-xl bg-[#070E1A] hover:bg-[#0D1E3A] border border-stone-800 hover:border-[#C59A47]/40 text-left transition-all cursor-pointer"
          >
            <div className="text-xs font-semibold text-stone-200">Manage Amenities</div>
            <div className="text-[10px] text-stone-400 mt-1">Hotel Facilities</div>
          </button>

          <button
            onClick={() => onNavigate('attractions')}
            className="p-3.5 rounded-xl bg-[#070E1A] hover:bg-[#0D1E3A] border border-stone-800 hover:border-[#C59A47]/40 text-left transition-all cursor-pointer"
          >
            <div className="text-xs font-semibold text-stone-200">Manage Attractions</div>
            <div className="text-[10px] text-stone-400 mt-1">Approved Landmarks</div>
          </button>

          <button
            onClick={() => onNavigate('gallery')}
            className="p-3.5 rounded-xl bg-[#070E1A] hover:bg-[#0D1E3A] border border-stone-800 hover:border-[#C59A47]/40 text-left transition-all cursor-pointer"
          >
            <div className="text-xs font-semibold text-stone-200">Manage Gallery</div>
            <div className="text-[10px] text-stone-400 mt-1">Photo Categories</div>
          </button>

          <button
            onClick={() => onNavigate('content')}
            className="p-3.5 rounded-xl bg-[#070E1A] hover:bg-[#0D1E3A] border border-stone-800 hover:border-[#C59A47]/40 text-left transition-all cursor-pointer"
          >
            <div className="text-xs font-semibold text-[#E0C37B]">Content (CMS)</div>
            <div className="text-[10px] text-stone-400 mt-1">Hero, Reviews, FAQs</div>
          </button>

          <button
            onClick={() => onNavigate('privacy')}
            className="p-3.5 rounded-xl bg-[#070E1A] hover:bg-[#0D1E3A] border border-stone-800 hover:border-[#C59A47]/40 text-left transition-all cursor-pointer"
          >
            <div className="text-xs font-semibold text-[#E0C37B]">Privacy Notice</div>
            <div className="text-[10px] text-stone-400 mt-1">Policy & Grievance Desk</div>
          </button>

          <button
            onClick={() => onNavigate('enquiries')}
            className="p-3.5 rounded-xl bg-[#070E1A] hover:bg-[#0D1E3A] border border-stone-800 hover:border-[#C59A47]/40 text-left transition-all cursor-pointer"
          >
            <div className="text-xs font-semibold text-stone-200">View Enquiries</div>
            <div className="text-[10px] text-stone-400 mt-1">Guest Submissions</div>
          </button>

          <button
            onClick={() => onNavigate('trash')}
            className="p-3.5 rounded-xl bg-[#070E1A] hover:bg-[#0D1E3A] border border-stone-800 hover:border-[#C59A47]/40 text-left transition-all cursor-pointer"
          >
            <div className="text-xs font-semibold text-amber-400">Recycle Bin</div>
            <div className="text-[10px] text-stone-400 mt-1">Restore Deleted Items</div>
          </button>
        </div>
      </div>

      {/* Recent Enquiries Preview */}
      <div className="p-6 rounded-2xl bg-[#0B1526] border border-stone-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-serif text-[#E0C37B]">Recent Guest Enquiries</h2>
            <p className="text-xs text-stone-400">Submissions from booking modal and contact page</p>
          </div>
          <button
            onClick={() => onNavigate('enquiries')}
            className="text-xs text-[#E0C37B] hover:text-[#FFF5A5] inline-flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs bg-[#070E1A] rounded-xl border border-stone-800/80">
            No recent guest enquiries recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400">
                  <th className="pb-3 font-medium">Guest Name</th>
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Dates</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {recentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 text-stone-200 font-medium">{enq.full_name}</td>
                    <td className="py-3 text-stone-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{enq.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 text-stone-400">
                      {enq.arrival_date ? `${enq.arrival_date} → ${enq.departure_date || 'N/A'}` : 'Not specified'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                          enq.status === 'new'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-600/40'
                            : enq.status === 'contacted'
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-600/40'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-stone-400">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

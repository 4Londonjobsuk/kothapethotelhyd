import React, { useState, useEffect } from 'react';
import { hotelService } from '../../services/hotelService';
import { AdminEnquiryItem } from '../../types';
import {
  Inbox,
  Phone,
  Mail,
  Calendar,
  Users,
  BedDouble,
  MessageSquare,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Filter,
  RefreshCw,
} from 'lucide-react';

export const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<AdminEnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<AdminEnquiryItem | null>(null);
  const [enquiryToDelete, setEnquiryToDelete] = useState<AdminEnquiryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hotelService.getAdminEnquiries();
      setEnquiries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load guest enquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();

    const handleUpdate = () => {
      loadEnquiries();
    };

    window.addEventListener('lotus_enquiries_updated', handleUpdate);
    window.addEventListener('lotus_trash_updated', handleUpdate);

    return () => {
      window.removeEventListener('lotus_enquiries_updated', handleUpdate);
      window.removeEventListener('lotus_trash_updated', handleUpdate);
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'new' | 'contacted' | 'confirmed' | 'closed') => {
    try {
      const res = await hotelService.updateAdminEnquiryStatus(id, newStatus);
      if (!res.success) throw new Error(res.error);

      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      setSuccessMsg(`Enquiry marked as "${newStatus}".`);
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const confirmDelete = async () => {
    if (!enquiryToDelete) return;
    try {
      const res = await hotelService.deleteAdminEnquiry(enquiryToDelete.id);
      if (!res.success) throw new Error(res.error);

      setEnquiries((prev) => prev.filter((e) => e.id !== enquiryToDelete.id));
      if (selectedEnquiry?.id === enquiryToDelete.id) {
        setSelectedEnquiry(null);
      }
      setSuccessMsg('Enquiry record deleted.');
      setEnquiryToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete enquiry.');
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (filterStatus === 'all') return true;
    return e.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <h1 className="text-2xl font-serif text-[#E0C37B]">Guest Enquiries & Booking Requests</h1>
          <p className="text-xs text-stone-400 mt-1">
            Private front-desk guest communications. Protected under authenticated RLS policies.
          </p>
        </div>

        <button
          onClick={loadEnquiries}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs transition-colors self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#E0C37B]' : ''}`} />
          <span>Refresh</span>
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
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'new', 'contacted', 'confirmed', 'closed'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
              filterStatus === st
                ? 'bg-[#C59A47] text-white font-semibold'
                : 'bg-[#0B1526] border border-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            {st} ({st === 'all' ? enquiries.length : enquiries.filter((e) => e.status === st).length})
          </button>
        ))}
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E0C37B]" />
          <span className="text-xs">Loading enquiry records...</span>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="py-16 text-center bg-[#0B1526] border border-stone-800 rounded-2xl">
          <Inbox className="w-10 h-10 text-stone-600 mx-auto mb-2" />
          <p className="text-stone-300 text-sm font-medium">No enquiries matching "{filterStatus}".</p>
          <p className="text-stone-500 text-xs mt-1">Guest submissions from the booking modal will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enquiry List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredEnquiries.map((enq) => {
              const isSelected = selectedEnquiry?.id === enq.id;
              return (
                <div
                  key={enq.id}
                  onClick={() => setSelectedEnquiry(enq)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0D1E3A] border-[#C59A47]'
                      : 'bg-[#0B1526] border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-stone-100">{enq.full_name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                            enq.status === 'new'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-600/40'
                              : enq.status === 'contacted'
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-600/40'
                              : enq.status === 'confirmed'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {enq.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-stone-400 mt-2">
                        <span className="flex items-center gap-1.5 text-stone-300">
                          <Phone className="w-3.5 h-3.5 text-[#E0C37B]" />
                          {enq.phone}
                        </span>
                        {enq.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-stone-500" />
                            {enq.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-stone-500 font-mono whitespace-nowrap">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {(enq.arrival_date || enq.room_preference || enq.message) && (
                    <div className="mt-3 pt-3 border-t border-stone-800/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-400">
                      {enq.arrival_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-500" />
                          {enq.arrival_date} → {enq.departure_date || 'N/A'}
                        </span>
                      )}
                      {enq.room_preference && (
                        <span className="flex items-center gap-1 text-[#E0C37B]">
                          <BedDouble className="w-3 h-3" />
                          {enq.room_preference}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Enquiry Detail Panel */}
          <div className="lg:col-span-1">
            {selectedEnquiry ? (
              <div className="bg-[#0B1526] border border-stone-800 rounded-2xl p-5 sticky top-24 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <h2 className="font-serif text-base text-[#E0C37B]">Enquiry Details</h2>
                  <button
                    onClick={() => setEnquiryToDelete(selectedEnquiry)}
                    className="p-1.5 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <div className="text-xs text-stone-400">Guest Name</div>
                  <div className="text-sm font-semibold text-stone-100 mt-0.5">{selectedEnquiry.full_name}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-stone-400">Phone</div>
                    <a
                      href={`tel:${selectedEnquiry.phone}`}
                      className="text-xs text-[#E0C37B] hover:underline block mt-0.5"
                    >
                      {selectedEnquiry.phone}
                    </a>
                  </div>
                  <div>
                    <div className="text-xs text-stone-400">Email</div>
                    <div className="text-xs text-stone-200 mt-0.5 truncate">
                      {selectedEnquiry.email || 'Not provided'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-800/80 text-xs">
                  <div>
                    <span className="text-stone-400 block">Check-In</span>
                    <span className="text-stone-200 font-medium">{selectedEnquiry.arrival_date || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Check-Out</span>
                    <span className="text-stone-200 font-medium">{selectedEnquiry.departure_date || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Guests</span>
                    <span className="text-stone-200 font-medium">{selectedEnquiry.guest_count || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Room Preference</span>
                    <span className="text-stone-200 font-medium">{selectedEnquiry.room_preference || 'Standard'}</span>
                  </div>
                </div>

                {selectedEnquiry.message && (
                  <div className="pt-2 border-t border-stone-800/80">
                    <span className="text-xs text-stone-400 block mb-1">Guest Message / Request</span>
                    <div className="p-3 bg-[#070E1A] rounded-xl text-xs text-stone-300 leading-relaxed">
                      {selectedEnquiry.message}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-800">
                  <span className="text-xs text-stone-400 block mb-2">Update Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['new', 'contacted', 'confirmed', 'closed'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedEnquiry.id, st)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-medium uppercase tracking-wider capitalize transition-colors cursor-pointer ${
                          selectedEnquiry.status === st
                            ? 'bg-[#C59A47] text-white font-semibold'
                            : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0B1526] border border-stone-800 rounded-2xl p-8 text-center text-stone-500 text-xs">
                Select an enquiry from the list to view complete guest details and update response status.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Non-blocking in-app Delete Confirmation Modal */}
      {enquiryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B1526] border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-stone-100">Delete Enquiry Record</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Are you sure you want to delete the enquiry from{' '}
                  <span className="text-stone-200 font-semibold">{enquiryToDelete.full_name}</span>?
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 bg-[#070E1A] p-3 rounded-xl border border-stone-800/80">
              This will remove the guest record from your active enquiries list.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEnquiryToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-800 text-stone-300 hover:text-white text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
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

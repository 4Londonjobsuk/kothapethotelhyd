import React, { useState, useEffect } from 'react';
import { hotelService } from '../../services/hotelService';
import {
  AdminProfile,
  AdminRole,
  AdminApprovalStatus,
  AdminPermission,
  AdminAuditLog,
} from '../../types';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Key,
  Shield,
  FileText,
  UserCheck,
  UserX,
  Lock,
  ChevronRight,
  Info,
  X,
} from 'lucide-react';

interface AdminUsersPageProps {
  currentAdminProfile?: AdminProfile | null;
}

const ALL_PERMISSIONS: { id: AdminPermission; label: string; module: string; sensitive: boolean }[] = [
  // USERS
  { id: 'users.view', label: 'View Admin Users', module: 'Users', sensitive: false },
  { id: 'users.approve', label: 'Approve / Reject Users', module: 'Users', sensitive: true },
  { id: 'users.manage', label: 'Full User & Role Management', module: 'Users', sensitive: true },

  // IMAGES
  { id: 'images.view', label: 'View Media Assets', module: 'Images', sensitive: false },
  { id: 'images.upload', label: 'Upload Media Assets', module: 'Images', sensitive: false },
  { id: 'images.replace', label: 'Replace Media Assets', module: 'Images', sensitive: false },
  { id: 'images.delete', label: 'Delete Media Assets', module: 'Images', sensitive: false },

  // ROOMS
  { id: 'rooms.view', label: 'View Rooms', module: 'Rooms', sensitive: false },
  { id: 'rooms.manage', label: 'Manage Rooms & Badges', module: 'Rooms', sensitive: false },

  // AMENITIES
  { id: 'amenities.view', label: 'View Amenities', module: 'Amenities', sensitive: false },
  { id: 'amenities.manage', label: 'Manage Amenities', module: 'Amenities', sensitive: false },

  // ATTRACTIONS
  { id: 'attractions.view', label: 'View Attractions', module: 'Attractions', sensitive: false },
  { id: 'attractions.manage', label: 'Manage Attractions', module: 'Attractions', sensitive: false },

  // GALLERY
  { id: 'gallery.view', label: 'View Gallery Categories & Photos', module: 'Gallery', sensitive: false },
  { id: 'gallery.manage', label: 'Manage Gallery & Categories', module: 'Gallery', sensitive: false },

  // ENQUIRIES
  { id: 'enquiries.view', label: 'View Guest Enquiries', module: 'Enquiries', sensitive: false },
  { id: 'enquiries.manage', label: 'Manage Enquiry Statuses', module: 'Enquiries', sensitive: false },

  // SEO (Sensitive)
  { id: 'seo.view', label: 'View SEO & Meta Tags', module: 'SEO', sensitive: false },
  { id: 'seo.manage', label: 'Manage On-page SEO, Sitemaps & Robots.txt', module: 'SEO', sensitive: true },

  // ANALYTICS (Sensitive)
  { id: 'analytics.view', label: 'View Analytics Dashboards', module: 'Analytics', sensitive: false },
  { id: 'analytics.manage', label: 'Manage GA4, Search Console & Clarity Keys', module: 'Analytics', sensitive: true },

  // SETTINGS (Sensitive)
  { id: 'settings.view', label: 'View Site Contact Settings', module: 'Settings', sensitive: false },
  { id: 'settings.manage', label: 'Modify Hotel Settings & Contact Info', module: 'Settings', sensitive: true },
];

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ currentAdminProfile }) => {
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AdminApprovalStatus>('ALL');
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('CONTENT_ADMIN');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSuperAdmin = currentAdminProfile?.isSuperAdmin === true;

  const loadData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [userList, logs] = await Promise.all([
        hotelService.getAllAdminUsers(),
        hotelService.getAuditLogs(40),
      ]);
      setUsers(userList);
      setAuditLogs(logs);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load user management data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (userId: string, status: AdminApprovalStatus) => {
    if (!isSuperAdmin) {
      setMessage({ type: 'error', text: 'Only Super Administrators can change user approval status.' });
      return;
    }

    setIsSubmitting(true);
    const res = await hotelService.updateAdminUserStatus(userId, status);
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: `User status successfully updated to ${status}.` });
      loadData();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update user status.' });
    }
  };

  const openRoleModal = (user: AdminProfile) => {
    setSelectedUser(user);
    setSelectedRole(user.roles[0] || 'CONTENT_ADMIN');
    setRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !isSuperAdmin) return;
    setIsSubmitting(true);
    const res = await hotelService.assignAdminUserRole(selectedUser.id, selectedRole);
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: `Assigned role ${selectedRole} to ${selectedUser.email}.` });
      setRoleModalOpen(false);
      loadData();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to assign role.' });
    }
  };

  const openPermModal = (user: AdminProfile) => {
    setSelectedUser(user);
    setSelectedPerms([...user.permissions]);
    setPermModalOpen(true);
  };

  const handleTogglePerm = (permId: string) => {
    if (selectedPerms.includes(permId)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== permId));
    } else {
      setSelectedPerms([...selectedPerms, permId]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedUser || !isSuperAdmin) return;
    setIsSubmitting(true);
    const res = await hotelService.updateAdminUserPermissions(selectedUser.id, selectedPerms);
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: `Permissions updated for ${selectedUser.email}.` });
      setPermModalOpen(false);
      loadData();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update permissions.' });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: AdminApprovalStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-950/40 text-amber-400 border border-amber-800/60 animate-pulse">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-950/40 text-rose-400 border border-rose-800/60">
            <AlertTriangle className="w-3 h-3" />
            Suspended
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-900 text-stone-400 border border-stone-800">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (roles: AdminRole[]) => {
    if (roles.includes('SUPER_ADMIN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#C59A47]/20 text-[#E0C37B] border border-[#C59A47]/40 uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3" />
          Super Admin
        </span>
      );
    }
    if (roles.includes('CONTENT_ADMIN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950/40 text-sky-400 border border-sky-800/50 uppercase tracking-wider">
          <Shield className="w-3 h-3" />
          Content Admin
        </span>
      );
    }
    if (roles.includes('ENQUIRY_ADMIN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950/40 text-purple-400 border border-purple-800/50 uppercase tracking-wider">
          <Key className="w-3 h-3" />
          Enquiry Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-stone-800 text-stone-400">
        No Role Assigned
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0D1E3A] border border-[#C59A47]/40 flex items-center justify-center text-[#E0C37B]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-medium text-stone-100 tracking-wide">
                Admin User Authorization
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                Super Admin control center: Review pending requests, assign roles, and audit security events.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#0B1526] p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-[#C59A47] text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Admin Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'audit'
                  ? 'bg-[#C59A47] text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Security Audit Log
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B1526] hover:bg-stone-800 text-stone-300 hover:text-white text-xs border border-stone-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
              : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#0B1526] p-3 rounded-xl border border-stone-800/80">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#070E1A] border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#C59A47]/60"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              {(['ALL', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#C59A47]/20 text-[#E0C37B] border border-[#C59A47]/40'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* User List Table */}
          <div className="bg-[#0B1526] rounded-2xl border border-stone-800/80 overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-stone-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#E0C37B]" />
                Loading admin users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-stone-400 text-xs">
                No users found matching current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#070E1A] border-b border-stone-800 text-[11px] text-stone-400 font-medium uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">User / Email</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Role</th>
                      <th className="px-5 py-3.5">Permissions</th>
                      <th className="px-5 py-3.5">Registered</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-medium text-stone-100">{user.email}</div>
                          {user.full_name && (
                            <div className="text-[11px] text-stone-400">{user.full_name}</div>
                          )}
                          <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </td>

                        <td className="px-5 py-4">{getStatusBadge(user.status)}</td>

                        <td className="px-5 py-4">{getRoleBadge(user.roles)}</td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] bg-stone-900 px-2 py-0.5 rounded border border-stone-800 text-[#E0C37B]">
                              {user.isSuperAdmin ? 'ALL (20)' : `${user.permissions.length} active`}
                            </span>
                            {isSuperAdmin && (
                              <button
                                onClick={() => openPermModal(user)}
                                className="text-[11px] text-[#E0C37B] hover:underline"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-[11px] text-stone-400">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Workflow Actions */}
                            {user.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(user.id, 'APPROVED')}
                                  disabled={isSubmitting}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-[11px] border border-emerald-800/80 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusChange(user.id, 'REJECTED')}
                                  disabled={isSubmitting}
                                  className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-[11px] border border-stone-800 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {user.status === 'APPROVED' && !user.isSuperAdmin && (
                              <button
                                onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                                disabled={isSubmitting}
                                className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] border border-rose-800/60 transition-colors"
                              >
                                Suspend
                              </button>
                            )}

                            {(user.status === 'SUSPENDED' || user.status === 'REJECTED') && (
                              <button
                                onClick={() => handleStatusChange(user.id, 'APPROVED')}
                                disabled={isSubmitting}
                                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-[11px] border border-emerald-800/80 transition-colors"
                              >
                                Activate
                              </button>
                            )}

                            {isSuperAdmin && !user.isSuperAdmin && (
                              <button
                                onClick={() => openRoleModal(user)}
                                className="px-2.5 py-1 rounded-lg bg-[#070E1A] hover:bg-stone-800 text-stone-200 text-[11px] border border-stone-800 transition-colors"
                              >
                                Assign Role
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-[#0B1526] rounded-2xl border border-stone-800/80 overflow-hidden shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div>
              <h2 className="text-sm font-medium text-stone-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#E0C37B]" />
                Administrative Audit Trail
              </h2>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Every sensitive action, permission grant, image modification, and user approval is recorded immutably.
              </p>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">
              Displaying {auditLogs.length} recent events
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              No audit log entries recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[#070E1A] border border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-[#E0C37B] uppercase">
                        {log.module}
                      </span>
                      <span className="font-medium text-stone-200">{log.action}</span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Actor: <span className="text-stone-300 font-mono">{log.actor_email || log.actor_id || 'System'}</span>
                      {log.target_id && (
                        <span className="ml-2 text-stone-500">
                          Target: <span className="font-mono">{log.target_id}</span>
                        </span>
                      )}
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="text-[10px] text-stone-500 font-mono bg-stone-900/80 p-1.5 rounded mt-1 border border-stone-800/50">
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-stone-500 whitespace-nowrap self-start sm:self-center">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Role Assignment Modal */}
      {roleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B1526] border border-[#C59A47]/40 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <h3 className="text-sm font-medium text-stone-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E0C37B]" />
                Assign Role
              </h3>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-stone-300">
              Select administrative role for <span className="font-semibold text-white">{selectedUser.email}</span>:
            </div>

            <div className="space-y-2.5">
              {[
                {
                  role: 'CONTENT_ADMIN' as AdminRole,
                  name: 'CONTENT_ADMIN',
                  desc: 'Content and media management only (Rooms, Amenities, Attractions, Gallery, Images). Cannot manage users, SEO, or settings.',
                },
                {
                  role: 'ENQUIRY_ADMIN' as AdminRole,
                  name: 'ENQUIRY_ADMIN',
                  desc: 'Guest reservations and enquiries management only. Strictly NO access to content, rooms, or media storage.',
                },
                {
                  role: 'SUPER_ADMIN' as AdminRole,
                  name: 'SUPER_ADMIN',
                  desc: 'Full unrestricted control over all hotel content, admin user approvals, roles, permissions, SEO, and website settings.',
                },
              ].map((item) => (
                <label
                  key={item.role}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    selectedRole === item.role
                      ? 'bg-[#C59A47]/15 border-[#C59A47]/50 text-white'
                      : 'bg-[#070E1A] border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={item.role}
                    checked={selectedRole === item.role}
                    onChange={() => setSelectedRole(item.role)}
                    className="mt-0.5 accent-[#C59A47]"
                  />
                  <div>
                    <div className="font-medium text-xs text-stone-200">{item.name}</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                onClick={() => setRoleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-stone-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#C59A47] hover:bg-[#b0873a] text-stone-950 font-medium text-xs transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Role Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {permModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B1526] border border-[#C59A47]/40 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h3 className="text-sm font-medium text-stone-100 flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#E0C37B]" />
                  Granular Permission Overrides
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Target user: <span className="text-stone-200 font-mono">{selectedUser.email}</span>
                </p>
              </div>
              <button
                onClick={() => setPermModalOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {['Users', 'Images', 'Rooms', 'Amenities', 'Attractions', 'Gallery', 'Enquiries', 'SEO', 'Analytics', 'Settings'].map((module) => {
                const perms = ALL_PERMISSIONS.filter((p) => p.module === module);
                return (
                  <div key={module} className="bg-[#070E1A] p-3.5 rounded-xl border border-stone-800/80 space-y-2.5">
                    <div className="text-xs font-medium text-[#E0C37B] uppercase tracking-wider flex items-center justify-between">
                      <span>{module} Module</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((p) => (
                        <label
                          key={p.id}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            selectedPerms.includes(p.id)
                              ? 'bg-[#C59A47]/10 border-[#C59A47]/40 text-stone-200'
                              : 'bg-stone-900/40 border-stone-800/60 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPerms.includes(p.id)}
                            onChange={() => handleTogglePerm(p.id)}
                            className="mt-0.5 accent-[#C59A47]"
                          />
                          <div>
                            <div className="font-medium text-stone-300 flex items-center gap-1.5">
                              {p.label}
                              {p.sensitive && (
                                <span className="text-[9px] font-semibold text-rose-400 bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-900/40">
                                  Sensitive
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-500 font-mono">{p.id}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-800">
              <div className="text-[11px] text-stone-400">
                Selected: <span className="text-[#E0C37B] font-mono">{selectedPerms.length}</span> permissions
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPermModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-stone-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#C59A47] hover:bg-[#b0873a] text-stone-950 font-medium text-xs transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

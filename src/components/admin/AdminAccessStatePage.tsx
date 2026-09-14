import React from 'react';
import { AdminProfile } from '../../types';
import {
  Clock,
  AlertTriangle,
  XCircle,
  LogOut,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface AdminAccessStatePageProps {
  profile: AdminProfile;
  onRefresh: () => void;
  onLogout: () => void;
  onViewPublicSite: () => void;
  isRefreshing?: boolean;
}

export const AdminAccessStatePage: React.FC<AdminAccessStatePageProps> = ({
  profile,
  onRefresh,
  onLogout,
  onViewPublicSite,
  isRefreshing = false,
}) => {
  const getStatusContent = () => {
    switch (profile.status) {
      case 'PENDING':
        return {
          icon: <Clock className="w-12 h-12 text-amber-400 animate-pulse" />,
          title: 'Account Awaiting Super Admin Review',
          subtitle: 'Your admin registration has been recorded and is currently in PENDING review.',
          badge: 'Status: PENDING APPROVAL',
          badgeColor: 'bg-amber-950/50 text-amber-300 border-amber-800/60',
          desc: 'For security reasons, newly registered administrator accounts do not have access to hotel content, media uploads, or sensitive data until manually approved and assigned a role by the Super Administrator.',
          advice: 'Please contact the Super Administrator (poreddysuneel4@gmail.com) to approve your account and configure your permissions.',
        };

      case 'SUSPENDED':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-rose-400" />,
          title: 'Administrative Access Suspended',
          subtitle: 'Your administrative privileges have been temporarily suspended.',
          badge: 'Status: SUSPENDED',
          badgeColor: 'bg-rose-950/50 text-rose-300 border-rose-800/60',
          desc: 'This account has been placed into SUSPENDED status by the Super Administrator. All administrative operations and mutation rights are revoked.',
          advice: 'If you believe this is an error, please contact the Super Administrator directly.',
        };

      case 'REJECTED':
        return {
          icon: <XCircle className="w-12 h-12 text-stone-400" />,
          title: 'Registration Not Approved',
          subtitle: 'Your request for administrative access was reviewed and not approved.',
          badge: 'Status: REJECTED',
          badgeColor: 'bg-stone-900 text-stone-400 border-stone-800',
          desc: 'Access to the Lotus Grand Admin Console has been restricted for this identity.',
          advice: 'If you require access, please reach out to the hotel IT management team.',
        };

      default:
        return {
          icon: <ShieldAlert className="w-12 h-12 text-[#E0C37B]" />,
          title: 'Unauthorized Access',
          subtitle: 'Your account is not authorized for administrative functions.',
          badge: 'Status: RESTRICTED',
          badgeColor: 'bg-stone-900 text-stone-400 border-stone-800',
          desc: 'Row Level Security prevents unauthorized accounts from viewing or modifying hotel inventory.',
          advice: 'Please sign in with an approved administrative account.',
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-[#070E1A] text-stone-200 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-[#0B1526] border border-[#C59A47]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* Status Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-[#070E1A] border border-stone-800 flex items-center justify-center shadow-inner">
          {content.icon}
        </div>

        {/* Status Badge */}
        <div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border uppercase ${content.badgeColor}`}>
            {content.badge}
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="font-serif text-xl sm:text-2xl font-medium text-stone-100">
            {content.title}
          </h1>
          <p className="text-xs text-stone-400 leading-relaxed">
            {content.subtitle}
          </p>
        </div>

        {/* User Identity Details */}
        <div className="bg-[#070E1A] p-4 rounded-2xl border border-stone-800/80 text-left text-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span>Signed In Email:</span>
            <span className="font-mono text-stone-200">{profile.email}</span>
          </div>
          <div className="flex justify-between items-center text-stone-400">
            <span>User UUID:</span>
            <span className="font-mono text-[10px] text-stone-500">{profile.id}</span>
          </div>
          <div className="flex justify-between items-center text-stone-400">
            <span>Assigned Role:</span>
            <span className="text-[#E0C37B] font-medium">
              {profile.roles.length > 0 ? profile.roles.join(', ') : 'None'}
            </span>
          </div>
        </div>

        {/* Explanation & Advice */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-stone-800/60 text-left text-xs text-stone-300 leading-relaxed space-y-2">
          <p>{content.desc}</p>
          <p className="text-[#E0C37B] text-[11px] font-medium">{content.advice}</p>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full py-3 px-4 rounded-xl bg-[#C59A47] hover:bg-[#b0873a] text-stone-950 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#C59A47]/10"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Check Approval Status</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onViewPublicSite}
              className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs border border-stone-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              <span>Public Website</span>
            </button>

            <button
              onClick={onLogout}
              className="py-2.5 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 text-xs border border-rose-900/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

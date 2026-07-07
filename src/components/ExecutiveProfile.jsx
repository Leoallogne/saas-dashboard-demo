import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  BookOpen, 
  HelpCircle, 
  Check, 
  Key, 
  Shield, 
  RefreshCw,
  Info,
  Sliders,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';

export default function ExecutiveProfile({ companyName, setCompanyName, addToast }) {
  const [profile, setProfile] = useState({
    name: 'Alexander Sterling',
    role: 'Director of Operations',
    email: 'a.sterling@moveops-suite.com',
    phone: '+1 (512) 555-8800'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      addToast('success', 'Profile Updated', 'Executive profile configurations saved.');
    }, 800);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      addToast('warning', 'Validation Error', 'Please complete all password fields.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('warning', 'Match Error', 'New passwords do not match. Re-type credentials.');
      return;
    }
    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast('success', 'Credential Reset', 'Executive password updated successfully.');
    }, 1000);
  };

  const documentationSteps = [
    {
      title: "1. Executive Dashboard (Financial Analytics)",
      icon: Sliders,
      color: "text-brand-400 border-brand-500/20 bg-brand-500/10",
      description: "Monitors overall enterprise health. The Total Revenue, Net Profit, and Fleet Utilization metrics aggregate live data. Clicking any KPI metric card automatically routes you to the matching sub-screen (Pipeline or Scheduler)."
    },
    {
      title: "2. Kanban Pipeline (Lead & Deal Flow)",
      icon: Layers,
      color: "text-amber-400 border-amber-500/20 bg-amber-500/10",
      description: "Manage moving jobs. Drag job cards between boards (New Inquiry ➔ Estimate Sent ➔ Scheduled ➔ Completed) to update status. Alternatively, click the progression arrow on card hover to promote jobs instantly. Double-click a block to open profitability detail panels."
    },
    {
      title: "3. Fleet Scheduler (Visual Dispatch Grid)",
      icon: Calendar,
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
      description: "Assigns vehicles to scheduled moves. If a vehicle is assigned to multiple moves on the same day, a RED conflict border and animate-pulse CONFLICT badge appears. Stacks all conflicting jobs in the cell rather than overwriting."
    },
    {
      title: "4. Fleet Maintenance Locks (+ Service)",
      icon: Key,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
      description: "Lock vehicles from dispatch. Hover any empty calendar slot and click '+ Service' to engage a Maintenance Lock. If jobs were previously scheduled on that truck for that day, they are automatically freed back to the unassigned pool, raising a yellow toast warning."
    },
    {
      title: "5. Regional Localization (Currency Switcher)",
      icon: Info,
      color: "text-rose-400 border-rose-500/20 bg-rose-500/10",
      description: "Select between US (USD), UK (GBP), or AU (AUD) locales in the sidebar. This dynamically converts all pricing calculations (Revenue, Wages, Net margins) across the entire application instantly."
    },
    {
      title: "6. Multi-Pipeline Workspaces (Multi-branch)",
      icon: BookOpen,
      color: "text-purple-400 border-purple-500/20 bg-purple-500/10",
      description: "Supports franchise scaling. Click 'New' next to Branch Division in the sidebar to add a brand new location (e.g. Houston Office). Data starts empty ($0 metrics, clean grid). Switching back to Austin HQ restores all data. All changes persist in local storage."
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Executive Settings & Manual</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Manage operations credentials and read dashboard user guide.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Profile & Credentials Editor */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Profile Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-5 border border-slate-800/60">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-brand-500/20">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">{profile.name}</h3>
                <span className="text-[10px] text-sky-400 font-extrabold uppercase mt-1 block tracking-wider">{profile.role}</span>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-slate-950 text-xs text-white border border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-slate-950 text-xs text-white border border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 text-xs text-white border border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700/50"
              >
                {isSavingProfile ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Save Configurations
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800/60">
            <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-brand-400" />
              Update Credentials
            </h4>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 text-xs text-white border border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="New password (min 6 chars)"
                  className="w-full bg-slate-950 text-xs text-white border border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-type new password"
                  className="w-full bg-slate-950 text-xs text-white border border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow shadow-brand-600/10"
              >
                {isUpdatingPassword ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Key className="w-3.5 h-3.5" />
                )}
                Change Password
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: User Guide (Documentation) */}
        <div className="xl:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800/60 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800/40 pb-4">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">MoveOps Dashboard User Manual</h3>
              <p className="text-xs text-slate-400">Interactive operational instructions and demo blueprints</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentationSteps.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <div key={idx} className="bg-slate-900/40 border border-slate-800/60 p-4.5 rounded-xl space-y-2.5 flex flex-col justify-start">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${step.color}`}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">{step.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950/40 border border-slate-800/50 p-4 rounded-xl text-xs space-y-2 leading-relaxed">
            <h5 className="font-bold text-white flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-slate-400">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              Demo Environment Notice
            </h5>
            <p className="text-slate-400 text-[11px]">
              This is a premium high-fidelity demo environments. Database edits are tracked inside your browser sandbox. To reset the environment back to the clean templates at any point during live pitches, click **"Reset System Data"** in the sidebar.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

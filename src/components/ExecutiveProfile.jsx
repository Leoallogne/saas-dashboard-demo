import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  BookOpen, 
  Check, 
  Key, 
  Shield, 
  RefreshCw,
  Info,
  Sliders,
  Calendar,
  Layers,
  MapPin,
  FileText,
  Briefcase,
  ChevronRight,
  Settings,
  Truck,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function ExecutiveProfile({ companyName, setCompanyName, addToast }) {
  // Tabs State
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'manual'
  const [activeManualSection, setActiveManualSection] = useState('getting-started');

  // Profile States
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

  const manualSections = [
    {
      id: 'getting-started',
      title: 'Getting Started & Basics',
      icon: Shield,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
      content: (
        <div className="space-y-5 text-xs text-slate-300 leading-relaxed animate-fade-in">
          <div>
            <h4 className="text-lg font-extrabold text-white mb-2">Welcome to MoveOps Dashboard</h4>
            <p>MoveOps is an Enterprise-grade logistics and moving management dashboard designed to provide real-time, full control to operational executives.</p>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-extrabold text-white text-sm flex items-center gap-1.5"><MapPin className="w-4 h-4 text-sky-400" /> Regional Localization (Currency)</h5>
            <p>You can change the standard currency at any time in the left panel (Sidebar). Selecting <strong>US (USD)</strong>, <strong>UK (GBP)</strong>, or <strong>AU (AUD)</strong> will dynamically and instantly recalculate all reporting figures, estimates, and invoices across the entire application without reloading the page.</p>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-extrabold text-white text-sm flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-sky-400" /> Multi-Branch Management</h5>
            <p>This dashboard is designed for companies with multiple branches (Franchise/Corporate). In the Sidebar under "Branch Division", click the <span className="px-1.5 py-0.5 bg-brand-500/20 text-brand-400 rounded font-bold">New</span> button to add a new branch division (e.g., Houston Branch, Chicago Branch).</p>
            <p>A new branch will have a 100% empty pipeline and schedule calendar, ensuring data between branches does not mix. You can switch between branches with a single click.</p>
          </div>
          
          <div className="bg-slate-900/80 p-4 border border-slate-800 rounded-xl mt-4">
            <p className="text-sky-400 font-extrabold mb-1.5 uppercase tracking-wider text-[10px]">💡 Demo System Note</p>
            <p className="text-[11px] text-slate-400">All data you enter is saved locally in your browser. If you are presenting or wish to restore the entire application to its default initial state, please click the red <strong>"Reset System Data"</strong> button at the bottom of the Sidebar.</p>
          </div>
        </div>
      )
    },
    {
      id: 'adding-jobs',
      title: 'Creating a New Job',
      icon: PlusCircle,
      color: 'text-brand-400',
      bgColor: 'bg-brand-500/10',
      borderColor: 'border-brand-500/20',
      content: (
        <div className="space-y-5 text-xs text-slate-300 leading-relaxed animate-fade-in">
          <div>
            <h4 className="text-lg font-extrabold text-white mb-2">Entering a New Job</h4>
            <p>The process of accepting a new client or order is done through the <strong>Add Job Modal</strong>. Click the blue <span className="px-2 py-1 bg-brand-600 text-white rounded font-bold mx-1">+ New Job</span> button on any page to open it.</p>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-extrabold text-white text-sm">Live Google Maps Integration</h5>
            <p>The order entry form features a Dual-pane UI. On the right side, there is an interactive 3D Google Maps view.</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-slate-400">
              <li><strong>Smart Autocomplete:</strong> As you type the pick-up (Origin) or drop-off (Destination) address, the system will automatically provide real address suggestions from Google Places.</li>
              <li><strong>Route Visualization:</strong> Once both addresses are filled, the map will automatically draw the route to visualize the truck's journey.</li>
              <li><strong>Map Searchbar:</strong> There is a floating searchbar above the map if the operator just wants to search for a location on the map before setting it as a client address.</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-extrabold text-white text-sm">Financials & Inventory</h5>
            <p>At the bottom of the form, you must fill in the Inventory Items as well as the initial Estimate Amount. This estimated figure will later be used to calculate projected profitability in the calendar and reports.</p>
          </div>
        </div>
      )
    },
    {
      id: 'job-pipeline',
      title: 'Job Pipeline (Kanban)',
      icon: Layers,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      content: (
        <div className="space-y-5 text-xs text-slate-300 leading-relaxed animate-fade-in">
          <div>
            <h4 className="text-lg font-extrabold text-white mb-2">Job Status Management</h4>
            <p>The <strong>Job Pipeline</strong> page is a Kanban board interface that tracks the order flow, from incoming order to completion.</p>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-extrabold text-white text-sm">Drag-and-Drop Functionality</h5>
            <p>Move job cards between columns (statuses) using your mouse (Drag-and-Drop). You can move orders from <strong>New Inquiry</strong> ➔ <strong>Estimate Sent</strong> ➔ <strong>Scheduled</strong> ➔ <strong>Completed</strong>.</p>
            <div className="bg-slate-900/60 border border-amber-500/20 p-3 rounded-lg mt-2">
              <p className="text-amber-400 font-bold mb-1">Important:</p>
              <p className="text-[11px]">Moving an order to the "Scheduled" status on the Kanban board *will not* automatically assign a truck. Truck assignment must be done manually on the <em>Fleet Scheduler</em> page.</p>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <h5 className="font-extrabold text-white text-sm">Quick Actions & Details</h5>
            <ul className="list-disc pl-5 space-y-1.5 mt-2 text-slate-400">
              <li><strong>Quick Click:</strong> Hover over a job card, then click the green <em>arrow (&rarr;)</em> button that appears in the top right corner to instantly advance the status without dragging the card.</li>
              <li><strong>Detail Panel:</strong> Double-click or click on the client's name on any card to open the <strong>Job Detail</strong> panel to view route analysis and detailed profitability metrics.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'fleet-scheduler',
      title: 'Fleet Scheduler (Dispatch)',
      icon: Truck,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      content: (
        <div className="space-y-5 text-xs text-slate-300 leading-relaxed animate-fade-in">
          <div>
            <h4 className="text-lg font-extrabold text-white mb-2">Visual Truck Scheduling</h4>
            <p>The <strong>Fleet Scheduler</strong> is an interactive grid calendar used by operations/dispatch to assign truck fleets to specific orders on specific dates.</p>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-extrabold text-white text-sm">How to Use the Scheduler</h5>
            <ol className="list-decimal pl-5 space-y-1.5 mt-2 text-slate-400 font-medium">
              <li>Look at the <strong>"Unscheduled Jobs"</strong> panel on the right. All jobs with a new/scheduled status that do not yet have a fleet will appear here.</li>
              <li>Drag a job from that right panel.</li>
              <li>Drop it onto an empty calendar cell (e.g., Truck A on Wednesday).</li>
              <li>The job status will be updated immediately, and the truck's estimated weekly revenue will automatically increase!</li>
            </ol>
          </div>
          
          <div className="space-y-2 mt-4">
            <h5 className="font-extrabold text-white text-sm">Conflict Detection System</h5>
            <p>You are allowed to place multiple jobs on 1 truck on the same day (perhaps because the truck runs two shifts). However, the system will warn you by highlighting the cell in bright RED, complete with a flashing <span className="text-[10px] text-red-400 bg-red-950 px-1 border border-red-500/30 rounded font-black">CONFLICT</span> badge. The admin must adjust the schedule if this was a human error.</p>
          </div>
          
          <div className="space-y-2 mt-4">
            <h5 className="font-extrabold text-white text-sm text-amber-400 flex items-center gap-1.5">
              Maintenance Locks (Service)
            </h5>
            <p>If a fleet needs repairs or is prohibited from operating: Hover over an empty cell on the calendar, and transparent <em>"+ Service"</em> text will appear. Click that text to block that schedule (The cell turns black and yellow with a wrench icon).</p>
            <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl mt-2">
              <p className="text-amber-400/90 text-[11px] font-bold">⚠️ Maintenance Domino Effect</p>
              <p className="text-[11px] text-amber-500/70 mt-1">If you forcefully block a day where a truck already has a job (*Scheduled Job*), the system will automatically unassign the job from the truck and throw it back to the "Unscheduled Jobs" list on the right!</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'financial-audit',
      title: 'Financial Audit Ledger',
      icon: FileSpreadsheet,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      content: (
        <div className="space-y-5 text-xs text-slate-300 leading-relaxed animate-fade-in">
          <div>
            <h4 className="text-lg font-extrabold text-white mb-2">Final Financial Bookkeeping</h4>
            <p>All jobs whose status has been moved to <strong>Completed</strong> will automatically be recorded on the <strong>Job Audit Ledger</strong> page. This page is where accountants verify the company's profit and loss margins.</p>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-extrabold text-white text-sm">Data Manipulation Features (Table)</h5>
            <ul className="list-disc pl-5 space-y-1.5 mt-2 text-slate-400">
              <li><strong>Interactive Sorting:</strong> Click on the table column headers (like <em>Total Billings</em> or <em>Net Profit</em>) to sort transactions from largest to smallest. Very powerful for finding the most profitable jobs!</li>
              <li><strong>Smart Pagination:</strong> For maximum performance, the table is divided into pages (10 entries per page). Pagination controls are in the bottom right corner of the table.</li>
              <li><strong>Advanced Margin Filters:</strong> In the search bar row, there is a final filter dropdown. You can filter jobs that have high profit margins (above 60%), average, or loss/low margins (below 30%).</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-extrabold text-white text-sm">Reconcile Workflow (Closing Books)</h5>
            <p>To mark that a job has been fully reconciled internally:</p>
            <ol className="list-decimal pl-5 space-y-1 mt-1 text-slate-400">
              <li>Check the box on the far left side of the table row. You can check multiple rows at once (Bulk Actions).</li>
              <li>Click the green <strong>"Mark Reconciled"</strong> button that will appear in the top right corner of the screen.</li>
              <li>The row will be visually sealed with a greenish background color and a Checkmark badge to prevent double auditing.</li>
            </ol>
            <p className="mt-2 text-[11px] text-slate-400 bg-slate-900/50 p-2 border border-slate-800 rounded">💡 <strong>Pro Tip:</strong> You can export <em>ONLY the checked rows</em> to CSV using the "Export CSV" button.</p>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-extrabold text-white text-sm">Receipt & Invoicing</h5>
            <p>At the far right of each row, there is a <strong>File (Paper)</strong> icon button. Click this button to open the client Invoice as a pop-up simulating fuel vs employee wage costs. From there, you can directly download/print the official PDF document.</p>
          </div>
        </div>
      )
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

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800/60 pb-px">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'profile'
              ? 'border-brand-500 text-brand-400 bg-brand-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile & Security
          </div>
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'manual'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Interactive Manual Book
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in max-w-4xl">
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

              <form onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
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
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700/50 mt-2"
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
            <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800/60 h-fit">
              <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
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
                  className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow shadow-brand-600/10 mt-2"
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
        )}

        {/* MANUAL BOOK TAB */}
        {activeTab === 'manual' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
            {/* Sidebar Manual Navigation */}
            <div className="md:col-span-1 space-y-2">
              <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-2 mb-3">Table of Contents</h3>
              <div className="space-y-1.5">
                {manualSections.map((section) => {
                  const IconComp = section.icon;
                  const isActive = activeManualSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveManualSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                        isActive 
                          ? `bg-slate-900 border border-slate-800 ${section.color}` 
                          : 'bg-transparent border border-transparent text-slate-400 hover:bg-slate-900/50 hover:text-slate-300'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive ? section.bgColor : 'bg-slate-900 group-hover:bg-slate-800 border border-slate-800'
                      }`}>
                        <IconComp className={`w-3.5 h-3.5 ${isActive ? section.color : 'text-slate-500'}`} />
                      </div>
                      <span className="text-xs font-bold truncate flex-1">{section.title}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Content Area */}
            <div className="md:col-span-3">
              {manualSections.map((section) => {
                if (section.id !== activeManualSection) return null;
                const IconComp = section.icon;
                return (
                  <div key={section.id} className="glass-panel rounded-2xl border border-slate-800/60 overflow-hidden shadow-xl animate-fade-in h-fit">
                    <div className={`border-b border-slate-800/60 p-6 flex items-center gap-4 ${section.bgColor} bg-opacity-50`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg flex-shrink-0 ${section.bgColor} ${section.borderColor}`}>
                        <IconComp className={`w-6 h-6 ${section.color}`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-black ${section.color}`}>{section.title}</h2>
                        <p className="text-slate-400 text-xs font-medium mt-0.5">MoveOps Official Documentation</p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8">
                      {section.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

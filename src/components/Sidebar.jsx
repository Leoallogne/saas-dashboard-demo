import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  CalendarRange, 
  Truck, 
  Settings, 
  Edit3, 
  Check,
  Building,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  companyName, 
  setCompanyName,
  isCollapsed,
  setIsCollapsed,
  region,
  setRegion,
  pipelines = [],
  activePipelineId,
  setActivePipelineId,
  onCreatePipeline
}) {
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [tempBrandName, setTempBrandName] = useState(companyName);

  const menuItems = [
    { id: 'dashboard', name: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', name: 'Job Pipeline', icon: KanbanSquare },
    { id: 'scheduler', name: 'Fleet Scheduler', icon: CalendarRange },
  ];

  const handleSaveBrand = () => {
    if (tempBrandName.trim()) {
      setCompanyName(tempBrandName);
      setIsEditingBrand(false);
    }
  };

  const handleCreateBranch = () => {
    const name = prompt("Enter new Pipeline Branch name (e.g. Houston Division):");
    if (name && name.trim()) {
      onCreatePipeline(name.trim());
    }
  };

  const activeBranchName = pipelines.find(p => p.id === activePipelineId)?.name || 'Default';

  return (
    <aside 
      className={`border-r border-slate-800/60 bg-slate-950/80 p-5 flex flex-col justify-between h-screen flex-shrink-0 z-10 backdrop-blur-md transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-68'
      }`}
    >
      <div className="space-y-6">
        {/* Branding & Logo */}
        <div className={`flex flex-col gap-4 border-b border-slate-800/50 pb-5 ${isCollapsed ? 'items-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/20 flex-shrink-0">
              <Truck className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-lg leading-tight tracking-tight text-white">MoveOps</h1>
                <p className="text-xs text-sky-400 font-medium">Dashboard Suite</p>
              </div>
            )}
          </div>

          {/* Branch Switcher (Multi-Workspace) */}
          {!isCollapsed ? (
            <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Branch Division</label>
                <button 
                  onClick={handleCreateBranch}
                  className="text-[10px] text-brand-400 hover:text-brand-300 font-bold uppercase tracking-wider flex items-center gap-0.5 transition-colors"
                  title="Create new pipeline branch"
                >
                  <Plus className="w-2.5 h-2.5" /> New
                </button>
              </div>
              <select
                value={activePipelineId}
                onChange={(e) => setActivePipelineId(e.target.value)}
                className="w-full bg-slate-950 text-xs text-white border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-brand-500/50 transition-all cursor-pointer font-semibold"
              >
                {pipelines.map(pl => (
                  <option key={pl.id} value={pl.id} className="bg-slate-950">
                    {pl.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/20 border border-slate-800/40 cursor-pointer hover:bg-slate-900/60 hover:border-brand-500/20 transition-all select-none text-[10px] text-slate-400 font-bold" 
              title={`Active Branch: ${activeBranchName}\nClick to toggle branches.`}
              onClick={() => {
                const currentIndex = pipelines.findIndex(p => p.id === activePipelineId);
                const nextIndex = (currentIndex + 1) % pipelines.length;
                setActivePipelineId(pipelines[nextIndex].id);
              }}
            >
              <Layers className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
              <span>BRANCH</span>
            </div>
          )}

          {/* Quick Client Configurator */}
          {!isCollapsed ? (
            <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40 space-y-2">
              {isEditingBrand ? (
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Company Name</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={tempBrandName}
                      onChange={(e) => setTempBrandName(e.target.value)}
                      className="bg-slate-950 text-xs text-white px-2 py-1.5 rounded border border-brand-500/50 outline-none flex-1 font-medium"
                      placeholder="Enter company name..."
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveBrand();
                      }}
                    />
                    <button 
                      onClick={handleSaveBrand}
                      className="p-1.5 rounded bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-300 truncate" title={companyName}>
                      {companyName}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsEditingBrand(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-brand-400 rounded transition-all hover:bg-slate-800"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[34px] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors cursor-help" title={`Managing: ${companyName}`}>
              <Building className="w-4 h-4" />
            </div>
          )}

          {/* Regional Switcher */}
          {!isCollapsed ? (
            <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40 space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Regional Format</span>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-md border border-slate-800/80">
                {[
                  { id: 'US', label: '🇺🇸 US' },
                  { id: 'UK', label: '🇬🇧 UK' },
                  { id: 'AU', label: '🇦🇺 AU' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setRegion(opt.id)}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded text-center transition-all ${
                      region === opt.id 
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/10' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div 
              className="flex justify-center p-2 rounded-lg bg-slate-900/20 border border-slate-800/40 cursor-pointer hover:bg-slate-900/60 transition-all select-none" 
              title={`Active Currency Format: ${region}`}
              onClick={() => {
                const nextRegion = region === 'US' ? 'UK' : region === 'UK' ? 'AU' : 'US';
                setRegion(nextRegion);
              }}
            >
              <span className="text-sm font-semibold">
                {region === 'US' ? '🇺🇸' : region === 'UK' ? '🇬🇧' : '🇦🇺'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.name : undefined}
                className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 group border ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/20 to-brand-500/5 text-white border-brand-500/30 shadow-md shadow-brand-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
                } ${isCollapsed ? 'justify-center py-3 px-0' : 'px-3.5 py-3 gap-3'}`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-300'
                }`} />
                {!isCollapsed && <span>{item.name}</span>}
                {isActive && !isCollapsed && (
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 ml-auto" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Sidebar Toggle */}
      <div className="space-y-3">
        {!isCollapsed ? (
          <div className="bg-gradient-to-b from-slate-900/50 to-slate-950/20 border border-slate-800/40 rounded-xl p-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Demo Active</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Data is saved automatically to browser local storage.
            </p>
            <button
              onClick={() => {
                if (window.confirm("Reset all MoveOps Dashboard data to default factory settings? This will clear local storage and reload.")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="mt-2.5 w-full py-1.5 text-center border border-red-500/25 bg-red-950/10 hover:bg-red-950/30 text-[9px] text-red-400 font-bold uppercase tracking-wider rounded-lg transition-all"
            >
              Reset System Data
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Active" />
          </div>
        )}

        {/* Collapse Button */}
        <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
          {!isCollapsed && (
            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Settings className="w-3 h-3" />
              <span>v1.2.0</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg border border-slate-800/80 bg-slate-900/50 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all shadow"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}

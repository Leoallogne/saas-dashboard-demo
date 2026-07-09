import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle,
  Truck,
  Plus,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Edit3,
  Eye,
  Box
} from 'lucide-react';
import AddJobModal from './AddJobModal';

export default function JobPipeline({ 
  jobs, 
  trucks = [],
  onSelectJob, 
  onUpdateJobStatus, 
  onAddNewJob, 
  onSeedData, 
  formatCurrency,
  prefilledQuoteData,
  clearPrefilledQuoteData
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [minRevenue, setMinRevenue] = useState(0);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  const [sizeFilter, setSizeFilter] = useState('all'); // 'all' | 'small' | 'medium' | 'large'
  const [draggedOverCol, setDraggedOverCol] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (prefilledQuoteData) {
      setIsAddModalOpen(true);
    }
  }, [prefilledQuoteData]);

  const columns = [
    {
      id: 'New Inquiry',
      title: 'New Inquiry',
      bgColor: 'bg-slate-900/60',
      borderColor: 'border-slate-800/80',
      accentColor: 'text-slate-400',
      badgeStyle: 'bg-slate-800 text-slate-300 border-slate-700/50',
      dropGlow: 'hover:border-slate-500/30 hover:bg-slate-900/80'
    },
    {
      id: 'Estimate Sent',
      title: 'Estimate Sent',
      bgColor: 'bg-amber-950/20',
      borderColor: 'border-amber-900/30',
      accentColor: 'text-amber-400',
      badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dropGlow: 'hover:border-amber-500/30 hover:bg-amber-950/30'
    },
    {
      id: 'Scheduled',
      title: 'Scheduled',
      bgColor: 'bg-sky-950/20',
      borderColor: 'border-sky-900/30',
      accentColor: 'text-sky-400',
      badgeStyle: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      dropGlow: 'hover:border-sky-500/30 hover:bg-sky-950/30'
    },
    {
      id: 'Completed',
      title: 'Completed',
      bgColor: 'bg-emerald-950/20',
      borderColor: 'border-emerald-900/30',
      accentColor: 'text-emerald-400',
      badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dropGlow: 'hover:border-emerald-500/30 hover:bg-emerald-950/30'
    }
  ];

  // Helper to categorize job size
  const getMoveSize = (items) => {
    const lower = (items || '').toLowerCase();
    if (lower.includes('1 bedroom') || lower.includes('1-bed') || lower.includes('apt') || lower.includes('sprinter')) return 'small';
    if (lower.includes('4 bedroom') || lower.includes('4-bed') || lower.includes('house') || lower.includes('5-bed')) return 'large';
    return 'medium'; // default
  };

  // Filters logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.items && job.items.toLowerCase().includes(searchQuery.toLowerCase()));

    const revenueAmount = job.revenue || job.estimateAmount || 0;
    const matchesMinRevenue = revenueAmount >= minRevenue;

    // Filter unassigned trucks on Scheduled status
    const matchesUnassigned = !showUnassignedOnly || (job.status === 'Scheduled' && !job.truckId);

    // Filter by property move size
    const matchesSize = sizeFilter === 'all' || getMoveSize(job.items) === sizeFilter;

    return matchesSearch && matchesMinRevenue && matchesUnassigned && matchesSize;
  });

  if (jobs.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Pipeline Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Move Inquiries Pipeline</h2>
            <p className="text-slate-400 text-sm mt-0.5">Drag-and-drop or click quick actions to dispatch jobs.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-4 py-2 text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Job
          </button>
        </div>

        {/* Empty State Banner */}
        <div className="glass-panel rounded-2xl border border-slate-800/60 p-12 flex flex-col items-center justify-center text-center py-20 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 shadow shadow-brand-500/10">
            <Layers className="w-8 h-8 animate-pulse" />
          </div>
          
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg font-bold text-white">This Pipeline Branch is Fresh & Empty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No moving job inquiries recorded for this division yet. Create a job manually from scratch or seed default demo templates to test operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSeedData}
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-brand-600/10 cursor-pointer"
            >
              Seed Sample Move Records
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              + Create Job Manually
            </button>
          </div>
        </div>

        {/* New Job Slide Modal */}
        {isAddModalOpen && (
          <AddJobModal 
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={onAddNewJob}
          />
        )}
      </div>
    );
  }

  const getJobsByStatus = (status) => {
    return filteredJobs.filter((job) => job.status === status);
  };

  // Drag Handlers
  const handleDragStart = (e, jobId) => {
    e.dataTransfer.setData('text/plain', jobId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDraggedOverCol(colId);
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('text/plain');
    if (jobId) {
      onUpdateJobStatus(jobId, targetStatus);
    }
    setDraggedOverCol(null);
  };

  // Quick progression mapping for card button clicks
  const nextStatusMap = {
    'New Inquiry': 'Estimate Sent',
    'Estimate Sent': 'Scheduled',
    'Scheduled': 'Completed'
  };

  const handleQuickPromote = (e, jobId, currentStatus) => {
    e.stopPropagation(); // prevent modal trigger
    const nextStatus = nextStatusMap[currentStatus];
    if (nextStatus) {
      onUpdateJobStatus(jobId, nextStatus);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Job Pipeline</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Drag cards to change staging. Click details to dispatch.
          </p>
        </div>

        {/* Filter & Add Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Unassigned Truck Checkbox Toggle */}
          <label className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 cursor-pointer hover:border-slate-700 transition-all select-none">
            <input
              type="checkbox"
              checked={showUnassignedOnly}
              onChange={(e) => setShowUnassignedOnly(e.target.checked)}
              className="rounded border-slate-750 bg-slate-950 checked:bg-brand-500 cursor-pointer focus:ring-0 focus:ring-offset-0 text-brand-500 w-3.5 h-3.5"
            />
            <span className={showUnassignedOnly ? 'text-amber-400' : ''}>⚠️ Unassigned Trucks Only</span>
          </label>

          {/* Size Filter Select */}
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400">
            <Filter className="w-4 h-4 text-brand-400" />
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-semibold cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-950">All Move Sizes</option>
              <option value="small" className="bg-slate-950">Small (Apt / 1-Bed)</option>
              <option value="medium" className="bg-slate-950">Medium (2-3 Bed)</option>
              <option value="large" className="bg-slate-950">Large (4+ Bed / House)</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search client, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 w-44 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400">
            <DollarSign className="w-4 h-4 text-brand-400" />
            <select
              value={minRevenue}
              onChange={(e) => setMinRevenue(Number(e.target.value))}
              className="bg-transparent text-white focus:outline-none font-semibold cursor-pointer text-xs"
            >
              <option value={0} className="bg-slate-950">Min Price: $0+</option>
              <option value={1000} className="bg-slate-950">$1k+</option>
              <option value={2000} className="bg-slate-950">$2k+</option>
              <option value={4000} className="bg-slate-950">$4k+</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/10 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add New Job
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex lg:grid flex-row lg:grid-cols-4 gap-5 items-start overflow-x-auto pb-4 lg:pb-0 snap-x hide-scrollbar">
        {columns.map((col) => {
          const colJobs = getJobsByStatus(col.id);
          const colRevenue = colJobs.reduce((sum, j) => sum + (j.revenue || j.estimateAmount || 0), 0);
          const isDraggingOver = draggedOverCol === col.id;

          return (
            <div 
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-2xl border p-4 max-h-[75vh] transition-all duration-200 w-[285px] sm:w-[320px] shrink-0 snap-start lg:w-auto ${
                isDraggingOver 
                  ? 'border-brand-500 bg-brand-950/20 scale-[1.01] ring-1 ring-brand-500/20' 
                  : `${col.borderColor} ${col.bgColor}`
              }`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center pb-3.5 border-b border-slate-800/40 mb-4">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm tracking-wide ${col.accentColor}`}>
                    {col.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${col.badgeStyle}`}>
                    {colJobs.length}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-bold">
                  {formatCurrency(colRevenue)}
                </span>
              </div>

              {/* Column Cards List */}
              <div className={`space-y-3 overflow-y-auto pr-1 min-h-[250px] max-h-[60vh] transition-all ${
                isDraggingOver ? 'bg-slate-900/10 border-2 border-dashed border-brand-500/20 rounded-xl p-2' : ''
              }`}>
                {colJobs.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-800/40 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-500 font-medium">Drop jobs here</p>
                  </div>
                ) : (
                  colJobs.map((job) => {
                    const jobPrice = job.revenue || job.estimateAmount || 0;
                    const canPromote = !!nextStatusMap[job.status];
                    
                    // Look up truck details
                    const truck = trucks.find(t => t.id === job.truckId);
                    const truckNameShort = truck ? truck.name.split(' (')[0] : (job.truckId ? job.truckId.toUpperCase() : '');

                    // House Size Label
                    const sizeLabel = getMoveSize(job.items) === 'small' ? 'Small Pack' : getMoveSize(job.items) === 'large' ? 'Large House' : 'Medium Move';

                    return (
                      <div
                        key={job.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, job.id)}
                        onClick={() => onSelectJob(job)}
                        className="glass-panel-interactive p-4 rounded-xl cursor-grab active:cursor-grabbing select-none space-y-3 border-l-[3.5px] border-l-brand-500/50 hover:border-l-brand-400 relative group transition-all"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs text-white group-hover:text-brand-400 transition-colors truncate w-2/3">
                            {job.clientName}
                          </h4>
                          <span className="text-xs font-black text-slate-350 flex-shrink-0">
                            {formatCurrency(jobPrice)}
                          </span>
                        </div>

                        {/* Route display */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-450">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span className="truncate">{job.origin.split(',')[0]}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-slate-500 pl-4">
                            <ArrowRight className="w-2.5 h-2.5" />
                            <span className="truncate">{job.destination.split(',')[0]}</span>
                          </div>
                        </div>

                        {/* Items & Size Info Badge */}
                        <div className="flex flex-wrap items-center gap-1 text-[8.5px] font-black uppercase">
                          <span className="bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Box className="w-2.5 h-2.5 text-slate-500" />
                            {sizeLabel}
                          </span>
                          
                          {job.items.toLowerCase().includes('piano') && (
                            <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                              🎹 Heavy Piano
                            </span>
                          )}
                        </div>

                        {/* Date and Operations Badge */}
                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-850 text-[9.5px]">
                          <span className="text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {job.date}
                          </span>
                          
                          {job.status === 'Scheduled' && !job.truckId ? (
                            <span className="text-amber-400 font-extrabold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse text-[8px] tracking-wide" title="No truck assigned to this scheduled job yet.">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              NO TRUCK
                            </span>
                          ) : job.truckId ? (
                            <span className="text-brand-400 font-extrabold flex items-center gap-1 bg-brand-500/10 border border-brand-500/10 px-2 py-0.5 rounded-full text-[8.5px]">
                              <Truck className="w-2.5 h-2.5" />
                              {truckNameShort}
                            </span>
                          ) : null}
                        </div>

                        {/* Hover Quick Action controls */}
                        <div className="absolute right-2 bottom-8 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // prevent drag
                              onSelectJob(job);
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-1.5 rounded-lg border border-slate-800 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                            title="Open detailed view"
                          >
                            <Edit3 className="w-3 h-3 text-brand-400" />
                          </button>
                          {canPromote && (
                            <button
                              onClick={(e) => handleQuickPromote(e, job.id, job.status)}
                              className="bg-brand-600 hover:bg-brand-500 hover:scale-105 active:scale-95 text-white py-1 px-2.5 rounded-lg border border-brand-500/50 shadow-md shadow-brand-600/20 transition-all flex items-center gap-1 text-[9px] font-bold"
                              title={`Promote to ${nextStatusMap[job.status]}`}
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>Quick Move</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Job Slide Modal */}
      {isAddModalOpen && (
        <AddJobModal 
          onClose={() => {
            setIsAddModalOpen(false);
            if (clearPrefilledQuoteData) clearPrefilledQuoteData();
          }}
          onSubmit={onAddNewJob}
          prefilledData={prefilledQuoteData}
        />
      )}
    </div>
  );
}

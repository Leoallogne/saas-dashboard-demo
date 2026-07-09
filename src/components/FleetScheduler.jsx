import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Calendar, 
  User, 
  AlertCircle,
  Plus,
  AlertTriangle,
  MapPin,
  Layers,
  Wrench,
  Search,
  GripVertical,
  Info
} from 'lucide-react';

export default function FleetScheduler({ 
  jobs, 
  allJobs = [],
  trucks, 
  pipelines = [],
  onSelectJob, 
  onAssignTruck, 
  onUpdateJobStatus, 
  onToggleMaintenance,
  formatCurrency,
  onUpdateJobDetails
}) {
  // Static dates corresponding to the mockData dates
  const weekDays = [
    { name: 'Mon', dateStr: '2026-07-06', label: 'July 6' },
    { name: 'Tue', dateStr: '2026-07-07', label: 'July 7 (Today)' },
    { name: 'Wed', dateStr: '2026-07-08', label: 'July 8' },
    { name: 'Thu', dateStr: '2026-07-09', label: 'July 9' },
    { name: 'Fri', dateStr: '2026-07-10', label: 'July 10' },
    { name: 'Sat', dateStr: '2026-07-11', label: 'July 11' },
    { name: 'Sun', dateStr: '2026-07-12', label: 'July 12' }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [draggedJobId, setDraggedJobId] = useState(null);

  // Filter unscheduled jobs
  const unscheduledJobs = jobs.filter(j => 
    (j.status === 'Scheduled' || j.status === 'Estimate Sent' || j.status === 'New Inquiry') && !j.truckId
  );

  // Filter trucks based on search
  const filteredTrucks = trucks.filter(truck => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return (
      truck.name.toLowerCase().includes(lowerQ) ||
      truck.driverName.toLowerCase().includes(lowerQ)
    );
  });

  const getJobsForCell = (truckId, dateStr) => {
    return jobs.filter(j => j.truckId === truckId && j.date === dateStr);
  };

  const getAllJobsForCell = (truckId, dateStr) => {
    return allJobs.filter(j => j.truckId === truckId && j.date === dateStr);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, jobId) => {
    e.dataTransfer.setData('jobId', jobId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedJobId(jobId);
  };

  const handleDragEnd = () => {
    setDraggedJobId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetTruckId, targetDate) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    if (!jobId || !targetTruckId) return;

    // Direct update logic
    onAssignTruck(jobId, targetTruckId);
    
    // Find job to update its details immutably
    const job = allJobs.find(j => j.id === jobId);
    if (job) {
      const updatedFields = { date: targetDate };
      if (job.status === 'Estimate Sent' || job.status === 'New Inquiry') {
        updatedFields.status = 'Scheduled';
      }
      onUpdateJobDetails(jobId, updatedFields);
    }
    setDraggedJobId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Fleet Scheduler</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Drag and drop jobs to schedule. Hover empty slots to add Maintenance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search truck or driver..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 min-w-[220px]"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <Calendar className="w-4 h-4 text-brand-400" />
            <span>July 6 – July 12, 2026</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Scheduler Grid */}
        <div className="xl:col-span-3 glass-panel rounded-2xl border border-slate-800/60 p-5 overflow-x-auto relative flex flex-col">
          <div className="min-w-[950px] flex-1">
            {/* Grid Header: Days of the week */}
            <div className="grid grid-cols-8 gap-3 pb-4 border-b border-slate-800/40 text-center sticky top-0 bg-slate-950/80 backdrop-blur-xl z-20">
              <div className="text-left font-bold text-xs text-slate-400 uppercase tracking-wider pl-2 flex items-center">
                Truck / Fleet
              </div>
              {weekDays.map(day => (
                <div key={day.dateStr} className="space-y-0.5">
                  <div className={`text-xs font-bold ${day.name === 'Tue' ? 'text-brand-400 font-extrabold' : 'text-slate-300'}`}>
                    {day.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    {day.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid Body: Trucks & Assigned Jobs */}
            <div className="divide-y divide-slate-800/30 mt-2 space-y-3">
              {filteredTrucks.map(truck => {
                // Calculate weekly revenue
                const weeklyRevenue = weekDays.reduce((total, day) => {
                  const dailyJobs = getJobsForCell(truck.id, day.dateStr);
                  return total + dailyJobs.reduce((sum, j) => sum + (j.revenue || j.estimateAmount || 0), 0);
                }, 0);

                return (
                  <div key={truck.id} className="grid grid-cols-8 gap-3 pt-3 items-center">
                    
                    {/* Truck Info Cell */}
                    <div className="flex items-start gap-2.5 pl-1 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <h4 className="text-xs font-extrabold text-white truncate leading-none">
                          {truck.name.split(' ')[0] + ' ' + truck.name.split(' ')[1]}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate flex items-center gap-0.5 mt-1 font-medium">
                          <User className="w-2.5 h-2.5" />
                          {truck.driverName.split(' ')[0]}
                        </p>
                        <p className="text-[9px] font-black text-emerald-500 mt-1 bg-emerald-500/10 inline-block px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {formatCurrency(weeklyRevenue)} <span className="text-[8px] text-emerald-500/70 font-bold uppercase">/ wk</span>
                        </p>
                      </div>
                    </div>

                    {/* Days Cells */}
                    {weekDays.map(day => {
                      const assignedJobs = getJobsForCell(truck.id, day.dateStr);
                      const allCellJobs = getAllJobsForCell(truck.id, day.dateStr);
                      const isUnderMaintenance = truck.maintenanceDates?.includes(day.dateStr);
                      
                      // Cross-branch jobs
                      const crossBranchJobs = allCellJobs.filter(
                        mj => !assignedJobs.some(aj => aj.id === mj.id)
                      );

                      const isConflict = assignedJobs.length > 1;
                      const isCrossBranchConflict = crossBranchJobs.length > 0;
                      const isDragOverTarget = !isUnderMaintenance && draggedJobId;

                      return (
                        <div 
                          key={day.dateStr} 
                          onDragOver={isUnderMaintenance ? undefined : handleDragOver}
                          onDrop={isUnderMaintenance ? undefined : (e) => handleDrop(e, truck.id, day.dateStr)}
                          className={`h-24 rounded-xl border p-1.5 flex flex-col gap-1.5 transition-all relative group/cell ${
                            isUnderMaintenance
                              ? 'bg-slate-900/40 border-slate-850'
                              : isConflict 
                                ? 'bg-red-950/20 border-red-500/40 ring-1 ring-red-500/20 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]' 
                                : isCrossBranchConflict
                                  ? 'bg-amber-950/10 border-amber-500/20 ring-1 ring-amber-500/10'
                                  : isDragOverTarget
                                    ? 'bg-brand-950/20 border-brand-500/50 border-dashed ring-2 ring-brand-500/20'
                                    : 'bg-slate-950/40 border-slate-900/50 hover:border-slate-800'
                          }`}
                        >
                          {/* Maintenance Lock Layout */}
                          {isUnderMaintenance ? (
                            <div 
                              onClick={() => onToggleMaintenance(truck.id, day.dateStr)}
                              className="absolute inset-1 rounded-lg p-1 bg-slate-900 border border-slate-800/80 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-800 hover:border-brand-500/20 transition-all select-none group/maint"
                              title="Click to cancel service schedule"
                            >
                              <Wrench className="w-4 h-4 text-amber-500 group-hover/maint:animate-spin" />
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1.5 block">
                                SERVICE
                              </span>
                              <span className="text-[7px] text-slate-500 font-bold group-hover/maint:text-white uppercase transition-colors mt-0.5">
                                Release
                              </span>
                            </div>
                          ) : (
                            <>
                              {/* Conflict Warning Badge */}
                              {isConflict && (
                                <div className="flex items-center gap-1 text-red-400 font-extrabold text-[8px] tracking-wider bg-red-950 px-1.5 py-0.5 rounded absolute top-0.5 right-0.5 z-10 border border-red-500/30 animate-pulse backdrop-blur-sm cursor-help shadow-lg" title="Drag one of the jobs to another slot to resolve.">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>CONFLICT</span>
                                </div>
                              )}

                              {/* Cross Branch Conflict Badge */}
                              {!isConflict && isCrossBranchConflict && (
                                <div className="flex items-center gap-1 text-amber-400 font-extrabold text-[8px] tracking-wide bg-amber-500/10 px-1 rounded absolute top-1 right-1 z-10 border border-amber-500/20 animate-pulse">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>BRANCH LOCK</span>
                                </div>
                              )}

                              <div className="flex flex-col gap-1.5 h-full overflow-y-auto pr-0.5 hide-scrollbar">
                                {/* Render Active Branch Jobs */}
                                {assignedJobs.map(job => (
                                  <div 
                                    key={job.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, job.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => onSelectJob(job)}
                                    className={`rounded-lg p-2 cursor-pointer text-left border relative group/item select-none transition-all shadow-sm active:scale-95 ${
                                      job.status === 'Completed'
                                        ? 'bg-emerald-950/40 border-emerald-500/25 hover:bg-emerald-900/60 hover:border-emerald-500/50 text-emerald-400'
                                        : 'bg-brand-950/40 border-brand-500/25 hover:bg-brand-900/60 hover:border-brand-500/50 text-brand-300'
                                    }`}
                                  >
                                    <div className="text-[9.5px] font-bold uppercase truncate leading-tight flex items-center justify-between">
                                      <span className="truncate">{job.clientName}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[8.5px] mt-1 text-slate-300/90 font-semibold">
                                      <span className="truncate max-w-[45px] opacity-70">{job.origin.split(' ')[1] || 'Austin'}</span>
                                      <span className="font-extrabold text-white bg-slate-900/50 px-1 py-0.5 rounded">{formatCurrency(job.revenue || job.estimateAmount)}</span>
                                    </div>

                                    {/* Hover Tooltip */}
                                    <div className="absolute hidden group-hover/item:block bg-slate-900/98 border border-slate-700 text-white rounded-xl p-3 z-45 shadow-2xl w-60 text-xs bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none space-y-2 backdrop-blur-xl">
                                      <div className="flex justify-between items-start border-b border-slate-700/60 pb-2">
                                        <span className="font-extrabold text-brand-400">{job.clientName}</span>
                                        <span className="font-black text-white bg-brand-500/20 px-1.5 py-0.5 rounded">{formatCurrency(job.revenue || job.estimateAmount)}</span>
                                      </div>
                                      <div className="space-y-1.5 text-[10px] pt-1">
                                        <div className="flex gap-1.5 items-start text-slate-300">
                                          <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                                          <span>
                                            {job.origin.split(',')[0]} ➜ {job.destination.split(',')[0]}
                                          </span>
                                        </div>
                                        <div className="flex gap-1.5 items-start text-slate-300">
                                          <Layers className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                                          <span className="truncate">{job.items}</span>
                                        </div>
                                      </div>
                                      <div className="text-[9px] text-slate-400 border-t border-slate-700/60 pt-1.5 text-center font-bold">
                                        Click to open dispatch sheet • Drag to move
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {/* Render Cross-Branch Locked Jobs */}
                                {crossBranchJobs.map(job => {
                                  const targetBranch = pipelines.find(p => p.id === job.pipelineId);
                                  const branchLabel = targetBranch ? targetBranch.name : 'Other Division';
                                  
                                  return (
                                    <div 
                                      key={job.id}
                                      className="rounded-lg p-1.5 text-left border bg-slate-900/85 border-amber-500/25 text-amber-500/60 select-none cursor-help relative group/cross"
                                    >
                                      <div className="text-[9px] font-extrabold uppercase truncate max-w-[80px]">
                                        {job.clientName}
                                      </div>
                                      <div className="flex justify-between items-center text-[7.5px] text-slate-500 mt-0.5 font-bold">
                                        <span>LOCKED</span>
                                        <span className="truncate max-w-[45px] text-amber-500/70">{branchLabel}</span>
                                      </div>

                                      {/* Cross Branch Hover Tooltip */}
                                      <div className="absolute hidden group-hover/cross:block bg-slate-900/98 border border-amber-500/30 text-white rounded-xl p-3.5 z-45 shadow-2xl w-56 text-[10px] bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none space-y-2 backdrop-blur-md">
                                        <div className="flex justify-between items-start border-b border-slate-800 pb-1 font-bold">
                                          <span className="text-amber-400">Locked Schedule</span>
                                          <span className="text-slate-400">{branchLabel}</span>
                                        </div>
                                        <p className="text-slate-400 leading-relaxed text-[9px] font-medium">
                                          Truck is active on this day in another corporate division ({branchLabel}). View or modify this job directly from the respective branch division.
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Hover Toggle Maintenance Option */}
                              {allCellJobs.length === 0 && (
                                <div 
                                  onClick={() => onToggleMaintenance(truck.id, day.dateStr)}
                                  className="h-full w-full flex flex-col items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200 cursor-pointer absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] rounded-lg z-0"
                                  title="Click to book maintenance locks"
                                >
                                  <Wrench className="w-4 h-4 text-slate-400 hover:text-amber-500 mb-1 transition-colors" />
                                  <span className="text-[9px] font-bold text-slate-500 hover:text-amber-500 uppercase tracking-widest transition-colors">
                                    + Service
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              
              {filteredTrucks.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-sm font-semibold">
                  No trucks found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unassigned Jobs Sidebar (Drag Source) */}
        <div className="glass-panel rounded-2xl border border-slate-800/60 p-5 flex flex-col h-full max-h-[80vh]">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div>
              <h4 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                Unscheduled Jobs
                <span className="bg-brand-500/20 text-brand-400 text-[10px] px-1.5 py-0.5 rounded-md">{unscheduledJobs.length}</span>
              </h4>
              <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">
                Drag a job and drop it onto an empty slot in the calendar to instantly assign and dispatch.
              </p>
            </div>

            {unscheduledJobs.length === 0 ? (
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/40 flex flex-col items-center justify-center text-center py-10 mt-6 h-full">
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-3 border border-slate-800">
                  <AlertCircle className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-xs text-slate-300 font-bold">All caught up!</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1 px-4 leading-relaxed">
                  No unscheduled jobs remaining. New inquiries will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mt-6 overflow-y-auto pr-2 hide-scrollbar flex-1 pb-4">
                {unscheduledJobs.map(job => (
                  <div 
                    key={job.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job.id)}
                    onDragEnd={handleDragEnd}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing hover:border-brand-500/40 hover:bg-slate-900 transition-all group/dragjob shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-1.5">
                        <GripVertical className="w-4 h-4 text-slate-600 group-hover/dragjob:text-slate-400 mt-0.5 flex-shrink-0 transition-colors" />
                        <div>
                          <h5 className="text-[11px] font-extrabold text-white uppercase tracking-tight">{job.clientName}</h5>
                          <p className="text-[9px] text-slate-500 mt-0.5 font-medium truncate max-w-[120px]">
                            {job.origin.split(',')[0]} ➜ {job.destination.split(',')[0]}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
                        {formatCurrency(job.estimateAmount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold px-6 text-slate-400">
                      <span className={job.status === 'Scheduled' ? 'text-blue-400' : job.status === 'New Inquiry' ? 'text-emerald-400' : 'text-amber-400'}>
                        • {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800/60 pt-4 mt-2 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
              <span className="text-slate-400 font-bold block mb-0.5">Drag-and-Drop Enabled</span>
              You can move jobs from this panel to the grid, or move existing jobs directly between days and trucks within the grid.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

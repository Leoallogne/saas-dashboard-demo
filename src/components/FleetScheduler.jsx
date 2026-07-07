import React, { useState } from 'react';
import { 
  Truck, 
  Calendar, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  PlusCircle,
  Plus,
  AlertTriangle,
  MapPin,
  Layers,
  Info,
  Wrench
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
  formatCurrency 
}) {
  // Static dates corresponding to the mockData dates (July 6, 2026 to July 12, 2026)
  const weekDays = [
    { name: 'Mon', dateStr: '2026-07-06', label: 'July 6' },
    { name: 'Tue', dateStr: '2026-07-07', label: 'July 7 (Today)' },
    { name: 'Wed', dateStr: '2026-07-08', label: 'July 8' },
    { name: 'Thu', dateStr: '2026-07-09', label: 'July 9' },
    { name: 'Fri', dateStr: '2026-07-10', label: 'July 10' },
    { name: 'Sat', dateStr: '2026-07-11', label: 'July 11' },
    { name: 'Sun', dateStr: '2026-07-12', label: 'July 12' }
  ];

  const [selectedUnassignedJobId, setSelectedUnassignedJobId] = useState('');
  const [targetTruckId, setTargetTruckId] = useState('');
  const [targetDate, setTargetDate] = useState('2026-07-07');

  // Filter unscheduled jobs (Scheduled or Estimate Sent but no truckId assigned yet)
  const unscheduledJobs = jobs.filter(j => 
    (j.status === 'Scheduled' || j.status === 'Estimate Sent') && !j.truckId
  );

  // Find all jobs assigned to a specific truck on a specific day in the ACTIVE branch
  const getJobsForCell = (truckId, dateStr) => {
    return jobs.filter(j => j.truckId === truckId && j.date === dateStr);
  };

  // Find all jobs assigned to a specific truck on a specific day across ALL branches
  const getAllJobsForCell = (truckId, dateStr) => {
    return allJobs.filter(j => j.truckId === truckId && j.date === dateStr);
  };

  const handleQuickAssign = (e) => {
    e.preventDefault();
    if (!selectedUnassignedJobId || !targetTruckId) return;

    // Find the job
    const job = jobs.find(j => j.id === selectedUnassignedJobId);
    if (!job) return;

    // Assign truck and date
    onAssignTruck(selectedUnassignedJobId, targetTruckId);
    
    // Update date inside jobs array directly (state will capture update)
    job.date = targetDate;
    if (job.status === 'Estimate Sent') {
      onUpdateJobStatus(selectedUnassignedJobId, 'Scheduled');
    }

    // Reset fields
    setSelectedUnassignedJobId('');
    setTargetTruckId('');
  };

  // Check if target dispatcher options are under maintenance
  const selectedTruckObject = trucks.find(t => t.id === targetTruckId);
  const isSelectedTruckMaintenance = selectedTruckObject?.maintenanceDates?.includes(targetDate);

  // Check if target truck is booked by another branch on the selected date
  const isTruckBookedElsewhere = allJobs.some(j => 
    j.truckId === targetTruckId && 
    j.date === targetDate && 
    !jobs.some(aj => aj.id === j.id)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Fleet Scheduler</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage schedules. Hover empty slots to add Maintenance or inspect cross-branch conflicts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <Calendar className="w-4 h-4 text-brand-400" />
          <span>July 6 – July 12, 2026</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Scheduler Grid */}
        <div className="xl:col-span-3 glass-panel rounded-2xl border border-slate-800/60 p-5 overflow-x-auto relative">
          <div className="min-w-[900px]">
            {/* Grid Header: Days of the week */}
            <div className="grid grid-cols-8 gap-3 pb-4 border-b border-slate-800/40 text-center">
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
            <div className="divide-y divide-slate-800/30 mt-4 space-y-4">
              {trucks.map(truck => (
                <div key={truck.id} className="grid grid-cols-8 gap-3 pt-4 items-center">
                  
                  {/* Truck Info Cell */}
                  <div className="flex items-start gap-2.5 pl-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-white truncate leading-none">
                        {truck.name.split(' ')[0] + ' ' + truck.name.split(' ')[1]}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate flex items-center gap-0.5 mt-1">
                        <User className="w-2.5 h-2.5" />
                        {truck.driverName.split(' ')[0]}
                      </p>
                    </div>
                  </div>

                  {/* Days Cells */}
                  {weekDays.map(day => {
                    const assignedJobs = getJobsForCell(truck.id, day.dateStr);
                    const allCellJobs = getAllJobsForCell(truck.id, day.dateStr);
                    const isUnderMaintenance = truck.maintenanceDates?.includes(day.dateStr);
                    
                    // Cross-branch jobs are in allCellJobs but not in assignedJobs
                    const crossBranchJobs = allCellJobs.filter(
                      mj => !assignedJobs.some(aj => aj.id === mj.id)
                    );

                    const isConflict = assignedJobs.length > 1;
                    const isCrossBranchConflict = crossBranchJobs.length > 0;

                    return (
                      <div 
                        key={day.dateStr} 
                        className={`h-22 rounded-xl border p-2 flex flex-col gap-1 transition-all relative group/cell ${
                          isUnderMaintenance
                            ? 'bg-slate-900/40 border-slate-850'
                            : isConflict 
                              ? 'bg-red-950/20 border-red-500/40 ring-1 ring-red-500/20' 
                              : isCrossBranchConflict
                                ? 'bg-amber-950/10 border-amber-500/20 ring-1 ring-amber-500/10'
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
                            <Wrench className="w-3.5 h-3.5 text-amber-500 group-hover/maint:animate-spin" />
                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1 block">
                              SERVICE
                            </span>
                            <span className="text-[6px] text-slate-500 font-bold group-hover/maint:text-white uppercase transition-colors mt-0.5">
                              Release
                            </span>
                          </div>
                        ) : (
                          <>
                            {/* Conflict Warning Badge */}
                            {isConflict && (
                              <div className="flex items-center gap-1 text-red-400 font-extrabold text-[8px] tracking-wide bg-red-500/10 px-1 rounded absolute top-1 right-1 z-10 border border-red-500/20 animate-pulse">
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

                            <div className="flex flex-col gap-1 h-full overflow-y-auto pr-0.5">
                              {/* Render Active Branch Jobs */}
                              {assignedJobs.map(job => (
                                <div 
                                  key={job.id}
                                  onClick={() => onSelectJob(job)}
                                  className={`rounded-lg p-1.5 cursor-pointer text-left border relative group/item select-none transition-all ${
                                    job.status === 'Completed'
                                      ? 'bg-emerald-950/30 border-emerald-500/25 hover:bg-emerald-950/50 hover:border-emerald-500/40 text-emerald-400'
                                      : 'bg-brand-950/30 border-brand-500/25 hover:bg-brand-950/50 hover:border-brand-500/40 text-brand-400'
                                  }`}
                                >
                                  <div className="text-[9px] font-bold uppercase truncate max-w-[80px]">
                                    {job.clientName}
                                  </div>
                                  <div className="flex justify-between items-center text-[8px] text-slate-400 mt-0.5">
                                    <span className="truncate max-w-[50px]">{job.origin.split(' ')[1] || 'Austin'}</span>
                                    <span className="font-bold text-white">{formatCurrency(job.revenue || job.estimateAmount)}</span>
                                  </div>

                                  {/* Hover Tooltip */}
                                  <div className="absolute hidden group-hover/item:block bg-slate-900/95 border border-slate-800 text-white rounded-xl p-3.5 z-45 shadow-2xl w-60 text-xs bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none space-y-2 backdrop-blur-md">
                                    <div className="flex justify-between items-start border-b border-slate-800 pb-1.5">
                                      <span className="font-extrabold text-brand-400">{job.clientName}</span>
                                      <span className="font-black text-slate-300">{formatCurrency(job.revenue || job.estimateAmount)}</span>
                                    </div>
                                    <div className="space-y-1 text-[10px]">
                                      <div className="flex gap-1 items-start text-slate-300">
                                        <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                          {job.origin.split(',')[0]} ➜ {job.destination.split(',')[0]}
                                        </span>
                                      </div>
                                      <div className="flex gap-1 items-start text-slate-300">
                                        <Layers className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                                        <span className="truncate">{job.items}</span>
                                      </div>
                                    </div>
                                    <div className="text-[9px] text-slate-500 border-t border-slate-800/60 pt-1 text-center font-medium">
                                      Click block to open dispatch sheet
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
                                className="h-full w-full flex flex-col items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200 cursor-pointer"
                                title="Click to book maintenance locks"
                              >
                                <Wrench className="w-3.5 h-3.5 text-slate-500 hover:text-amber-500 mb-0.5" />
                                <span className="text-[8px] font-bold text-slate-600 hover:text-amber-500 uppercase tracking-wider">
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
              ))}
            </div>

          </div>
        </div>

        {/* Quick Assign Form / Unassigned Jobs Sidepanel */}
        <div className="glass-panel rounded-2xl border border-slate-800/60 p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white">Quick Dispatcher</h4>
              <p className="text-xs text-slate-400">Assign unscheduled jobs to fleet</p>
            </div>

            {unscheduledJobs.length === 0 ? (
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40 flex flex-col items-center justify-center text-center py-8">
                <AlertCircle className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs text-slate-500 font-semibold">No unscheduled jobs</p>
                <p className="text-[10px] text-slate-600 mt-1">Move jobs to 'Scheduled' or 'Estimate Sent' to list them here.</p>
              </div>
            ) : (
              <form onSubmit={handleQuickAssign} className="space-y-4">
                
                {/* Warning Banner if Truck has maintenance scheduled on selected date */}
                {isSelectedTruckMaintenance && (
                  <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-[10px] text-red-400 font-semibold flex items-start gap-1.5 animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Warning: {selectedTruckObject.name.split(' ')[0]} is scheduled for maintenance/service on this date. Choose another vehicle or day.</span>
                  </div>
                )}

                {/* Warning Banner if Truck has booking in another branch */}
                {!isSelectedTruckMaintenance && isTruckBookedElsewhere && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[10px] text-amber-400 font-semibold flex items-start gap-1.5 animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Warning: Selected truck is booked on this date in another branch division. Assigning will create a cross-branch conflict.</span>
                  </div>
                )}

                {/* Select Job */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">1. Select Job</label>
                  <select
                    value={selectedUnassignedJobId}
                    onChange={(e) => setSelectedUnassignedJobId(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-white border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-brand-500/50 transition-all cursor-pointer font-medium"
                    required
                  >
                    <option value="">-- Choose Job --</option>
                    {unscheduledJobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.clientName} ({formatCurrency(job.estimateAmount)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Truck */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">2. Select Truck</label>
                  <select
                    value={targetTruckId}
                    onChange={(e) => setTargetTruckId(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-white border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-brand-500/50 transition-all cursor-pointer font-medium"
                    required
                  >
                    <option value="">-- Choose Truck --</option>
                    {trucks.map(truck => (
                      <option key={truck.id} value={truck.id}>
                        {truck.name.split(' ')[0] + ' ' + truck.name.split(' ')[1]} ({truck.driverName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Day */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">3. Select Date</label>
                  <select
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-white border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-brand-500/50 transition-all cursor-pointer font-medium"
                  >
                    {weekDays.map(day => (
                      <option key={day.dateStr} value={day.dateStr}>
                        {day.name} ({day.label})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!selectedUnassignedJobId || !targetTruckId || isSelectedTruckMaintenance}
                  className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-xl transition-all shadow-md shadow-brand-600/10 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Assign & Dispatch
                </button>
              </form>
            )}
          </div>

          <div className="border-t border-slate-850 pt-4 text-[10px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-400 block mb-0.5">Fleet Maintenance Guard:</span>
            Dispatcher can lock trucks for maintenance service directly by clicking "+ Service" on empty grid slots.
          </div>
        </div>

      </div>
    </div>
  );
}

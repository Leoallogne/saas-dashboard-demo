import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { Search } from 'lucide-react';
import SkeletonLoader from './components/SkeletonLoader';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import JobPipeline from './components/JobPipeline';
import FleetScheduler from './components/FleetScheduler';
import JobDetailsModal from './components/JobDetailsModal';
import ExecutiveProfile from './components/ExecutiveProfile';
import JobAuditLedger from './components/JobAuditLedger';
import ToastContainer from './components/ToastNotification';
import { initialJobs, initialTrucks } from './data/mockData';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [region, setRegion] = useState('US'); // 'US', 'UK', 'AU'
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // 1. SAFELY Initialize State from LocalStorage with filter safeguards
  const [pipelines, setPipelines] = useState(() => {
    try {
      const saved = localStorage.getItem('moveops_pipelines');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter to ensure only valid objects with an 'id' and 'name' exist
          const valid = parsed.filter(p => p && typeof p === 'object' && p.id && p.name);
          if (valid.length > 0) return valid;
        }
      }
    } catch (e) {
      console.error("Failed to parse pipelines from localStorage:", e);
    }
    return [
      { id: 'pl-1', name: 'Austin HQ (Default)' },
      { id: 'pl-2', name: 'Dallas Division' }
    ];
  });
  
  const [activePipelineId, setActivePipelineId] = useState(() => {
    try {
      const saved = localStorage.getItem('moveops_active_pipeline_id');
      if (saved && typeof saved === 'string') return saved;
    } catch (e) {
      console.error("Failed to read active pipeline ID:", e);
    }
    return 'pl-1';
  });

  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('moveops_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter to ensure only valid job objects with 'id', 'clientName', and 'status' exist
          const valid = parsed.filter(j => j && typeof j === 'object' && j.id && j.clientName && j.status);
          return valid;
        }
      }
    } catch (e) {
      console.error("Failed to parse jobs database:", e);
    }
    // Tag initial mock jobs with default branch id
    return initialJobs.map(j => ({ ...j, pipelineId: 'pl-1' }));
  });

  const [trucks, setTrucks] = useState(() => {
    try {
      const saved = localStorage.getItem('moveops_trucks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter to ensure only valid truck objects exist
          const valid = parsed.filter(t => t && typeof t === 'object' && t.id && t.name);
          if (valid.length > 0) return valid;
        }
      }
    } catch (e) {
      console.error("Failed to parse trucks:", e);
    }
    return initialTrucks;
  });

  const [companyName, setCompanyName] = useState(() => {
    try {
      const saved = localStorage.getItem('moveops_company_name');
      if (saved && typeof saved === 'string') return saved;
    } catch (e) {
      console.error("Failed to read company name:", e);
    }
    return 'Houston Movers';
  });

  const [logo, setLogo] = useState(() => {
    try {
      const saved = localStorage.getItem('moveops_company_logo');
      if (saved) return saved;
    } catch (e) {
      console.error("Failed to read company logo:", e);
    }
    return '';
  });

  const [hourlyRate, setHourlyRate] = useState(() => {
    try {
      const saved = localStorage.getItem('moveops_hourly_rate');
      if (saved) return Number(saved);
    } catch (e) {
      console.error("Failed to read hourly rate:", e);
    }
    return 25;
  });

  const [fuelRate, setFuelRate] = useState(() => {
    try {
      const saved = localStorage.getItem('moveops_fuel_rate');
      if (saved) return Number(saved);
    } catch (e) {
      console.error("Failed to read fuel rate:", e);
    }
    return 1.50;
  });

  const [selectedJob, setSelectedJob] = useState(null);

  // Prefilled quote data for modal creation
  const [prefilledQuoteData, setPrefilledQuoteData] = useState(null);

  // Dynamic activity logs state
  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('moveops_activity_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse activity logs:", e);
    }
    return [
      { id: 'log-1', message: 'Sarah Jenkins status changed to "Scheduled"', time: '10 mins ago' },
      { id: 'log-2', message: 'Truck D locked for service on 2026-07-10', time: '1 hour ago' },
      { id: 'log-3', message: 'Inquiry created for Bruce Wayne ($4800)', time: '3 hours ago' }
    ];
  });

  const addActivityLog = (message) => {
    const newLog = {
      id: `log-${Math.random().toString(36).substring(2, 9)}`,
      message,
      time: 'Just now'
    };
    setActivityLogs(prev => {
      const updated = [newLog, ...prev.slice(0, 19)];
      try {
        localStorage.setItem('moveops_activity_logs', JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save activity logs:", e);
      }
      return updated;
    });
  };

  const handleStartJobFromQuote = (quoteData) => {
    setPrefilledQuoteData(quoteData);
    setActiveTab('pipeline');
    addActivityLog(`Penawaran Harga ($${quoteData.estimateAmount}) ditransfer ke form Kanban.`);
  };

  // 2. Synchronize States safely in useEffect
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('moveops_jobs', JSON.stringify(jobs));
        localStorage.setItem('moveops_trucks', JSON.stringify(trucks));
        localStorage.setItem('moveops_pipelines', JSON.stringify(pipelines));
        localStorage.setItem('moveops_active_pipeline_id', activePipelineId);
        localStorage.setItem('moveops_company_name', companyName);
        localStorage.setItem('moveops_company_logo', logo);
        localStorage.setItem('moveops_hourly_rate', hourlyRate.toString());
        localStorage.setItem('moveops_fuel_rate', fuelRate.toString());
      } catch (e) {
        console.error("Write error on localStorage:", e);
      }
    }
  }, [jobs, trucks, pipelines, activePipelineId, companyName, logo, hourlyRate, fuelRate, isLoading]);

  // Simulate loading state for 1.2s to present professional skeleton load and handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // trigger initially
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Toast helpers
  const addToast = (type, title, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Currency Formatter depending on region selection
  const formatCurrency = (amount) => {
    try {
      if (region === 'UK') {
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP',
          maximumFractionDigits: 0
        }).format(amount);
      } else if (region === 'AU') {
        return new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD',
          maximumFractionDigits: 0
        }).format(amount);
      } else {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(amount);
      }
    } catch (e) {
      return `$${amount}`;
    }
  };

  // Update a job's kanban stage/status
  const handleUpdateJobStatus = (jobId, newStatus) => {
    let jobName = '';
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (job.id === jobId) {
          jobName = job.clientName;
          const updatedJob = { ...job, status: newStatus };
          // If status changes to New Inquiry or Estimate Sent, free up the truck
          if (newStatus === 'New Inquiry' || newStatus === 'Estimate Sent') {
            updatedJob.truckId = null;
          }
          return updatedJob;
        }
        return job;
      })
    );

    // Trigger toast notification
    if (jobName) {
      addToast('success', 'Status Updated', `${jobName} moved to "${newStatus}"`);
      addActivityLog(`${jobName} status changed to "${newStatus}"`);
    }

    // If modal is currently open and viewing this job, sync details
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => ({
        ...prev,
        status: newStatus,
        truckId: (newStatus === 'New Inquiry' || newStatus === 'Estimate Sent') ? null : prev.truckId
      }));
    }
  };

  // Assign a truck to a job
  const handleAssignTruck = (jobId, truckId) => {
    let clientName = '';
    let truckName = 'Unassigned';

    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (job.id === jobId) {
          clientName = job.clientName;
          return { ...job, truckId };
        }
        return job;
      })
    );

    // Update trucks status if applicable
    if (truckId) {
      const selectedTruck = trucks.find(t => t.id === truckId);
      if (selectedTruck) {
        truckName = selectedTruck.name.split(' ')[0] + ' ' + selectedTruck.name.split(' ')[1];
      }
    }

    // Trigger toast notification
    if (clientName) {
      addToast('info', 'Fleet Assigned', `${clientName} has been assigned to ${truckName}`);
      addActivityLog(`${clientName} assigned to ${truckName}`);
    }

    // Sync modal selection
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => ({ ...prev, truckId }));
    }
  };

  // Toggle Truck Maintenance
  const handleToggleMaintenance = (truckId, dateStr) => {
    let truckName = 'Truck';
    setTrucks(prevTrucks => 
      prevTrucks.map(truck => {
        if (truck.id === truckId) {
          truckName = truck.name.split(' ')[0] + ' ' + truck.name.split(' ')[1];
          const dates = truck.maintenanceDates || [];
          const isMaintenance = dates.includes(dateStr);
          const updatedDates = isMaintenance
            ? dates.filter(d => d !== dateStr)
            : [...dates, dateStr];
          
          if (!isMaintenance) {
            // Auto unassign jobs scheduled on this day & truck
             setJobs(prevJobs => 
               prevJobs.map(job => {
                 if (job.truckId === truckId && job.date === dateStr && job.pipelineId === activePipelineId) {
                   return { ...job, truckId: null };
                 }
                 return job;
               })
             );
            // Search if any job was affected
            const affectedJobs = jobs.filter(j => j.truckId === truckId && j.date === dateStr && j.pipelineId === activePipelineId);
            if (affectedJobs.length > 0) {
              addToast('warning', 'Schedule Unassigned', `Unassigned ${affectedJobs.length} job(s) from ${truckName} due to scheduled maintenance.`);
              addActivityLog(`${truckName} locked for maintenance. ${affectedJobs.length} jobs rescheduled.`);
            } else {
              addToast('info', 'Maintenance Scheduled', `${truckName} scheduled for service on ${dateStr}`);
              addActivityLog(`${truckName} scheduled for maintenance on ${dateStr}`);
            }
          } else {
            addToast('success', 'Truck Available', `${truckName} marked available on ${dateStr}`);
            addActivityLog(`${truckName} marked available on ${dateStr}`);
          }
          return { ...truck, maintenanceDates: updatedDates };
        }
        return truck;
      })
    );
  };

  // Update job properties immutably
  const handleUpdateJobDetails = (jobId, updatedFields) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, ...updatedFields } 
          : job
      )
    );

    // Sync modal selection if open
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => ({ ...prev, ...updatedFields }));
    }

    // Trigger toast only if updating crew sizes/rates (profitability settings)
    if (updatedFields.crewSize || updatedFields.durationHours || updatedFields.crewHourlyRate || updatedFields.crewMembers) {
      addToast('info', 'Profitability Updated', `Recalculated wages & net profit for ${selectedJob?.clientName || 'job'}`);
    }
  };

  // Create Workspace / Pipeline Branch
  const handleCreatePipeline = (name) => {
    const newId = `pl-${Math.random().toString(36).substring(2, 9)}`;
    const newPipelineObj = { id: newId, name };
    setPipelines(prev => [...prev, newPipelineObj]);
    setActivePipelineId(newId);
    addToast('success', 'Workspace Switched', `Created and switched to branch: ${name}`);
    addActivityLog(`Switched branch to: ${name}`);
  };

  const handleAddNewJob = (newJobData) => {
    // Add default values for crew/payroll and tag with current active pipeline branch!
    const jobWithPayroll = {
      ...newJobData,
      pipelineId: activePipelineId,
      crewSize: 3,
      durationHours: 6,
      crewHourlyRate: 25
    };
    setJobs(prev => [jobWithPayroll, ...prev]);
    addToast('success', 'New Inquiry Created', `Created job files for ${newJobData.clientName}`);
    addActivityLog(`New Inquiry created for ${newJobData.clientName} ($${newJobData.estimateAmount})`);
  };

  // Seed default templates for new branches
  const handleSeedBranchData = () => {
    const templateJobs = [
      {
        id: `job-t1-${Math.random().toString(36).substring(2, 5)}`,
        pipelineId: activePipelineId,
        clientName: 'Diana Prince',
        status: 'New Inquiry',
        origin: '1004 Congress Ave, Austin, TX',
        destination: '502 Peachtree Rd, Atlanta, GA',
        estimateAmount: 4800,
        revenue: 4800,
        truckId: null,
        date: '2026-07-09',
        items: '4 Bedroom House, Safe, Exercise Equipment',
        phone: '(512) 555-4902',
        email: 'diana.p@justice.org',
        notes: 'Needs liftgate truck. Wrap delicate items.',
        crewSize: 4,
        durationHours: 10,
        crewHourlyRate: 25
      },
      {
        id: `job-t2-${Math.random().toString(36).substring(2, 5)}`,
        pipelineId: activePipelineId,
        clientName: 'Bruce Wayne',
        status: 'Estimate Sent',
        origin: '1007 Mountain Dr, Gotham, NJ',
        destination: '1202 Bristol Rd, Bristol, UK',
        estimateAmount: 8500,
        revenue: 8500,
        truckId: null,
        date: '2026-07-10',
        items: 'Castle Relocation: Heavy sculptures, armor suits, library bookshelves',
        phone: '(512) 555-1939',
        email: 'bruce@waynecorp.com',
        notes: 'COI required. Handle heavy artifacts with extreme caution.',
        crewSize: 6,
        durationHours: 12,
        crewHourlyRate: 28
      },
      {
        id: `job-t3-${Math.random().toString(36).substring(2, 5)}`,
        pipelineId: activePipelineId,
        clientName: 'Clark Kent',
        status: 'Scheduled',
        origin: '344 Clinton St, Metropolis, NY',
        destination: 'Rural Route 2, Smallville, KS',
        estimateAmount: 1200,
        revenue: 1200,
        truckId: 'truck-c',
        date: '2026-07-08',
        items: '1 Bedroom Apt, Desk, 20 book boxes',
        phone: '(512) 555-1938',
        email: 'ckent@dailyplanet.com',
        notes: 'Self-packing. Assist with heavy bookshelves.',
        crewSize: 2,
        durationHours: 5,
        crewHourlyRate: 25
      },
      {
        id: `job-t4-${Math.random().toString(36).substring(2, 5)}`,
        pipelineId: activePipelineId,
        clientName: 'Barry Allen',
        status: 'Completed',
        origin: '502 Central Ave, Central City, MO',
        destination: '109 Keystone St, Keystone, KS',
        estimateAmount: 1500,
        revenue: 1550,
        truckId: 'truck-d',
        date: '2026-07-06',
        items: '2 Bedroom Apt, Treadmill, Couch, 15 boxes',
        phone: '(512) 555-1940',
        email: 'ballen@ccpd.gov',
        notes: 'Fast delivery requested. Completed successfully.',
        crewSize: 3,
        durationHours: 4,
        crewHourlyRate: 25
      }
    ];
    setJobs(prev => [...templateJobs, ...prev]);
    addToast('success', 'Branch Seeded', `Successfully loaded template demo files for active branch.`);
  };

  // 3. Filter Master Jobs List by Active Pipeline ID (Safe checking default empty array)
  const activePipelineJobs = Array.isArray(jobs) ? jobs.filter(j => j && j.pipelineId === activePipelineId) : [];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ExecutiveDashboard 
            jobs={activePipelineJobs} 
            trucks={trucks} 
            companyName={companyName}
            setActiveTab={setActiveTab}
            formatCurrency={formatCurrency}
            hourlyRate={hourlyRate}
            fuelRate={fuelRate}
            activityLogs={activityLogs}
            onStartJobFromQuote={handleStartJobFromQuote}
          />
        );
      case 'pipeline':
        return (
          <JobPipeline 
            jobs={activePipelineJobs} 
            trucks={trucks}
            onSelectJob={setSelectedJob}
            onUpdateJobStatus={handleUpdateJobStatus}
            onAddNewJob={handleAddNewJob}
            onSeedData={handleSeedBranchData}
            formatCurrency={formatCurrency}
            prefilledQuoteData={prefilledQuoteData}
            clearPrefilledQuoteData={() => setPrefilledQuoteData(null)}
          />
        );
      case 'scheduler':
        return (
          <FleetScheduler 
            jobs={activePipelineJobs} 
            allJobs={jobs}
            trucks={trucks} 
            pipelines={pipelines}
            onSelectJob={setSelectedJob} 
            onAssignTruck={handleAssignTruck}
            onUpdateJobStatus={handleUpdateJobStatus}
            onToggleMaintenance={handleToggleMaintenance}
            formatCurrency={formatCurrency}
            onUpdateJobDetails={handleUpdateJobDetails}
          />
        );
      case 'audit':
        return (
          <JobAuditLedger 
            jobs={activePipelineJobs}
            formatCurrency={formatCurrency}
            addToast={addToast}
            hourlyRate={hourlyRate}
            fuelRate={fuelRate}
          />
        );
      case 'profile':
        return (
          <ExecutiveProfile 
            companyName={companyName}
            setCompanyName={setCompanyName}
            addToast={addToast}
            logo={logo}
            setLogo={setLogo}
            hourlyRate={hourlyRate}
            setHourlyRate={setHourlyRate}
            fuelRate={fuelRate}
            setFuelRate={setFuelRate}
          />
        );
      default:
        return null;
    }
  };

  const globalSearchMatches = globalSearchQuery.trim()
    ? jobs.filter(job => 
        job && (
          job.clientName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
          job.origin.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
          job.destination.toLowerCase().includes(globalSearchQuery.toLowerCase())
        )
      )
    : [];

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        companyName={companyName} 
        setCompanyName={setCompanyName}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        region={region}
        setRegion={setRegion}
        pipelines={pipelines}
        activePipelineId={activePipelineId}
        setActivePipelineId={setActivePipelineId}
        onCreatePipeline={handleCreatePipeline}
        logo={logo}
      />

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto relative z-0">
        
        {/* Global Dispatch Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-900/60 print:hidden flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping inline-block" />
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              Branch: {pipelines.find(p => p.id === activePipelineId)?.name || 'Austin HQ'}
            </span>
          </div>
          
          {/* Global Quick Search Input */}
          <div className="relative w-64 md:w-80">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Global Search Job or Client..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500/50 transition-all shadow-inner"
            />
            
            {/* Global Search Results Dropdown overlay */}
            {globalSearchMatches.length > 0 && (
              <div className="absolute top-full mt-2 right-0 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 text-[11px] divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                <div className="bg-slate-950 p-2 text-slate-500 uppercase tracking-widest text-[8px] font-black">
                  Found {globalSearchMatches.length} Search Matches
                </div>
                {globalSearchMatches.map(match => (
                  <div
                    key={match.id}
                    onClick={() => {
                      setSelectedJob(match);
                      setGlobalSearchQuery('');
                    }}
                    className="p-3 hover:bg-slate-850 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-white">{match.clientName}</span>
                      <span className="text-[9px] bg-slate-850 px-1.5 py-0.5 rounded border border-slate-800/80 text-slate-400 font-bold uppercase">
                        {pipelines.find(p => p.id === match.pipelineId)?.name || 'Austin HQ'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-450 truncate mt-0.5">
                      {match.origin.split(',')[0]} ➜ {match.destination.split(',')[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Component Tab View */}
        <div className="flex-1 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </div>
      </main>

      {/* Shared Job Details Modal overlay */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdateJobStatus={handleUpdateJobStatus}
          onAssignTruck={handleAssignTruck}
          onUpdateJobDetails={handleUpdateJobDetails}
          trucks={trucks}
          formatCurrency={formatCurrency}
          fuelRate={fuelRate}
        />
      )}

      {/* Global Stacked Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

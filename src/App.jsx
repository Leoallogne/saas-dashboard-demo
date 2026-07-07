import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SkeletonLoader from './components/SkeletonLoader';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import JobPipeline from './components/JobPipeline';
import FleetScheduler from './components/FleetScheduler';
import JobDetailsModal from './components/JobDetailsModal';
import ToastContainer from './components/ToastNotification';
import { initialJobs, initialTrucks } from './data/mockData';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [region, setRegion] = useState('US'); // 'US', 'UK', 'AU'
  const [toasts, setToasts] = useState([]);

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

  const [selectedJob, setSelectedJob] = useState(null);

  // 2. Synchronize States safely in useEffect
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('moveops_jobs', JSON.stringify(jobs));
        localStorage.setItem('moveops_trucks', JSON.stringify(trucks));
        localStorage.setItem('moveops_pipelines', JSON.stringify(pipelines));
        localStorage.setItem('moveops_active_pipeline_id', activePipelineId);
        localStorage.setItem('moveops_company_name', companyName);
      } catch (e) {
        console.error("Write error on localStorage:", e);
      }
    }
  }, [jobs, trucks, pipelines, activePipelineId, companyName, isLoading]);

  // Simulate loading state for 1.2s to present professional skeleton load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
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
                if (job.truckId === truckId && job.date === dateStr) {
                  return { ...job, truckId: null };
                }
                return job;
              })
            );
            // Search if any job was affected
            const affectedJobs = jobs.filter(j => j.truckId === truckId && j.date === dateStr && j.pipelineId === activePipelineId);
            if (affectedJobs.length > 0) {
              addToast('warning', 'Schedule Unassigned', `Unassigned ${affectedJobs.length} job(s) from ${truckName} due to scheduled maintenance.`);
            } else {
              addToast('info', 'Maintenance Scheduled', `${truckName} scheduled for service on ${dateStr}`);
            }
          } else {
            addToast('success', 'Truck Available', `${truckName} marked available on ${dateStr}`);
          }
          return { ...truck, maintenanceDates: updatedDates };
        }
        return truck;
      })
    );
  };

  // Update Profitability Slider Variables
  const handleUpdateJobProfitability = (jobId, profitabilityData) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, ...profitabilityData } 
          : job
      )
    );

    // Sync modal selection if open
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => ({ ...prev, ...profitabilityData }));
    }

    addToast('info', 'Profitability Updated', `Recalculated wages & net profit for ${selectedJob?.clientName || 'job'}`);
  };

  // Create Workspace / Pipeline Branch
  const handleCreatePipeline = (name) => {
    const newId = `pl-${Math.random().toString(36).substring(2, 9)}`;
    const newPipelineObj = { id: newId, name };
    setPipelines(prev => [...prev, newPipelineObj]);
    setActivePipelineId(newId);
    addToast('success', 'Workspace Switched', `Created and switched to branch: ${name}`);
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
          />
        );
      case 'pipeline':
        return (
          <JobPipeline 
            jobs={activePipelineJobs} 
            onSelectJob={setSelectedJob}
            onUpdateJobStatus={handleUpdateJobStatus}
            onAddNewJob={handleAddNewJob}
            formatCurrency={formatCurrency}
          />
        );
      case 'scheduler':
        return (
          <FleetScheduler 
            jobs={activePipelineJobs} 
            trucks={trucks} 
            onSelectJob={setSelectedJob} 
            onAssignTruck={handleAssignTruck}
            onUpdateJobStatus={handleUpdateJobStatus}
            onToggleMaintenance={handleToggleMaintenance}
            formatCurrency={formatCurrency}
          />
        );
      default:
        return null;
    }
  };

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
      />

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto relative z-0">
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
          onUpdateJobProfitability={handleUpdateJobProfitability}
          trucks={trucks}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Global Stacked Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Calendar, 
  Download, 
  Printer, 
  ArrowUpRight, 
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  MapPin, 
  Layers, 
  FileText,
  User,
  CheckCircle,
  Filter,
  Mail,
  AlertTriangle,
  Flag
} from 'lucide-react';

export default function JobAuditLedger({ jobs, formatCurrency, addToast, hourlyRate, fuelRate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [marginFilter, setMarginFilter] = useState('all');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
  
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedAuditJob, setSelectedAuditJob] = useState(null);
  const [activeInvoiceJobId, setActiveInvoiceJobId] = useState(null);
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [reconciledJobIds, setReconciledJobIds] = useState([]); // Local state for reconciled jobs
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);

  // Helper to identify anomalous / suspicious transactions
  const checkAnomaly = (job) => {
    const billings = job.revenue || job.estimateAmount || 0;
    const crewSize = job.crewSize || 3;
    const durationHours = job.durationHours || 6;
    const crewHourlyRate = job.crewHourlyRate || hourlyRate;
    const wages = crewSize * durationHours * crewHourlyRate;
    
    // Calculate fuel cost based on distance
    const nameLength = job.clientName.length;
    const distanceMilesFallback = (nameLength * 7) % 45 + 15;
    const fuelCost = distanceMilesFallback * fuelRate;
    
    const totalExpenses = wages + fuelCost;
    const profit = billings - totalExpenses;
    const margin = billings > 0 ? (profit / billings) * 100 : 0;

    const issues = [];
    if (billings === 0) issues.push('Zero Billings');
    if (profit < 0) issues.push('Negative Net Profit');
    else if (margin < 15) issues.push('Low Profit Margin (<15%)');
    if (wages > billings * 0.7) issues.push('High Wages (>70%)');
    if (fuelCost > billings * 0.3) issues.push('High Fuel Cost (>30%)');
    
    return {
      isAnomalous: issues.length > 0,
      issues
    };
  };

  // Filter ONLY Completed jobs for auditing
  const completedJobs = jobs.filter(j => j.status === 'Completed');

  // Total anomalies count across all completed jobs
  const totalAnomaliesCount = useMemo(() => {
    return completedJobs.filter(j => checkAnomaly(j).isAnomalous).length;
  }, [completedJobs]);

  // Compute derived values and filter
  const filteredCompletedJobs = completedJobs.filter(job => {
    const billings = job.revenue || job.estimateAmount || 0;
    const crewSize = job.crewSize || 3;
    const durationHours = job.durationHours || 6;
    const crewHourlyRate = job.crewHourlyRate || hourlyRate;
    const wages = crewSize * durationHours * crewHourlyRate;
    const profit = billings - wages;
    const margin = billings > 0 ? (profit / billings) * 100 : 0;

    const matchesSearch = 
      job.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.items && job.items.toLowerCase().includes(searchQuery.toLowerCase()));

    const jobDate = new Date(job.date);
    const matchesStartDate = startDate ? jobDate >= new Date(startDate) : true;
    
    let matchesEndDate = true;
    if (endDate) {
      const parsedEndDate = new Date(endDate);
      parsedEndDate.setHours(23, 59, 59, 999);
      matchesEndDate = jobDate <= parsedEndDate;
    }

    let matchesMargin = true;
    if (marginFilter === 'high') matchesMargin = margin >= 60;
    if (marginFilter === 'average') matchesMargin = margin >= 30 && margin < 60;
    if (marginFilter === 'low') matchesMargin = margin < 30;

    const matchesAnomaly = !showAnomaliesOnly || checkAnomaly(job).isAnomalous;

    return matchesSearch && matchesStartDate && matchesEndDate && matchesMargin && matchesAnomaly;
  });

  // Sorting
  const sortedJobs = [...filteredCompletedJobs].sort((a, b) => {
    let valA, valB;
    const billingsA = a.revenue || a.estimateAmount || 0;
    const wagesA = (a.crewSize || 3) * (a.durationHours || 6) * (a.crewHourlyRate || hourlyRate);
    const profitA = billingsA - wagesA;

    const billingsB = b.revenue || b.estimateAmount || 0;
    const wagesB = (b.crewSize || 3) * (b.durationHours || 6) * (b.crewHourlyRate || hourlyRate);
    const profitB = billingsB - wagesB;

    switch (sortField) {
      case 'date':
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
        break;
      case 'client':
        valA = a.clientName.toLowerCase();
        valB = b.clientName.toLowerCase();
        break;
      case 'billings':
        valA = billingsA;
        valB = billingsB;
        break;
      case 'wages':
        valA = wagesA;
        valB = wagesB;
        break;
      case 'profit':
        valA = profitA;
        valB = profitB;
        break;
      default:
        valA = 0;
        valB = 0;
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats for Filtered Jobs
  const totalRevenue = filteredCompletedJobs.reduce((sum, j) => sum + (j.revenue || j.estimateAmount || 0), 0);
  const totalWages = filteredCompletedJobs.reduce((sum, j) => 
    sum + ((j.crewSize || 3) * (j.durationHours || 6) * (j.crewHourlyRate || hourlyRate)), 0
  );
  const netProfit = totalRevenue - totalWages;
  const avgMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  
  const expensesPercentage = totalRevenue > 0 ? (totalWages / totalRevenue) * 100 : 0;
  const profitPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Handlers
  const handleExportCSV = () => {
    const jobsToExport = selectedJobIds.length > 0 
      ? sortedJobs.filter(j => selectedJobIds.includes(j.id))
      : sortedJobs;

    if (jobsToExport.length === 0) {
      addToast('warning', 'Export Empty', 'No completed jobs available to export.');
      return;
    }

    // CSV headers
    const headers = [
      'Job ID',
      'Client Name',
      'Move Date',
      'Origin Address',
      'Destination Address',
      'Billings (Revenue)',
      'Wage Cost',
      'Fuel Cost',
      'Total Expenses',
      'Net Profit',
      'Profit Margin (%)',
      'Reconciled Status',
      'Audit Issues'
    ];

    // CSV rows
    const rows = jobsToExport.map(job => {
      const crewSize = job.crewSize || 3;
      const durationHours = job.durationHours || 6;
      const crewHourlyRate = job.crewHourlyRate || hourlyRate;
      const wageCost = crewSize * durationHours * crewHourlyRate;
      
      const nameLength = job.clientName.length;
      const distanceMilesFallback = (nameLength * 7) % 45 + 15;
      const fuelCost = distanceMilesFallback * fuelRate;
      
      const totalExpenses = wageCost + fuelCost;
      const revenue = job.revenue || job.estimateAmount || 0;
      const profit = revenue - totalExpenses;
      const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
      const isReconciled = reconciledJobIds.includes(job.id) ? 'Reconciled' : 'Unreconciled';
      const anomaly = checkAnomaly(job);
      const auditIssues = anomaly.isAnomalous ? anomaly.issues.join(' | ') : 'None';

      return [
        job.id,
        `"${job.clientName.replace(/"/g, '""')}"`,
        job.date,
        `"${job.origin.replace(/"/g, '""')}"`,
        `"${job.destination.replace(/"/g, '""')}"`,
        revenue,
        wageCost,
        fuelCost.toFixed(2),
        totalExpenses.toFixed(2),
        profit.toFixed(2),
        margin,
        isReconciled,
        `"${auditIssues}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MoveOps_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'Export Complete', `Audited ledger containing ${jobsToExport.length} rows exported to CSV.`);
  };

  const handlePrintLedger = () => {
    window.print();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedJobIds(paginatedJobs.map(j => j.id));
    } else {
      setSelectedJobIds([]);
    }
  };

  const handleSelectJob = (id) => {
    setSelectedJobIds(prev => 
      prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]
    );
  };

  const handleMarkReconciled = () => {
    if (selectedJobIds.length === 0) return;
    setReconciledJobIds(prev => [...new Set([...prev, ...selectedJobIds])]);
    addToast('success', 'Reconciled', `${selectedJobIds.length} jobs marked as reconciled.`);
    setSelectedJobIds([]);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-20" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-brand-400" /> : <ChevronDown className="w-3 h-3 text-brand-400" />;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 print:bg-white print:text-black">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Completed Job Audit Ledger</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Access completed moves, operational labor wages, and audited margins.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedJobIds.length > 0 && (
            <button 
              onClick={handleMarkReconciled}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow mr-2 animate-fade-in"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Reconciled ({selectedJobIds.length})
            </button>
          )}
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow"
          >
            <Download className="w-4 h-4 text-brand-400" />
            Export CSV {selectedJobIds.length > 0 ? `(${selectedJobIds.length})` : ''}
          </button>
          <button 
            onClick={handlePrintLedger}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow"
          >
            <Printer className="w-4 h-4 text-brand-400" />
            Print Ledger
          </button>
        </div>
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 print:grid-cols-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800/40 print:border-black print:bg-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block print:text-slate-600">Audited Moves</span>
          <h3 className="text-2xl font-extrabold text-white mt-1.5 print:text-black">{filteredCompletedJobs.length}</h3>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">Completed invoices</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800/40 print:border-black print:bg-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block print:text-slate-600">Audited Revenue</span>
          <h3 className="text-2xl font-extrabold text-white mt-1.5 print:text-black">{formatCurrency(totalRevenue)}</h3>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">Gross billing sum</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800/40 print:border-black print:bg-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block print:text-slate-600">Movers Payroll</span>
          <h3 className="text-2xl font-extrabold text-red-400 mt-1.5 print:text-red-650">-{formatCurrency(totalWages)}</h3>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">Estimated labor cost</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800/40 print:border-black print:bg-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block print:text-slate-600">Net Profit ({avgMargin}%)</span>
          <h3 className={`text-2xl font-extrabold mt-1.5 print:text-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
            {formatCurrency(netProfit)}
          </h3>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">Profit after labor</span>
        </div>
        <div 
          onClick={() => {
            setShowAnomaliesOnly(prev => !prev);
            setCurrentPage(1);
          }}
          className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer select-none print:hidden ${
            showAnomaliesOnly 
              ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
              : 'border-slate-800/40 hover:border-red-500/30'
          }`}
        >
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Suspicious Flags</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h3 className={`text-2xl font-extrabold ${totalAnomaliesCount > 0 ? 'text-red-500' : 'text-slate-400'}`}>
              {totalAnomaliesCount}
            </h3>
            {totalAnomaliesCount > 0 && (
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            )}
          </div>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">
            {showAnomaliesOnly ? 'Click to show all' : 'Click to filter flags'}
          </span>
        </div>
      </div>

      {/* Visual Breakdown Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/40 print:hidden mt-2">
        <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-widest mb-2.5">
          <span className="text-red-400">Payroll ({Math.round(expensesPercentage)}%)</span>
          <span className="text-slate-400">Gross Revenue {formatCurrency(totalRevenue)}</span>
          <span className="text-emerald-400">Net Profit ({Math.round(profitPercentage)}%)</span>
        </div>
        <div className="h-4 w-full bg-slate-900/80 rounded-full flex overflow-hidden border border-slate-800/80 shadow-inner">
          <div className="bg-red-500/90 h-full transition-all duration-1000" style={{ width: `${Math.max(0, expensesPercentage)}%` }} />
          <div className="bg-emerald-500/90 h-full transition-all duration-1000" style={{ width: `${Math.max(0, profitPercentage)}%` }} />
        </div>
      </div>

      {/* Filters Form */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/60 flex flex-wrap gap-3 items-center justify-between print:hidden">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Text Search */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search client, inventory, or locations..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50 font-medium"
            />
          </div>

          {/* Start Date */}
          <div className="relative w-36">
            <Calendar className="w-3.5 h-3.5 text-slate-550 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500/50 cursor-pointer font-medium"
            />
          </div>

          {/* End Date */}
          <div className="relative w-36">
            <Calendar className="w-3.5 h-3.5 text-slate-550 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500/50 cursor-pointer font-medium"
            />
          </div>

          {/* Margin Filter */}
          <div className="relative w-36">
            <Filter className="w-3.5 h-3.5 text-slate-550 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={marginFilter}
              onChange={(e) => {
                setMarginFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500/50 cursor-pointer appearance-none font-medium"
            >
              <option value="all">All Margins</option>
              <option value="high">High (&gt;=60%)</option>
              <option value="average">Avg (30%-60%)</option>
              <option value="low">Low (&lt;30%)</option>
            </select>
          </div>

          {/* Anomalies Filter Checkbox */}
          <label className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 cursor-pointer hover:border-slate-705 hover:text-white transition-all select-none h-[34px]">
            <input
              type="checkbox"
              checked={showAnomaliesOnly}
              onChange={(e) => {
                setShowAnomaliesOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="rounded border-slate-700 bg-slate-900 checked:bg-brand-500 cursor-pointer text-brand-500 w-3.5 h-3.5"
            />
            <span className={showAnomaliesOnly ? 'text-red-400 font-extrabold' : 'font-bold'}>⚠️ Show Flags Only</span>
          </label>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/60 overflow-hidden print:border-black print:bg-white print:text-black flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/65 border-b border-slate-800/60 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider print:bg-slate-100 print:text-black print:border-black select-none">
                <th className="px-5 py-3.5 w-10 text-center print:hidden">
                  <input 
                    type="checkbox" 
                    checked={paginatedJobs.length > 0 && selectedJobIds.length === paginatedJobs.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 checked:bg-brand-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3.5 cursor-pointer hover:bg-slate-900/50 transition-colors" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1.5">Client & Date <SortIcon field="date" /></div>
                </th>
                <th className="px-5 py-3.5 w-12 text-center">Flags</th>
                <th className="px-5 py-3.5">Route</th>
                <th className="px-5 py-3.5 text-center">Movers / Hours</th>
                <th className="px-5 py-3.5 text-right cursor-pointer hover:bg-slate-900/50 transition-colors" onClick={() => handleSort('wages')}>
                  <div className="flex items-center justify-end gap-1.5">Labor Wages <SortIcon field="wages" /></div>
                </th>
                <th className="px-5 py-3.5 text-right cursor-pointer hover:bg-slate-900/50 transition-colors" onClick={() => handleSort('billings')}>
                  <div className="flex items-center justify-end gap-1.5">Total Billings <SortIcon field="billings" /></div>
                </th>
                <th className="px-5 py-3.5 text-right cursor-pointer hover:bg-slate-900/50 transition-colors" onClick={() => handleSort('profit')}>
                  <div className="flex items-center justify-end gap-1.5">Net Profit <SortIcon field="profit" /></div>
                </th>
                <th className="px-5 py-3.5 text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs font-semibold print:divide-slate-200">
              {paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-16 text-center text-slate-500 uppercase tracking-widest font-extrabold">
                    No completed move records match search constraints
                  </td>
                </tr>
              ) : (
                paginatedJobs.map(job => {
                  const billings = job.revenue || job.estimateAmount || 0;
                  const crewSize = job.crewSize || 3;
                  const durationHours = job.durationHours || 6;
                  const crewHourlyRate = job.crewHourlyRate || hourlyRate;
                  const wages = crewSize * durationHours * crewHourlyRate;
                  const profit = billings - wages;
                  const margin = Math.round((profit / billings) * 100) || 0;

                  const isSelected = selectedJobIds.includes(job.id);
                  const isReconciled = reconciledJobIds.includes(job.id);
                  const anomaly = checkAnomaly(job);

                  return (
                    <React.Fragment key={job.id}>
                      <tr className={`transition-colors print:hover:bg-transparent ${
                        isSelected 
                          ? 'bg-brand-950/20' 
                          : anomaly.isAnomalous 
                            ? 'bg-red-950/15 hover:bg-red-950/20 border-l-[3.5px] border-l-red-500/60' 
                            : isReconciled 
                              ? 'bg-emerald-950/10 hover:bg-emerald-950/15' 
                              : 'hover:bg-slate-900/40'
                      }`}>
                        <td className="px-5 py-4 text-center print:hidden">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleSelectJob(job.id)}
                            className="rounded border-slate-700 bg-slate-900 checked:bg-brand-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-extrabold block print:text-black ${isReconciled ? 'text-emerald-400' : 'text-white'}`}>
                              {job.clientName}
                            </span>
                            {isReconciled && (
                              <CheckCircle className="w-3 h-3 text-emerald-500" title="Reconciled" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5 print:text-slate-600">{job.date}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {anomaly.isAnomalous ? (
                            <div className="relative group/flag inline-block cursor-help z-10">
                              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse mx-auto" />
                              
                              {/* Anomaly Tooltip */}
                              <div className="absolute hidden group-hover/flag:block bg-slate-900 border border-red-500/35 text-white rounded-lg p-2.5 shadow-2xl w-48 text-[10px] left-1/2 -translate-x-1/2 bottom-full mb-1.5 text-left pointer-events-none">
                                <span className="font-extrabold text-red-400 block mb-1">Suspicious Flagged:</span>
                                <ul className="list-disc pl-3 space-y-0.5 text-slate-300 font-semibold">
                                  {anomaly.issues.map((issue, idx) => (
                                    <li key={idx}>{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-650 font-bold">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 max-w-xs truncate">
                          <span className="text-slate-300 block print:text-black truncate">{job.origin.split(',')[0]}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5 truncate">➜ {job.destination.split(',')[0]}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-white font-extrabold block print:text-black">{crewSize} Movers</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5 print:text-slate-600">{durationHours} Hours</span>
                        </td>
                        <td className="px-5 py-4 text-right text-red-400 print:text-black">
                          -{formatCurrency(wages)}
                        </td>
                        <td className="px-5 py-4 text-right text-white print:text-black font-extrabold">
                          {formatCurrency(billings)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={profit >= 0 ? "text-emerald-400 font-extrabold block" : "text-red-500 font-extrabold block"}>
                            {formatCurrency(profit)}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold block mt-0.5">{margin}% Net</span>
                        </td>
                        <td className="px-5 py-4 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedAuditJob(selectedAuditJob === job.id ? null : job.id)}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-800"
                              title="Expand notes & inventory details"
                            >
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${selectedAuditJob === job.id ? 'rotate-180 text-brand-400' : ''}`} />
                            </button>
                            <button
                              onClick={() => setActiveInvoiceJobId(job.id)}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-all border border-slate-800"
                              title="View Corporate Invoice Receipt"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {selectedAuditJob === job.id && (
                        <tr className="bg-slate-950/60 print:hidden shadow-inner">
                          <td colSpan="9" className="px-8 py-5 border-y border-slate-800/80">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                              {/* Inventory Section */}
                              <div className="space-y-2">
                                <h5 className="font-extrabold text-brand-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5" /> Items Inventory List
                                </h5>
                                <p className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-slate-300 font-medium">
                                  {job.items || "Standard inventory details."}
                                </p>
                              </div>
                              
                              {/* Notes Section */}
                              <div className="space-y-2">
                                <h5 className="font-extrabold text-indigo-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5" /> Dispatcher Notes & Invoicing Notes
                                </h5>
                                <p className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-slate-300 font-medium">
                                  {job.notes || "No dispatcher notes recorded."}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="border-t border-slate-800/60 bg-slate-950/80 p-3 flex justify-between items-center print:hidden">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-3">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedJobs.length)} of {sortedJobs.length} jobs
            </span>
            <div className="flex gap-1.5 pr-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1 px-2 text-xs font-extrabold text-white">
                {currentPage} <span className="text-slate-600">/</span> {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal Overlay */}
      {activeInvoiceJobId && (() => {
        const invJob = completedJobs.find(j => j.id === activeInvoiceJobId);
        if (!invJob) return null;

        const billings = invJob.revenue || invJob.estimateAmount || 0;
        const distanceMiles = (invJob.clientName.length * 7) % 45 + 15;
        const fuelCost = distanceMiles * fuelRate;
        const baseEstimate = billings - fuelCost;
        const isReconciled = reconciledJobIds.includes(invJob.id);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800/85 rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col p-6 space-y-6 relative">
              
              {isReconciled && (
                <div className="absolute top-8 right-8 border-4 border-emerald-500/20 text-emerald-500/30 text-4xl font-black uppercase tracking-widest px-4 py-2 rounded-xl -rotate-12 pointer-events-none select-none z-0">
                  RECONCILED
                </div>
              )}

              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-800/60 pb-4 relative z-10">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">MoveOps Logistics Inc.</h3>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">Corporate Invoicing & Receipt Ledger</p>
                </div>
                <button 
                  onClick={() => setActiveInvoiceJobId(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-4 text-[10px] leading-relaxed relative z-10">
                <div>
                  <span className="text-slate-500 block uppercase font-extrabold tracking-wider">Billed To</span>
                  <span className="text-white text-xs font-bold block mt-1">{invJob.clientName}</span>
                  <span className="text-slate-400 block mt-0.5">{invJob.email}</span>
                  <span className="text-slate-400 block">{invJob.phone}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block uppercase font-extrabold tracking-wider">Invoice Details</span>
                  <span className="text-white text-xs font-bold block mt-1">#INV-{invJob.id.toUpperCase()}</span>
                  <span className="text-slate-400 block mt-0.5">Date: {invJob.date}</span>
                  <span className={isReconciled ? "text-emerald-400 font-bold block" : "text-amber-400 font-bold block"}>
                    Status: {isReconciled ? 'Paid & Reconciled' : 'Paid & Audited'}
                  </span>
                </div>
              </div>

              {/* Route Details */}
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 text-[10px] space-y-1 relative z-10">
                <span className="text-slate-500 block uppercase font-extrabold tracking-wider">Transit Routing</span>
                <div className="text-slate-300 font-semibold mt-0.5">
                  {invJob.origin} ➜ {invJob.destination}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 relative z-10">
                <span className="text-[10px] text-slate-500 block uppercase font-extrabold tracking-wider">Billing Breakdown</span>
                <div className="divide-y divide-slate-800/50 text-[11px] font-semibold">
                  <div className="flex justify-between py-2.5">
                    <span className="text-slate-400">Base Moving Package (Crew & Truck Allocation)</span>
                    <span className="text-white">{formatCurrency(baseEstimate)}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-slate-400">Fuel Surcharge ({distanceMiles} miles @ ${fuelRate.toFixed(2)}/mi)</span>
                    <span className="text-white">{formatCurrency(fuelCost)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 text-xs font-black border-t border-slate-800 pt-3">
                    <span className="text-brand-400 uppercase tracking-wider">Grand Total (Paid)</span>
                    <span className="text-brand-400">{formatCurrency(billings)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-800/60 pt-4 relative z-10">
                <button
                  onClick={() => setActiveInvoiceJobId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  disabled={isSendingInvoice}
                  onClick={() => {
                    setIsSendingInvoice(true);
                    setTimeout(() => {
                      setIsSendingInvoice(false);
                      addToast('success', 'Invoice Sent', `Invoice securely dispatched to ${invJob.clientName} via SMS & Email.`);
                      setActiveInvoiceJobId(null);
                    }, 1000);
                  }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow shadow-brand-600/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingInvoice ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                  {isSendingInvoice ? 'Sending...' : 'Send via SMS/Email'}
                </button>
                <button
                  onClick={() => {
                    addToast('success', 'Download Complete', `Invoice PDF INV-${invJob.id.toUpperCase()} generated and downloaded.`);
                    setActiveInvoiceJobId(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow shadow-emerald-600/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}

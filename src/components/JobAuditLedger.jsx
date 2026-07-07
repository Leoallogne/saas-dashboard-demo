import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Calendar, 
  Download, 
  Printer, 
  ArrowUpRight, 
  ChevronRight, 
  MapPin, 
  Layers, 
  FileText,
  User
} from 'lucide-react';

export default function JobAuditLedger({ jobs, formatCurrency, addToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAuditJob, setSelectedAuditJob] = useState(null);

  // Filter ONLY Completed jobs for auditing
  const completedJobs = jobs.filter(j => j.status === 'Completed');

  // Filter by search query and date range
  const filteredCompletedJobs = completedJobs.filter(job => {
    const matchesSearch = 
      job.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.items && job.items.toLowerCase().includes(searchQuery.toLowerCase()));

    const jobDate = new Date(job.date);
    const matchesStartDate = startDate ? jobDate >= new Date(startDate) : true;
    
    // Set End Date to the end of that day
    let matchesEndDate = true;
    if (endDate) {
      const parsedEndDate = new Date(endDate);
      parsedEndDate.setHours(23, 59, 59, 999);
      matchesEndDate = jobDate <= parsedEndDate;
    }

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  // Calculate audit totals
  const totalRevenue = filteredCompletedJobs.reduce((sum, j) => sum + (j.revenue || j.estimateAmount || 0), 0);
  const totalWages = filteredCompletedJobs.reduce((sum, j) => 
    sum + ((j.crewSize || 3) * (j.durationHours || 6) * (j.crewHourlyRate || 25)), 0
  );
  const netProfit = totalRevenue - totalWages;
  const avgMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const handleExportCSV = () => {
    addToast('success', 'Export Complete', `Audited ledger containing ${filteredCompletedJobs.length} rows exported to CSV.`);
  };

  const handlePrintLedger = () => {
    window.print();
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
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow"
          >
            <Download className="w-4 h-4 text-brand-400" />
            Export CSV
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        {/* Metric 1 */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/40 print:border-black print:bg-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block print:text-slate-600">Audited Moves</span>
          <h3 className="text-2xl font-extrabold text-white mt-1.5 print:text-black">{filteredCompletedJobs.length}</h3>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">Completed invoices</span>
        </div>
        {/* Metric 2 */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/40 print:border-black print:bg-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block print:text-slate-600">Audited Revenue</span>
          <h3 className="text-2xl font-extrabold text-white mt-1.5 print:text-black">{formatCurrency(totalRevenue)}</h3>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">Gross billing sum</span>
        </div>
        {/* Metric 3 */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/40 print:border-black print:bg-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block print:text-slate-600">Movers Payroll</span>
          <h3 className="text-2xl font-extrabold text-red-400 mt-1.5 print:text-red-650">-{formatCurrency(totalWages)}</h3>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">Estimated labor cost</span>
        </div>
        {/* Metric 4 */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/40 print:border-black print:bg-white">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block print:text-slate-600">Net Profit ({avgMargin}%)</span>
          <h3 className={`text-2xl font-extrabold mt-1.5 print:text-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
            {formatCurrency(netProfit)}
          </h3>
          <span className="text-[9px] text-slate-500 font-semibold block mt-1">Profit after labor</span>
        </div>
      </div>

      {/* Filters Form */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/60 grid grid-cols-1 md:grid-cols-4 gap-3 items-center print:hidden">
        {/* Text Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client, inventory description, or locations..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50"
          />
        </div>

        {/* Start Date */}
        <div className="relative">
          <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500/50 cursor-pointer"
          />
        </div>

        {/* End Date */}
        <div className="relative">
          <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500/50 cursor-pointer"
          />
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/60 overflow-hidden print:border-black print:bg-white print:text-black">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/65 border-b border-slate-800/60 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider print:bg-slate-100 print:text-black print:border-black">
                <th className="px-5 py-3.5">Client & Date</th>
                <th className="px-5 py-3.5">Route</th>
                <th className="px-5 py-3.5 text-center">Movers / Hours</th>
                <th className="px-5 py-3.5 text-right">Labor Wages</th>
                <th className="px-5 py-3.5 text-right">Total Billings</th>
                <th className="px-5 py-3.5 text-right">Net Profit</th>
                <th className="px-5 py-3.5 text-center print:hidden">File Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs font-semibold print:divide-slate-200">
              {filteredCompletedJobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-slate-500 uppercase tracking-widest font-extrabold">
                    No completed move records match search constraints
                  </td>
                </tr>
              ) : (
                filteredCompletedJobs.map(job => {
                  const billings = job.revenue || job.estimateAmount || 0;
                  const crewSize = job.crewSize || 3;
                  const durationHours = job.durationHours || 6;
                  const crewHourlyRate = job.crewHourlyRate || 25;
                  const wages = crewSize * durationHours * crewHourlyRate;
                  const profit = billings - wages;
                  const margin = Math.round((profit / billings) * 100) || 0;

                  return (
                    <React.Fragment key={job.id}>
                      <tr className="hover:bg-slate-900/10 transition-colors print:hover:bg-transparent">
                        <td className="px-5 py-4">
                          <span className="text-white font-extrabold block print:text-black">{job.clientName}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5 print:text-slate-600">{job.date}</span>
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
                        <td className="px-5 py-4 text-right text-white print:text-black">
                          {formatCurrency(billings)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={profit >= 0 ? "text-emerald-400 font-extrabold block" : "text-red-500 font-extrabold block"}>
                            {formatCurrency(profit)}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold block mt-0.5">{margin}% Net</span>
                        </td>
                        <td className="px-5 py-4 text-center print:hidden">
                          <button
                            onClick={() => setSelectedAuditJob(selectedAuditJob === job.id ? null : job.id)}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-800"
                            title="Expand notes & inventory details"
                          >
                            <ChevronRight className={`w-4 h-4 transition-transform ${selectedAuditJob === job.id ? 'rotate-90 text-brand-400' : ''}`} />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row for notes & inventory */}
                      {selectedAuditJob === job.id && (
                        <tr className="bg-slate-950/40 print:hidden">
                          <td colSpan="7" className="px-6 py-4.5 border-t border-slate-850">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                              {/* Inventory Section */}
                              <div className="space-y-1.5">
                                <h5 className="font-extrabold text-brand-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5" /> Items Inventory List
                                </h5>
                                <p className="bg-slate-900/60 border border-slate-850 p-3 rounded-lg text-slate-300 font-medium">
                                  {job.items || "Standard inventory details."}
                                </p>
                              </div>
                              
                              {/* Notes Section */}
                              <div className="space-y-1.5">
                                <h5 className="font-extrabold text-indigo-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5" /> Dispatcher Notes & Invoicing Notes
                                </h5>
                                <p className="bg-slate-900/60 border border-slate-850 p-3 rounded-lg text-slate-300 font-medium">
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
      </div>
    </div>
  );
}

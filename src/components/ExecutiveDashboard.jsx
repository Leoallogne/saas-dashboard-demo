import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Truck,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { activityLogs, weeklyRevenueData } from '../data/mockData';

export default function ExecutiveDashboard({ jobs, trucks, companyName, setActiveTab, formatCurrency }) {
  // 1. Calculate dynamic statistics
  const completedJobs = jobs.filter(j => j.status === 'Completed');
  const scheduledJobs = jobs.filter(j => j.status === 'Scheduled');
  
  // Total Revenue: sum of Completed + Scheduled revenue
  const totalRevenue = jobs
    .filter(j => j.status === 'Completed' || j.status === 'Scheduled')
    .reduce((sum, j) => sum + (j.revenue || j.estimateAmount || 0), 0);

  const activeJobsCount = scheduledJobs.length;
  
  const pendingEstimatesCount = jobs.filter(j => j.status === 'Estimate Sent' || j.status === 'New Inquiry').length;

  // Truck utilization: percentage of assigned/busy trucks
  const busyTrucksCount = trucks.filter(t => t.status === 'Busy').length;
  const totalTrucksCount = trucks.length;
  const truckUtilization = Math.round((busyTrucksCount / totalTrucksCount) * 100);

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Overview for {companyName}
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Real-time financial and operational health monitor.
          </p>
        </div>
        <div className="px-4 py-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold rounded-lg">
          Live Dispatch Feed Sync: Active
        </div>
      </div>

      {/* Metrics Cards Grid - Now Interactive Click redirects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue -> Redirects to Kanban Pipeline */}
        <div 
          onClick={() => setActiveTab('pipeline')}
          className="glass-panel-interactive p-5 rounded-2xl relative overflow-hidden group cursor-pointer border hover:border-emerald-500/30"
          title="Click to view all jobs in pipeline"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl -mr-5 -mt-5 group-hover:bg-brand-500/20 transition-all duration-300" />
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-400 transition-colors">
              <DollarSign className="w-4.5 h-4.5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
              {formatCurrency(totalRevenue)}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +14.2%
                </span>
                <span className="text-slate-500">vs last month</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Active Jobs -> Redirects to Pipeline */}
        <div 
          onClick={() => setActiveTab('pipeline')}
          className="glass-panel-interactive p-5 rounded-2xl relative overflow-hidden group cursor-pointer border hover:border-brand-500/30"
          title="Click to view scheduled job boards"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl -mr-5 -mt-5 group-hover:bg-brand-500/20 transition-all duration-300" />
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Jobs</span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/20 group-hover:border-brand-400 transition-colors">
              <TrendingUp className="w-4.5 h-4.5 text-brand-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-brand-400 transition-colors">
              {activeJobsCount}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-brand-400 font-semibold">{scheduledJobs.length} scheduled</span>
                <span className="text-slate-500">active</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Pending Estimates -> Redirects to Pipeline */}
        <div 
          onClick={() => setActiveTab('pipeline')}
          className="glass-panel-interactive p-5 rounded-2xl relative overflow-hidden group cursor-pointer border hover:border-amber-500/30"
          title="Click to view pending estimates"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl -mr-5 -mt-5 group-hover:bg-brand-500/20 transition-all duration-300" />
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Estimates</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:border-amber-400 transition-colors">
              <Clock className="w-4.5 h-4.5 text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-amber-400 transition-colors">
              {pendingEstimatesCount}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-amber-400 font-semibold">{pendingEstimatesCount} estimates/inquiries</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Truck Utilization -> Redirects to Fleet Scheduler */}
        <div 
          onClick={() => setActiveTab('scheduler')}
          className="glass-panel-interactive p-5 rounded-2xl relative overflow-hidden group cursor-pointer border hover:border-indigo-500/30"
          title="Click to view fleet dispatch scheduling grid"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl -mr-5 -mt-5 group-hover:bg-brand-500/20 transition-all duration-300" />
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Fleet Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-400 transition-colors">
              <Truck className="w-4.5 h-4.5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                {truckUtilization}%
              </h3>
              <span className="text-slate-400 text-xs font-medium">({busyTrucksCount}/{totalTrucksCount} Trucks)</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-3.5 w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-800/40">
              <div 
                className="bg-gradient-to-r from-brand-500 to-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${truckUtilization}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Logs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart (Recharts) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-base font-bold text-white">Revenue Performance</h4>
              <p className="text-xs text-slate-400">Weekly sales & completed move billings</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/60">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
              <span className="font-semibold">Weekly Inflow</span>
            </div>
          </div>
          
          <div className="h-60 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyRevenueData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(148, 163, 184, 0.4)" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="rgba(148, 163, 184, 0.4)" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(2, 132, 199, 0.3)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'Outfit, sans-serif'
                  }}
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0284c7" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Logs panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full space-y-4">
          <div>
            <h4 className="text-base font-bold text-white">Live Updates</h4>
            <p className="text-xs text-slate-400">Chronological dispatcher actions</p>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1 max-h-[250px]">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:border-brand-500/30 group-hover:text-brand-400 transition-colors">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                    {log.message}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1 block">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Truck,
  ArrowUpRight,
  ChevronRight,
  User,
  Calculator,
  MapPin,
  Box,
  CheckCircle,
  FileText
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
export default function ExecutiveDashboard({ 
  jobs, 
  trucks, 
  companyName, 
  setActiveTab, 
  formatCurrency, 
  hourlyRate, 
  fuelRate,
  activityLogs,
  onStartJobFromQuote
}) {
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue', 'fuel', 'profit'
  
  // Quick Quote Generator State
  const [quoteRooms, setQuoteRooms] = useState('1');
  const [quoteDistance, setQuoteDistance] = useState('');
  const [quotePacking, setQuotePacking] = useState(false);

  // 1. Calculate dynamic statistics
  const completedJobs = jobs.filter(j => j.status === 'Completed');
  const scheduledJobs = jobs.filter(j => j.status === 'Scheduled');
  
  // Total Revenue: sum of Completed + Scheduled revenue
  const totalRevenue = jobs
    .filter(j => j.status === 'Completed' || j.status === 'Scheduled')
    .reduce((sum, j) => sum + (j.revenue || j.estimateAmount || 0), 0);

  // Average Job Value (AJV)
  const avgJobValue = completedJobs.length > 0 
    ? Math.round(completedJobs.reduce((sum, j) => sum + (j.revenue || j.estimateAmount || 0), 0) / completedJobs.length)
    : 0;

  // Pending Invoices (Unpaid/Running jobs)
  const pendingInvoices = scheduledJobs.reduce((sum, j) => sum + (j.estimateAmount || 0), 0);

  // 2. Calculate operational profitability
  const totalWages = jobs
    .filter(j => j.status === 'Completed' || j.status === 'Scheduled')
    .reduce((sum, j) => sum + ((j.crewSize || 3) * (j.durationHours || 6) * (j.crewHourlyRate || hourlyRate)), 0);

  // Fuel Expenses calculated dynamically using fuelRate
  const totalFuel = Math.round(
    jobs
      .filter(j => j.status === 'Completed' || j.status === 'Scheduled')
      .reduce((sum, j) => {
        const dist = (j.clientName.length * 7) % 45 + 15;
        return sum + (dist * fuelRate);
      }, 0)
  );

  const netProfit = totalRevenue - totalWages - totalFuel;
  const avgMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // 3. Dynamic Weekly Performance Data based on active branch statistics
  const chartData = [
    { name: 'Week 1', revenue: Math.round(totalRevenue * 0.15), fuel: Math.round(totalFuel * 0.15), profit: Math.round(netProfit * 0.15) },
    { name: 'Week 2', revenue: Math.round(totalRevenue * 0.25), fuel: Math.round(totalFuel * 0.25), profit: Math.round(netProfit * 0.25) },
    { name: 'Week 3', revenue: Math.round(totalRevenue * 0.20), fuel: Math.round(totalFuel * 0.20), profit: Math.round(netProfit * 0.20) },
    { name: 'Week 4', revenue: Math.round(totalRevenue * 0.40), fuel: Math.round(totalFuel * 0.40), profit: Math.round(netProfit * 0.40) }
  ];

  const metricConfigs = {
    revenue: { color: '#0284c7', label: 'Gross Revenue' },
    fuel: { color: '#f59e0b', label: 'Fuel & Fleet Exp.' },
    profit: { color: '#34d399', label: 'Net Profit' }
  };
  const activeConfig = metricConfigs[chartMetric];

  const busyTrucksCount = trucks.filter(t => t.status === 'Busy').length;
  const totalTrucksCount = trucks.length;
  const truckUtilization = Math.round((busyTrucksCount / totalTrucksCount) * 100);

  // Quick Quote Calculation Logic
  const calculateQuote = () => {
    const baseRate = parseInt(quoteRooms) * 350;
    const distanceCost = (parseInt(quoteDistance) || 0) * fuelRate;
    const packingCost = quotePacking ? (parseInt(quoteRooms) * 150) : 0;
    return baseRate + distanceCost + packingCost;
  };
  const estimatedQuote = calculateQuote();

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Overview for {companyName}
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Logistics financial health & active dispatch monitor.
          </p>
        </div>
        <div className="px-4 py-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold rounded-lg">
          Live Dispatch Feed Sync: Active
        </div>
      </div>

      {/* Logistics Specific Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
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

        {/* Average Job Value */}
        <div 
          onClick={() => setActiveTab('audit')}
          className="glass-panel-interactive p-5 rounded-2xl relative overflow-hidden group cursor-pointer border hover:border-sky-500/30"
          title="Click to view completed audits"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl -mr-5 -mt-5 group-hover:bg-sky-500/20 transition-all duration-300" />
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Job Value</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20 group-hover:border-sky-400 transition-colors">
              <TrendingUp className="w-4.5 h-4.5 text-sky-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-sky-400 transition-colors">
              {formatCurrency(avgJobValue)}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-sky-400 font-semibold">Per completed move</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Pending Invoices */}
        <div 
          onClick={() => setActiveTab('pipeline')}
          className="glass-panel-interactive p-5 rounded-2xl relative overflow-hidden group cursor-pointer border hover:border-amber-500/30"
          title="Click to view scheduled jobs"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-5 -mt-5 group-hover:bg-amber-500/20 transition-all duration-300" />
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Invoices</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:border-amber-400 transition-colors">
              <FileText className="w-4.5 h-4.5 text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-amber-400 transition-colors">
              {formatCurrency(pendingInvoices)}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-amber-400 font-semibold">{scheduledJobs.length} scheduled</span>
                <span className="text-slate-500">awaiting collection</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div 
          onClick={() => setActiveTab('pipeline')}
          className="glass-panel-interactive p-5 rounded-2xl relative overflow-hidden group cursor-pointer border hover:border-indigo-500/30"
          title="Click to view all jobs profitability"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-5 -mt-5 group-hover:bg-indigo-500/20 transition-all duration-300" />
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Net Profit (Est.)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-400 transition-colors">
              <DollarSign className="w-4.5 h-4.5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
              {formatCurrency(netProfit)}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-indigo-400 font-semibold">{avgMargin}% margin</span>
                <span className="text-slate-500">after fuel & wages</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts & Quick Quote Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Logistics Chart (Recharts) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h4 className="text-base font-bold text-white">Financial Analytics</h4>
              <p className="text-xs text-slate-400">Weekly revenue vs operational fuel expenses</p>
            </div>
            
            {/* Chart Metric Selector Buttons */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
              {[
                { id: 'revenue', label: 'Revenue' },
                { id: 'fuel', label: 'Fuel Exp.' },
                { id: 'profit', label: 'Net Profit' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setChartMetric(m.id)}
                  className={`px-3 py-1.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    chartMetric === m.id
                      ? 'bg-slate-900 text-white shadow border border-slate-800'
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0.0}/>
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
                    border: `1px solid ${activeConfig.color}44`,
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'Outfit, sans-serif'
                  }}
                  formatter={(val) => [`$${val.toLocaleString()}`, activeConfig.label]}
                />
                <Area 
                  type="monotone" 
                  dataKey={chartMetric} 
                  stroke={activeConfig.color} 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorMetric)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Quote Generator */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-sky-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-bl-full pointer-events-none" />
          
          <div className="mb-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-sky-400" />
              Instant Quote
            </h4>
            <p className="text-xs text-slate-400">Generate pricing over the phone</p>
          </div>

          <div className="space-y-4 flex-1">
            {/* Rooms Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-3 h-3" /> Property Size
              </label>
              <select 
                value={quoteRooms}
                onChange={(e) => setQuoteRooms(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500/50 appearance-none cursor-pointer"
              >
                <option value="1">1 Bedroom ($350 Base)</option>
                <option value="2">2 Bedrooms ($700 Base)</option>
                <option value="3">3 Bedrooms ($1,050 Base)</option>
                <option value="4">4+ Bedrooms ($1,400 Base)</option>
              </select>
            </div>

            {/* Distance Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Transit Distance (Miles)
              </label>
              <input 
                type="number" 
                placeholder="e.g., 45"
                value={quoteDistance}
                onChange={(e) => setQuoteDistance(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
              />
            </div>

            {/* Packing Service Toggle */}
            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 cursor-pointer hover:bg-slate-900 transition-colors" onClick={() => setQuotePacking(!quotePacking)}>
              <span className="text-xs font-semibold text-slate-300">Add Full Packing Service</span>
              <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${quotePacking ? 'bg-sky-500 border-sky-500 text-white' : 'bg-slate-950 border-slate-700 text-transparent'}`}>
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Quote Result */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block text-center mb-1">
              Estimated Total Price
            </span>
            <div className="text-3xl font-black text-sky-400 text-center animate-fade-in transition-all">
              {formatCurrency(estimatedQuote)}
            </div>
            <button 
              onClick={() => onStartJobFromQuote && onStartJobFromQuote({ estimateAmount: estimatedQuote, items: `${quoteRooms} Bedroom House` })}
              className="w-full mt-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md"
            >
              + Create Job From Quote
            </button>
          </div>
        </div>

      </div>

      {/* Detailed Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Fleet Panel */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-400" />
                Fleet Dispatch Ledger
              </h4>
              <p className="text-xs text-slate-400">Live operational status of trucks</p>
            </div>
            <div className="text-right w-32 space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-500">({busyTrucksCount}/{totalTrucksCount} Active)</span>
                <span className="text-brand-400">{truckUtilization}% Utilized</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                <div 
                  className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${truckUtilization}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-slate-800/40 space-y-3">
            {trucks.map(truck => {
              // Find if this truck has jobs today (2026-07-07)
              const todayJobs = jobs.filter(j => j.truckId === truck.id && j.date === '2026-07-07');
              const isMaintenance = truck.maintenanceDates?.includes('2026-07-07');
              
              let statusBadge = (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AVAILABLE
                </span>
              );
              let detailText = "No active moves today";
              
              if (isMaintenance) {
                statusBadge = (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    SERVICE / LOCK
                  </span>
                );
                detailText = "Routine maintenance lock active";
              } else if (todayJobs.length > 0) {
                statusBadge = (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    ON ROUTE
                  </span>
                );
                detailText = `Moving: ${todayJobs.map(j => j.clientName).join(', ')} (To: ${todayJobs[0]?.destination.split(',')[0]})`;
              }

              return (
                <div key={truck.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs font-semibold">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-extrabold truncate">{truck.name}</span>
                      <span className="text-slate-500 text-[10px]">({truck.licensePlate})</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                      <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      Driver: <span className="text-slate-300 font-bold">{truck.driverName}</span> — <span className="text-slate-400 font-medium">{detailText}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {statusBadge}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Logs panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Live Operations Feed
            </h4>
            <p className="text-xs text-slate-400">Chronological dispatcher actions</p>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1 max-h-[300px]">
            {activityLogs && activityLogs.map((log) => (
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

import React from 'react';
import { 
  X, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail, 
  Layers, 
  Truck, 
  ArrowRight,
  User,
  CheckCircle,
  Clock,
  Briefcase
} from 'lucide-react';

export default function JobDetailsModal({ 
  job, 
  onClose, 
  onUpdateJobStatus, 
  onAssignTruck, 
  trucks 
}) {
  if (!job) return null;

  const currentPrice = job.revenue || job.estimateAmount || 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New Inquiry':
        return 'bg-slate-800 text-slate-300 border-slate-700/50';
      case 'Estimate Sent':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Scheduled':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700/50';
    }
  };

  const nextStatusMap = {
    'New Inquiry': { label: 'Send Estimate', next: 'Estimate Sent' },
    'Estimate Sent': { label: 'Schedule Job', next: 'Scheduled' },
    'Scheduled': { label: 'Complete Job', next: 'Completed' }
  };

  const nextAction = nextStatusMap[job.status];

  // Helper to get truck display name
  const getAssignedTruckName = () => {
    if (!job.truckId) return 'No truck assigned';
    const tr = trucks.find(t => t.id === job.truckId);
    return tr ? `${tr.name} (${tr.driverName})` : job.truckId;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/60 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Job Details</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(job.status)}`}>
              {job.status}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Main Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">{job.clientName}</h3>
              <p className="text-slate-400 text-xs mt-1">ID: #{job.id.toUpperCase()}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{job.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{job.email}</span>
                </div>
              </div>
            </div>

            {/* Price & Date summary */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-3 flex flex-col justify-center">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-medium">Estimated Pricing</span>
                <span className="text-xl font-black text-brand-400">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(currentPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-medium">Scheduled Date</span>
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {job.date}
                </span>
              </div>
            </div>
          </div>

          {/* Route Section */}
          <div className="space-y-3 bg-slate-950/20 p-4 rounded-xl border border-slate-800/40">
            <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Move Route</h4>
            <div className="flex flex-col md:flex-row md:items-center gap-4 text-xs font-medium">
              <div className="flex items-start gap-2.5 flex-1">
                <MapPin className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Origin</p>
                  <p className="text-slate-200 mt-0.5">{job.origin}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block" />
              <div className="flex items-start gap-2.5 flex-1">
                <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Destination</p>
                  <p className="text-slate-200 mt-0.5">{job.destination}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Items Inventory
              </h4>
              <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-800/50 min-h-[70px] text-xs text-slate-300 font-medium leading-relaxed">
                {job.items || 'No items logged.'}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Dispatcher Notes
              </h4>
              <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-800/50 min-h-[70px] text-xs text-slate-300 italic leading-relaxed">
                {job.notes || 'No notes available.'}
              </div>
            </div>
          </div>

          {/* Fleet Operations / Truck Assignment */}
          <div className="space-y-3 border-t border-slate-800/50 pt-5">
            <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-slate-400" /> Fleet Assignment
            </h4>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800/60">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Assigned Vehicle</span>
                <p className="text-xs font-semibold text-slate-200">
                  {getAssignedTruckName()}
                </p>
              </div>

              {/* Truck Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium">Change Truck:</label>
                <select
                  value={job.truckId || ''}
                  onChange={(e) => onAssignTruck(job.id, e.target.value || null)}
                  className="bg-slate-950 text-xs text-white border border-slate-800 hover:border-brand-500/50 px-2.5 py-1.5 rounded-lg focus:outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="">-- Unassigned --</option>
                  {trucks.map(truck => (
                    <option key={truck.id} value={truck.id}>
                      {truck.name.split(' ')[0] + ' ' + truck.name.split(' ')[1]} ({truck.driverName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800/60 flex flex-wrap justify-between items-center gap-3">
          
          {/* Quick status change dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Override:</span>
            <select
              value={job.status}
              onChange={(e) => onUpdateJobStatus(job.id, e.target.value)}
              className="bg-slate-950 text-xs text-slate-300 border border-slate-850 px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="New Inquiry">New Inquiry</option>
              <option value="Estimate Sent">Estimate Sent</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            
            {/* Direct Flow Promotion Action */}
            {nextAction && (
              <button
                onClick={() => {
                  onUpdateJobStatus(job.id, nextAction.next);
                  // Auto-close on complete or if moving stages
                  onClose();
                }}
                className="px-4.5 py-2 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/10 flex items-center gap-1.5"
              >
                {nextAction.label === 'Schedule Job' ? <Calendar className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                {nextAction.label}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

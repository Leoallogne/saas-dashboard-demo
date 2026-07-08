import React, { useState, useEffect } from 'react';
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
  Briefcase,
  AlertTriangle,
  Check,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { useJsApiLoader, GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

export default function JobDetailsModal({ 
  job, 
  onClose, 
  onUpdateJobStatus, 
  onAssignTruck, 
  trucks,
  formatCurrency,
  onUpdateJobProfitability,
  fuelRate
}) {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [travelMode, setTravelMode] = useState('DRIVING'); // DRIVING, WALKING, BICYCLING, TRANSIT
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSy_DEV_KEY_PLACEHOLDER_999',
    libraries: ['places']
  });

  useEffect(() => {
    if (isLoaded && job?.origin && job?.destination && window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: job.origin,
          destination: job.destination,
          travelMode: window.google.maps.TravelMode[travelMode],
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirectionsResponse(result);
            if (result.routes[0]?.legs[0]) {
              setDistance(result.routes[0].legs[0].distance.text);
              setDuration(result.routes[0].legs[0].duration.text);
            }
          } else {
            console.error(`Directions request failed due to ${status}`);
          }
        }
      );
    }
  }, [isLoaded, job?.origin, job?.destination, travelMode]);

  if (!job) return null;

  const currentPrice = job.revenue || job.estimateAmount || 0;
  
  // Calculate deterministic distance and surcharge variables
  const nameLength = job.clientName.length;
  const distanceMilesFallback = (nameLength * 7) % 45 + 15; // deterministic miles (15 - 60 mi)
  const distanceMiles = distance ? parseFloat(distance.replace(/[^\d.-]/g, '')) : distanceMilesFallback;
  const displayDistance = distance || `${distanceMilesFallback} mi`;
  const fuelCost = distanceMiles * fuelRate;
  const travelTimeMinutes = distanceMiles * 1.5;
  const hoursPart = Math.floor(travelTimeMinutes / 60);
  const minsPart = Math.round(travelTimeMinutes % 60);
  const timeLabel = duration || (hoursPart > 0 ? `${hoursPart}h ${minsPart}m` : `${minsPart}m`);

  const assignedCrew = job.crewMembers || [];

  const handleToggleCrew = (crewName) => {
    const updatedCrew = assignedCrew.includes(crewName)
      ? assignedCrew.filter(c => c !== crewName)
      : [...assignedCrew, crewName];
    
    onUpdateJobProfitability(job.id, { crewMembers: updatedCrew });
  };

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
                  {formatCurrency(currentPrice)}
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
            <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Move Route & Logistics</h4>
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

            {/* Travel Mode Selector & External Link */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {['DRIVING', 'TRANSIT', 'BICYCLING', 'WALKING'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setTravelMode(mode)}
                    className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide transition-all ${
                      travelMode === mode
                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(job.origin)}&destination=${encodeURIComponent(job.destination)}&travelmode=${travelMode.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-lg font-semibold transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka di Google Maps
              </a>
            </div>

            {/* Google Map Section */}
            <div className="h-64 w-full bg-slate-950/90 rounded-xl border border-slate-850 relative overflow-hidden mt-3 shadow-inner">
              {!isLoaded ? (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-semibold gap-2 animate-pulse">
                  <Navigation className="w-4 h-4" /> Memuat Peta...
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={{ lat: 30.2672, lng: -97.7431 }} // Austin TX dummy default
                  zoom={10}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    styles: [
                      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                      { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
                      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
                      { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] }
                    ]
                  }}
                >
                  {directionsResponse && (
                    <DirectionsRenderer 
                      directions={directionsResponse}
                      options={{
                        polylineOptions: {
                          strokeColor: '#0ea5e9',
                          strokeOpacity: 0.8,
                          strokeWeight: 4
                        }
                      }}
                    />
                  )}
                </GoogleMap>
              )}
              
              {/* Floating Info Overlay card */}
              <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 border border-slate-850 p-2.5 rounded-lg flex items-center gap-3 text-[9px] font-bold text-slate-350 shadow-xl backdrop-blur-md z-10 pointer-events-none">
                <div className="space-y-0.5">
                  <span className="text-slate-500 block uppercase text-[6.5px] tracking-wider font-extrabold">Distance</span>
                  <span className="text-white font-black">{displayDistance}</span>
                </div>
                <div className="h-6 w-px bg-slate-850" />
                <div className="space-y-0.5">
                  <span className="text-slate-500 block uppercase text-[6.5px] tracking-wider font-extrabold">Est. Time</span>
                  <span className="text-white font-black">{timeLabel}</span>
                </div>
                <div className="h-6 w-px bg-slate-850" />
                <div className="space-y-0.5">
                  <span className="text-slate-500 block uppercase text-[6.5px] tracking-wider font-extrabold">Fuel Cost</span>
                  <span className="text-brand-400 font-black">{formatCurrency(fuelCost)}</span>
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

            {/* Crew Member Checklist */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800/60 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Movers Crew Roster Assignment</span>
                <span className="text-[9px] text-slate-400 font-bold">
                  {assignedCrew.length} / {job.crewSize || 3} assigned
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Marcus Vance (Chief)', 'Carlos Santini', 'David Miller', 'Tyler Durden', 'John Wick', 'Steve Rogers'].map(crewName => {
                  const isAssigned = assignedCrew.includes(crewName);
                  return (
                    <button
                      key={crewName}
                      type="button"
                      onClick={() => handleToggleCrew(crewName)}
                      className={`px-2.5 py-1.5 rounded-lg border text-left text-[9.5px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                        isAssigned
                          ? 'bg-brand-500/15 border-brand-500/35 text-brand-400'
                          : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      <span className="truncate">{crewName}</span>
                      {isAssigned && <Check className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Job Profitability Calculator (Internal Only) */}
          <div className="space-y-4 border-t border-slate-800/50 pt-5">
            <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Job Profitability Estimator (Internal)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 border border-slate-800/60 p-4 rounded-xl">
              {/* Crew Size */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Crew Size</label>
                <select
                  value={job.crewSize || 3}
                  onChange={(e) => onUpdateJobProfitability(job.id, { 
                    crewSize: Number(e.target.value),
                    durationHours: job.durationHours || 6,
                    crewHourlyRate: job.crewHourlyRate || 25
                  })}
                  className="w-full bg-slate-950 text-xs text-white border border-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none transition-all cursor-pointer font-medium"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} Movers</option>
                  ))}
                </select>
              </div>

              {/* Move Duration */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Est. Duration</label>
                <select
                  value={job.durationHours || 6}
                  onChange={(e) => onUpdateJobProfitability(job.id, { 
                    crewSize: job.crewSize || 3,
                    durationHours: Number(e.target.value),
                    crewHourlyRate: job.crewHourlyRate || 25
                  })}
                  className="w-full bg-slate-950 text-xs text-white border border-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none transition-all cursor-pointer font-medium"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                    <option key={h} value={h}>{h} Hours</option>
                  ))}
                </select>
              </div>

              {/* Crew Hourly Rate */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Crew Rate / Hr</label>
                <input
                  type="number"
                  value={job.crewHourlyRate || 25}
                  onChange={(e) => onUpdateJobProfitability(job.id, { 
                    crewSize: job.crewSize || 3,
                    durationHours: job.durationHours || 6,
                    crewHourlyRate: Number(e.target.value) || 0
                  })}
                  className="w-full bg-slate-950 text-xs text-white border border-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Calculations breakdown */}
            {(() => {
              const crewSize = job.crewSize || 3;
              const durationHours = job.durationHours || 6;
              const crewHourlyRate = job.crewHourlyRate || 25;
              const wageCost = crewSize * durationHours * crewHourlyRate;
              const netProfit = currentPrice - wageCost;
              const profitMargin = Math.round((netProfit / currentPrice) * 100) || 0;

              return (
                <div className="grid grid-cols-3 gap-3 text-center text-xs border border-slate-800/40 bg-slate-950/20 p-3 rounded-lg font-semibold">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 block uppercase">Est. Revenue</span>
                    <span className="text-white">{formatCurrency(currentPrice)}</span>
                  </div>
                  <div className="space-y-0.5 border-x border-slate-800/30">
                    <span className="text-[10px] text-slate-500 block uppercase">Crew Wages Cost</span>
                    <span className="text-red-450 text-red-400">-{formatCurrency(wageCost)}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 block uppercase">Net Profit ({profitMargin}%)</span>
                    <span className={netProfit >= 0 ? 'text-emerald-400' : 'text-red-500'}>
                      {formatCurrency(netProfit)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Live Dispatch Micro-Status */}
          {job.status === 'Scheduled' && (
            <div className="space-y-3 border-t border-slate-800/50 pt-5 mt-2 mb-2">
              <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-brand-400" /> Live Dispatch Operations
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Pending', 'Dispatched', 'Arrived', 'Loaded'].map(ms => (
                  <button 
                    key={ms}
                    onClick={() => onUpdateJobProfitability(job.id, { microStatus: ms })}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-all ${
                      (job.microStatus || 'Pending') === ms 
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-amber-500/50 hover:text-amber-400'
                    }`}
                  >
                    {ms}
                  </button>
                ))}
              </div>
            </div>
          )}

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

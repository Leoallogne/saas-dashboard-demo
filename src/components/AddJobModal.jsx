import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Calendar, DollarSign, MapPin, Layers, Phone, Mail, FileText, Navigation, Map, Search } from 'lucide-react';
import { useJsApiLoader, Autocomplete, GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api';

export default function AddJobModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    email: '',
    origin: '',
    destination: '',
    estimateAmount: '',
    items: '',
    notes: '',
    date: new Date().toISOString().split('T')[0] // default to today
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSy_DEV_KEY_PLACEHOLDER_999',
    libraries: ['places']
  });

  const [originAutocomplete, setOriginAutocomplete] = useState(null);
  const [destAutocomplete, setDestAutocomplete] = useState(null);
  const [mapSearchAutocomplete, setMapSearchAutocomplete] = useState(null);
  
  // Dual-pane map state
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [mapClickTarget, setMapClickTarget] = useState('origin'); // 'origin' | 'destination'
  const [mapCenter, setMapCenter] = useState({ lat: 30.2672, lng: -97.7431 });
  const [mapZoom, setMapZoom] = useState(11);
  const geocoderRef = useRef(null);

  const onOriginLoad = (autocomplete) => setOriginAutocomplete(autocomplete);
  const onDestLoad = (autocomplete) => setDestAutocomplete(autocomplete);
  const onMapSearchLoad = (autocomplete) => setMapSearchAutocomplete(autocomplete);

  const onOriginPlaceChanged = () => {
    if (originAutocomplete !== null) {
      const place = originAutocomplete.getPlace();
      const address = place.formatted_address || place.name;
      if (address) {
        setFormData(prev => ({ ...prev, origin: address }));
      }
      if (place.geometry?.location) {
        setMapCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        setMapZoom(15);
      }
    }
  };

  const onDestPlaceChanged = () => {
    if (destAutocomplete !== null) {
      const place = destAutocomplete.getPlace();
      const address = place.formatted_address || place.name;
      if (address) {
        setFormData(prev => ({ ...prev, destination: address }));
      }
      if (place.geometry?.location) {
        setMapCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        setMapZoom(15);
      }
    }
  };

  const onMapSearchPlaceChanged = () => {
    if (mapSearchAutocomplete !== null) {
      const place = mapSearchAutocomplete.getPlace();
      if (place.geometry?.location) {
        setMapCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        setMapZoom(16);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.origin || !formData.destination) return;

    const newJob = {
      id: `job-${Math.random().toString(36).substring(2, 9)}`,
      clientName: formData.clientName,
      phone: formData.phone || '(512) 555-0100',
      email: formData.email || 'client@email.com',
      status: 'New Inquiry',
      origin: formData.origin,
      destination: formData.destination,
      estimateAmount: Number(formData.estimateAmount) || 850,
      revenue: Number(formData.estimateAmount) || 850,
      truckId: null,
      date: formData.date,
      items: formData.items || 'Standard boxes & furniture',
      notes: formData.notes || 'Inquiry created from dispatch portal.'
    };

    onSubmit(newJob);
    onClose();
  };

  // Route calculation
  useEffect(() => {
    if (isLoaded && formData.origin && formData.destination && window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: formData.origin,
          destination: formData.destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirectionsResponse(result);
            if (result.routes[0]?.legs[0]) {
              setDistance(result.routes[0].legs[0].distance.text);
              setDuration(result.routes[0].legs[0].duration.text);
            }
          }
        }
      );
    } else {
      setDirectionsResponse(null);
      setDistance('');
      setDuration('');
    }
  }, [isLoaded, formData.origin, formData.destination]);

  // Handle map click
  const handleMapClick = (e) => {
    if (!window.google) return;
    
    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
    
    geocoderRef.current.geocode({ location: e.latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        setFormData(prev => ({ ...prev, [mapClickTarget]: address }));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/60 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center border border-brand-500/20">
              <Plus className="w-4 h-4 text-brand-400" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Create New Job Inquiry</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Pane Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[80vh] overflow-hidden">
          
          {/* LEFT PANE - Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto border-r border-slate-800/60">
            {/* Client Details */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Client Info</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold block">Full Name *</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Sandra Bullock"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold block">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(512) 555-0100"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="client@email.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold block">Target Date</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8.5 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500/50 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Route */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Move Parameters</h4>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold block">Estimate Pricing ($) *</label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="estimateAmount"
                    value={formData.estimateAmount}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 1250"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold block">Origin Address *</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={onOriginLoad}
                        onPlaceChanged={onOriginPlaceChanged}
                      >
                        <input
                          type="text"
                          name="origin"
                          value={formData.origin}
                          onChange={handleChange}
                          required
                          placeholder="Search / Paste Origin Address..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
                        />
                      </Autocomplete>
                    ) : (
                      <input
                        type="text"
                        name="origin"
                        value={formData.origin}
                        onChange={handleChange}
                        required
                        placeholder="Loading maps..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold block">Destination Address *</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={onDestLoad}
                        onPlaceChanged={onDestPlaceChanged}
                      >
                        <input
                          type="text"
                          name="destination"
                          value={formData.destination}
                          onChange={handleChange}
                          required
                          placeholder="Search / Paste Destination Address..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
                        />
                      </Autocomplete>
                    ) : (
                      <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        required
                        placeholder="Loading maps..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Inventory & Dispatch details</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold block flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Items Description
                </label>
                <textarea
                  name="items"
                  value={formData.items}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. 3 Bedroom House, sofa, boxes, upright piano..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold block flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Special Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Wrap grandfather clock, elevator bookings, heavy objects..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50 resize-none"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-800/60 pt-4 flex justify-end gap-2 mt-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/15"
              >
                Create Inquiry
              </button>
            </div>
          </form>

          {/* RIGHT PANE - Interactive Map */}
          <div className="bg-slate-900/40 relative flex flex-col h-[50vh] lg:h-auto min-h-[400px]">
            
            {/* Map Click Targeting Toggle */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-slate-950/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-brand-400 ml-1" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Click Map To Set:</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg">
                <button
                  onClick={(e) => { e.preventDefault(); setMapClickTarget('origin'); }}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                    mapClickTarget === 'origin' 
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' 
                      : 'text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  Origin
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); setMapClickTarget('destination'); }}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                    mapClickTarget === 'destination' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  Destination
                </button>
              </div>
            </div>

            {/* Floating Map Search Bar */}
            <div className="absolute top-16 left-4 right-4 z-10">
              {isLoaded && (
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <Autocomplete onLoad={onMapSearchLoad} onPlaceChanged={onMapSearchPlaceChanged}>
                    <input
                      type="text"
                      placeholder="Search / Paste address to fly map..."
                      className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-[11px] font-semibold text-white placeholder-slate-400 shadow-2xl backdrop-blur-md focus:outline-none focus:border-brand-500"
                    />
                  </Autocomplete>
                </div>
              )}
            </div>

            <div className="flex-1 w-full h-full relative">
              {!isLoaded ? (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-semibold gap-2 animate-pulse">
                  <Navigation className="w-4 h-4" /> Memuat Peta Interaktif...
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={mapZoom}
                  onClick={handleMapClick}
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
            </div>

            {/* Distance Overlay */}
            {distance && duration && (
              <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-2xl flex justify-between items-center backdrop-blur-md">
                <div className="space-y-0.5">
                  <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-extrabold">Total Distance</span>
                  <span className="text-white font-black text-sm">{distance}</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="space-y-0.5 text-right">
                  <span className="text-slate-500 block uppercase text-[9px] tracking-wider font-extrabold">Est. Drive Time</span>
                  <span className="text-brand-400 font-black text-sm">{duration}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

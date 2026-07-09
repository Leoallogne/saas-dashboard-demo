import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Calendar, DollarSign, MapPin, Layers, Phone, Mail, FileText, Navigation, Map, Search } from 'lucide-react';
import { useJsApiLoader, Autocomplete, GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

const GOOGLE_MAPS_LIBRARIES = ['places'];

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
    libraries: GOOGLE_MAPS_LIBRARIES
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
  const [activeMobileTab, setActiveMobileTab] = useState('form'); // 'form' | 'map'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const geocoderRef = useRef(null);

  const onOriginLoad = (autocomplete) => setOriginAutocomplete(autocomplete);
  const onDestLoad = (autocomplete) => setDestAutocomplete(autocomplete);
  const onMapSearchLoad = (autocomplete) => setMapSearchAutocomplete(autocomplete);

  const onOriginPlaceChanged = () => {
    if (originAutocomplete) {
      const place = originAutocomplete.getPlace();
      if (place && place.formatted_address) {
        setFormData(prev => ({ ...prev, origin: place.formatted_address }));
        if (place.geometry?.location) {
          setMapCenter({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
          setMapZoom(14);
        }
      }
    }
  };

  const onDestPlaceChanged = () => {
    if (destAutocomplete) {
      const place = destAutocomplete.getPlace();
      if (place && place.formatted_address) {
        setFormData(prev => ({ ...prev, destination: place.formatted_address }));
        if (place.geometry?.location) {
          setMapCenter({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
          setMapZoom(14);
        }
      }
    }
  };

  const onMapSearchPlaceChanged = () => {
    if (mapSearchAutocomplete) {
      const place = mapSearchAutocomplete.getPlace();
      if (place && place.geometry?.location) {
        const newCoord = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setMapCenter(newCoord);
        setMapZoom(15);

        // Auto-assign to current selected target (origin/destination)
        if (place.formatted_address) {
          if (mapClickTarget === 'origin') {
            setFormData(prev => ({ ...prev, origin: place.formatted_address }));
          } else {
            setFormData(prev => ({ ...prev, destination: place.formatted_address }));
          }
        }
      }
    }
  };

  // Google Maps directions service integration
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
          } else {
            console.error(`Directions request failed: ${status}`);
          }
        }
      );
    }
  }, [isLoaded, formData.origin, formData.destination]);

  // Geocoding on map click
  const handleMapClick = (e) => {
    if (!isLoaded || !window.google) return;
    
    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    const latLng = e.latLng;
    geocoderRef.current.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        if (mapClickTarget === 'origin') {
          setFormData(prev => ({ ...prev, origin: address }));
          setMapClickTarget('destination'); // toggle target automatically for convenience
        } else {
          setFormData(prev => ({ ...prev, destination: address }));
        }
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.origin || !formData.destination || !formData.estimateAmount) {
      return;
    }
    
    setIsSubmitting(true);
    // Simulate minor async lag for premium save feel
    setTimeout(() => {
      onSubmit({
        ...formData,
        id: `job-${Math.random().toString(36).substring(2, 9)}`,
        status: 'New Inquiry',
        estimateAmount: Number(formData.estimateAmount),
        revenue: Number(formData.estimateAmount), // default initial revenue to estimate
        truckId: null
      });
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800/85 rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-800/60 flex justify-between items-center bg-slate-950/20">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Create New Job Inquiry</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Enter moving parameters & route configurations</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Tab Headers */}
        <div className="flex border-b border-slate-800/60 bg-slate-950/20 lg:hidden text-xs">
          <button
            type="button"
            onClick={() => setActiveMobileTab('form')}
            className={`flex-1 py-3.5 text-center font-extrabold transition-all border-b-2 uppercase tracking-wider ${
              activeMobileTab === 'form'
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            Form Details
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('map')}
            className={`flex-1 py-3.5 text-center font-extrabold transition-all border-b-2 uppercase tracking-wider ${
              activeMobileTab === 'map'
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Interactive Route Map
          </button>
        </div>

        {/* Dual Pane Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-[60vh] lg:h-[72vh] overflow-hidden">
          
          {/* LEFT PANE - Form */}
          <form onSubmit={handleSubmit} className={`p-5 space-y-4 overflow-y-auto border-r border-slate-800/60 ${
            activeMobileTab === 'form' ? 'block' : 'hidden lg:block'
          }`}>
            
            {/* 1. Client Details Section */}
            <div className="space-y-3 bg-slate-950/20 p-4 rounded-xl border border-slate-850">
              <h4 className="text-[9.5px] uppercase font-black text-brand-400 tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Client Info
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] text-slate-400 font-bold block">Full Name *</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                    placeholder="Sandra Bullock"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500/50 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] text-slate-400 font-bold block">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-650 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(512) 555-0100"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500/50 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] text-slate-400 font-bold block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-650 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="client@email.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500/50 font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] text-slate-400 font-bold block">Target Move Date</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-650 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500/50 cursor-pointer font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Pricing & Route Section */}
            <div className="space-y-3 bg-slate-950/20 p-4 rounded-xl border border-slate-850">
              <h4 className="text-[9.5px] uppercase font-black text-indigo-400 tracking-wider flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" /> Pricing & Route Params
              </h4>

              <div className="space-y-1">
                <label className="text-[9.5px] text-slate-400 font-bold block">Estimate Pricing ($) *</label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-650 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="estimateAmount"
                    value={formData.estimateAmount}
                    onChange={handleChange}
                    required
                    placeholder="1250"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500/50 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] text-slate-400 font-bold block">Origin Address *</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-650 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
                    {isLoaded ? (
                      <Autocomplete onLoad={onOriginLoad} onPlaceChanged={onOriginPlaceChanged}>
                        <input
                          type="text"
                          name="origin"
                          value={formData.origin}
                          onChange={handleChange}
                          required
                          placeholder="Search Origin..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 font-medium"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500/50 font-medium"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] text-slate-400 font-bold block">Destination Address *</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-650 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" />
                    {isLoaded ? (
                      <Autocomplete onLoad={onDestLoad} onPlaceChanged={onDestPlaceChanged}>
                        <input
                          type="text"
                          name="destination"
                          value={formData.destination}
                          onChange={handleChange}
                          required
                          placeholder="Search Destination..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 font-medium"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500/50 font-medium"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Items & Notes Section */}
            <div className="space-y-3 bg-slate-950/20 p-4 rounded-xl border border-slate-850">
              <h4 className="text-[9.5px] uppercase font-black text-amber-400 tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Inventory & Logistics Details
              </h4>
              
              <div className="space-y-1">
                <label className="text-[9.5px] text-slate-400 font-bold block flex items-center gap-1">
                  Items Description
                </label>
                <textarea
                  name="items"
                  value={formData.items}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. 3 Bedroom House, sofa, boxes, upright piano..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500/50 resize-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] text-slate-400 font-bold block flex items-center gap-1">
                  Special Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Elevator bookings, grandfather clock wrapping, heavy objects..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500/50 resize-none font-medium"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-800/60 pt-4 flex justify-end gap-2 mt-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 active:bg-brand-750 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/15 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : null}
                {isSubmitting ? 'Creating...' : 'Create Inquiry'}
              </button>
            </div>
          </form>

          {/* RIGHT PANE - Interactive Map */}
          <div className={`bg-slate-900/40 relative flex flex-col h-full lg:h-auto min-h-[400px] ${
            activeMobileTab === 'map' ? 'flex' : 'hidden lg:flex'
          }`}>
            
            {/* Unified Map Controller Box */}
            <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-2.5 bg-slate-950/95 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-2xl">
              <div className="flex justify-between items-center">
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-brand-400" />
                  Map Pointer Selector
                </span>
                
                {/* Mode Selector */}
                <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-lg border border-slate-850">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setMapClickTarget('origin'); }}
                    className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-wide uppercase transition-all ${
                      mapClickTarget === 'origin' 
                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' 
                        : 'text-slate-500 hover:text-slate-350 border border-transparent'
                    }`}
                  >
                    Set Origin
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setMapClickTarget('destination'); }}
                    className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-wide uppercase transition-all ${
                      mapClickTarget === 'destination' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    Set Dest
                  </button>
                </div>
              </div>

              {/* Fly Map Search Input inside unified box */}
              {isLoaded && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <Autocomplete onLoad={onMapSearchLoad} onPlaceChanged={onMapSearchPlaceChanged}>
                    <input
                      type="text"
                      placeholder="Search maps to locate coordinates..."
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-[10.5px] font-semibold text-white placeholder-slate-550 focus:outline-none focus:border-brand-500/50"
                    />
                  </Autocomplete>
                </div>
              )}
            </div>

            {/* Map Frame */}
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

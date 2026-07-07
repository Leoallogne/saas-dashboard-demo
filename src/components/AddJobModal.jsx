import React, { useState } from 'react';
import { X, Plus, Calendar, DollarSign, MapPin, Layers, Phone, Mail, FileText } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col">
        
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
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
                  <MapPin className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 104 Oak Dr, Austin, TX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold block">Destination Address *</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 502 Peach Ln, Austin, TX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8.5 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/50"
                  />
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
          <div className="border-t border-slate-800/60 pt-4 flex justify-end gap-2">
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

      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { InvoiceData, AddressDetails, BusinessDetails } from '../types';
import { parseInvoiceFromText } from '../services/geminiService';
import { Wand2, Loader2, Upload, Trash2 } from 'lucide-react';

interface InvoiceFormProps {
  invoice: InvoiceData;
  onUpdate: (updated: InvoiceData) => void;
  onDelete: () => void;
  defaultBusiness: BusinessDetails; // Used to quick-fill business info
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onUpdate, onDelete, defaultBusiness }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState('');
  const [showMagicFill, setShowMagicFill] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateCustomer = (field: keyof AddressDetails, value: string) => {
    onUpdate({
      ...invoice,
      customer: { ...invoice.customer, [field]: value }
    });
  };

  const updateBusiness = (field: keyof BusinessDetails, value: string) => {
    onUpdate({
      ...invoice,
      business: { ...invoice.business, [field]: value }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBusiness('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMagicFill = async () => {
    if (!textAreaValue.trim()) return;
    setIsProcessing(true);
    try {
      const extracted = await parseInvoiceFromText(textAreaValue);
      
      const updatedInvoice = { ...invoice };
      if (extracted.customer) {
        updatedInvoice.customer = { ...updatedInvoice.customer, ...extracted.customer };
      }
      // Only override business if extracted has significant data, otherwise keep default
      if (extracted.business && extracted.business.name) {
        updatedInvoice.business = { ...updatedInvoice.business, ...extracted.business };
      }
      if (extracted.invoiceNumber) updatedInvoice.invoiceNumber = extracted.invoiceNumber;
      if (extracted.date) updatedInvoice.date = extracted.date;
      if (extracted.totalAmount) updatedInvoice.totalAmount = extracted.totalAmount;

      onUpdate(updatedInvoice);
      setShowMagicFill(false);
      setTextAreaValue('');
    } catch (e) {
      console.error("Magic fill failed", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyDefaultBusiness = () => {
    onUpdate({
      ...invoice,
      business: { ...defaultBusiness }
    });
  };

  // Shared input class styles for consistency
  const inputBaseClass = "w-full p-2 border rounded-md border-slate-200 text-sm focus:ring-1 focus:ring-indigo-500 outline-none bg-slate-50 text-slate-900 placeholder:text-slate-400";
  const inputUnderlineClass = "w-full p-2 mb-2 border-b border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-900 bg-slate-50 rounded-t-md placeholder:text-slate-400";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all hover:shadow-md">
      
      {/* Header / Actions */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          Invoice Details
          <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            #{invoice.invoiceNumber || 'New'}
          </span>
        </h3>
        <div className="flex gap-2">
           <button 
            onClick={() => setShowMagicFill(!showMagicFill)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Wand2 size={16} />
            Magic Fill
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove Invoice"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Magic Fill Area */}
      {showMagicFill && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-indigo-100 animate-in fade-in slide-in-from-top-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Paste invoice details (email, message, etc.)
          </label>
          <textarea
            value={textAreaValue}
            onChange={(e) => setTextAreaValue(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
            rows={3}
            placeholder="e.g., Bill to John Doe, 123 Main St, NY. Invoice #900, Total $500..."
          />
          <div className="flex justify-end mt-2">
             <button
              onClick={handleMagicFill}
              disabled={isProcessing || !textAreaValue}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
              Auto-Fill Details
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Business Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Business (From)</h4>
            <button onClick={applyDefaultBusiness} className="text-xs text-indigo-600 hover:underline">
              Reset to Default
            </button>
          </div>
          
          <div className="flex items-start gap-4 mb-4">
             <div 
               className="w-16 h-16 bg-slate-50 border border-slate-300 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors overflow-hidden relative group shrink-0"
               onClick={() => fileInputRef.current?.click()}
             >
               {invoice.business.logoUrl ? (
                 <img src={invoice.business.logoUrl} alt="Logo" className="w-full h-full object-contain" />
               ) : (
                 <Upload size={20} className="text-slate-400" />
               )}
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*"
                 onChange={handleLogoUpload}
               />
               <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-[10px]">Change</div>
             </div>
             <div className="flex-1">
               <input
                type="text"
                placeholder="Business Name"
                value={invoice.business.name}
                onChange={(e) => updateBusiness('name', e.target.value)}
                className={inputUnderlineClass}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={invoice.business.phone}
                onChange={(e) => updateBusiness('phone', e.target.value)}
                className={inputUnderlineClass}
              />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <input
              type="text"
              placeholder="Address Line 1"
              value={invoice.business.addressLine1}
              onChange={(e) => updateBusiness('addressLine1', e.target.value)}
              className={`col-span-2 ${inputBaseClass}`}
            />
            <input
              type="text"
              placeholder="City"
              value={invoice.business.city}
              onChange={(e) => updateBusiness('city', e.target.value)}
              className={inputBaseClass}
            />
            <input
              type="text"
              placeholder="State"
              value={invoice.business.state}
              onChange={(e) => updateBusiness('state', e.target.value)}
              className={inputBaseClass}
            />
            <input
              type="text"
              placeholder="Pincode"
              value={invoice.business.pincode}
              onChange={(e) => updateBusiness('pincode', e.target.value)}
              className={inputBaseClass}
            />
          </div>
        </div>

        {/* Right: Customer Details */}
        <div className="space-y-4 border-l pl-0 lg:pl-8 border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Customer (To)</h4>
          
          <input
            type="text"
            placeholder="Customer Name"
            value={invoice.customer.name}
            onChange={(e) => updateCustomer('name', e.target.value)}
            className={inputUnderlineClass}
          />
          <input
            type="text"
            placeholder="Customer Phone"
            value={invoice.customer.phone}
            onChange={(e) => updateCustomer('phone', e.target.value)}
            className={inputUnderlineClass}
          />

           <div className="grid grid-cols-2 gap-3 mt-2">
             <input
              type="text"
              placeholder="Address Line 1"
              value={invoice.customer.addressLine1}
              onChange={(e) => updateCustomer('addressLine1', e.target.value)}
              className={`col-span-2 ${inputBaseClass}`}
            />
            <input
              type="text"
              placeholder="City"
              value={invoice.customer.city}
              onChange={(e) => updateCustomer('city', e.target.value)}
              className={inputBaseClass}
            />
            <input
              type="text"
              placeholder="State"
              value={invoice.customer.state}
              onChange={(e) => updateCustomer('state', e.target.value)}
              className={inputBaseClass}
            />
            <input
              type="text"
              placeholder="Pincode"
              value={invoice.customer.pincode}
              onChange={(e) => updateCustomer('pincode', e.target.value)}
              className={inputBaseClass}
            />
          </div>
        </div>
      </div>

      {/* Footer: Meta details */}
      <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Invoice Number</label>
            <input
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) => onUpdate({...invoice, invoiceNumber: e.target.value})}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
              placeholder="INV-001"
            />
         </div>
         <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={invoice.date}
              onChange={(e) => onUpdate({...invoice, date: e.target.value})}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
            />
         </div>
         <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Total Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
              <input
                type="text"
                value={invoice.totalAmount}
                onChange={(e) => onUpdate({...invoice, totalAmount: e.target.value})}
                className="w-full pl-6 p-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                placeholder="0.00"
              />
            </div>
         </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
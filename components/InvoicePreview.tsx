import React from 'react';
import { InvoiceData } from '../types';

interface InvoicePreviewProps {
  invoice: InvoiceData;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  // Helper to render a field if value exists
  const renderField = (label: string, value?: string) => {
    if (!value) return null;
    return (
      <div className="text-xs text-black leading-snug">
        <span className="font-bold mr-1">{label}:</span>{value}
      </div>
    );
  };

  return (
    <div className="w-full bg-white border border-black relative break-inside-avoid print:border-black print:border-2 mb-0">
      {/* Container for the horizontal strip - dynamic height based on content */}
      <div className="flex flex-row min-h-[180px] relative overflow-hidden"> 
        
        {/* Left: Business Info (FROM) */}
        <div className="w-1/2 p-2 border-r border-black flex flex-col relative">
          <div className="absolute top-2 left-2">
             <span className="text-sm font-black uppercase tracking-widest border-b-2 border-black">FROM</span>
          </div>

          <div className="flex items-start gap-2 mt-8 overflow-hidden">
            {invoice.business.logoUrl && (
              <img 
                src={invoice.business.logoUrl} 
                alt="Logo" 
                className="w-12 h-12 object-contain flex-shrink-0 mt-1"
              />
            )}
            <div className="flex-1 overflow-hidden">
              <h2 className="text-base font-bold uppercase text-black leading-tight mb-1 truncate">{invoice.business.name || 'Business Name'}</h2>
              <div className="space-y-0.5">
                {renderField('Address', invoice.business.addressLine1)}
                {renderField('City', invoice.business.city)}
                {renderField('State', invoice.business.state)}
                {renderField('Pincode', invoice.business.pincode)}
                {renderField('Phone', invoice.business.phone)}
              </div>
            </div>
          </div>

          <div className="mt-4 border-t-2 border-black pt-1">
            <div className="flex justify-between items-end">
                <div className="text-xs text-black space-y-0.5">
                    <div><span className="font-bold">Inv #:</span> {invoice.invoiceNumber}</div>
                    <div><span className="font-bold">Date:</span> {invoice.date}</div>
                </div>
                {invoice.totalAmount && (
                    <div className="text-lg font-black text-black">
                    {invoice.totalAmount}
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Right: Customer Info (TO) */}
        <div className="w-1/2 p-2 flex flex-col relative">
           <div className="absolute top-2 left-2">
             <span className="text-sm font-black uppercase tracking-widest border-b-2 border-black">TO</span>
          </div>

          <div className="mt-8 flex-1 overflow-hidden">
            <h2 className="text-xl font-bold text-black leading-tight mb-2 truncate">{invoice.customer.name || 'Customer Name'}</h2>
             <div className="space-y-0.5">
                {renderField('Address', invoice.customer.addressLine1)}
                {renderField('City', invoice.customer.city)}
                {renderField('State', invoice.customer.state)}
                {renderField('Pincode', invoice.customer.pincode)}
                {renderField('Phone', invoice.customer.phone)}
              </div>
          </div>
        </div>
      </div>
      
      {/* Cut Lines (Visual Only) */}
      <div className="absolute bottom-[-1px] left-0 right-0 h-0 border-b border-dashed border-gray-400 w-full print:block hidden" />
    </div>
  );
};

export default InvoicePreview;
import React from 'react';
import { InvoiceData } from '../types';

interface InvoicePreviewProps {
  invoice: InvoiceData;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  return (
    <div className="w-full bg-white border border-black relative break-inside-avoid print:border-black print:border">
      {/* Container for the horizontal strip */}
      <div className="flex flex-row h-[260px] relative overflow-hidden">
        
        {/* Left: Business Info */}
        <div className="w-1/2 p-6 border-r border-black flex flex-col justify-between">
          <div className="flex items-start gap-4">
            {invoice.business.logoUrl && (
              <img 
                src={invoice.business.logoUrl} 
                alt="Logo" 
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h2 className="text-xl font-bold uppercase text-black">{invoice.business.name || 'Business Name'}</h2>
              <p className="text-sm mt-1 text-black">{invoice.business.addressLine1}</p>
              <p className="text-sm text-black">
                {[invoice.business.city, invoice.business.state, invoice.business.pincode].filter(Boolean).join(', ')}
              </p>
              <p className="text-sm mt-1 font-medium text-black">Phone: {invoice.business.phone}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm border-t border-black pt-2 flex justify-between text-black">
               <span><strong>Invoice #:</strong> {invoice.invoiceNumber}</span>
               <span><strong>Date:</strong> {invoice.date}</span>
            </div>
            <div className="text-lg font-bold mt-2 text-black">
              Total: {invoice.totalAmount}
            </div>
          </div>
        </div>

        {/* Right: Customer Info */}
        <div className="w-1/2 p-6 flex flex-col justify-center text-black">
          <div className="mb-2">
            <span className="text-xs uppercase tracking-widest border-b border-black pb-1 mb-2 inline-block">Bill To</span>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">{invoice.customer.name || 'Customer Name'}</h2>
           <p className="text-base text-black">{invoice.customer.addressLine1}</p>
            <p className="text-base text-black">
              {[invoice.customer.city, invoice.customer.state, invoice.customer.pincode].filter(Boolean).join(', ')}
            </p>
            <p className="text-base mt-2 font-medium text-black">Ph: {invoice.customer.phone}</p>
        </div>
      </div>
      
      {/* Cut Lines (Visual Only) */}
      <div className="absolute bottom-[-1px] left-0 right-0 h-0 border-b border-dashed border-gray-400 w-full print:block hidden" />
    </div>
  );
};

export default InvoicePreview;
import React from 'react';
import { InvoiceData } from '../types';
import InvoicePreview from './InvoicePreview';

interface PrintLayoutProps {
  invoices: InvoiceData[];
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ invoices }) => {
  return (
    <div className="print-only bg-white w-full">
      <div className="flex flex-col w-full">
        {invoices.map((inv) => (
          <div key={inv.id} className="w-full">
             <InvoicePreview invoice={inv} />
             {/* Add a cut indicator text for clarity, though dashed line is in component */}
             <div className="text-[8px] text-gray-400 text-center py-1 font-mono uppercase tracking-widest">Cut Here</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintLayout;
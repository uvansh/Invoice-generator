import React, { useState, useEffect } from 'react';
import { Plus, Printer, Settings, CloudUpload, CloudDownload, Loader2, AlertTriangle, FileText } from 'lucide-react';
import InvoiceForm from './components/InvoiceForm';
import PrintLayout from './components/PrintLayout';
import SettingsModal from './components/SettingsModal';
import { InvoiceData, BusinessDetails, MongoConfig } from './types';
import { saveInvoiceToMongo, fetchInvoicesFromMongo } from './services/mongoService';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate a blank invoice
const createEmptyInvoice = (defaultBusiness: BusinessDetails): InvoiceData => ({
  id: uuidv4(),
  invoiceNumber: '',
  date: new Date().toISOString().split('T')[0],
  totalAmount: '',
  business: { ...defaultBusiness },
  customer: {
    name: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  },
});

// Default Mongo Config (Placeholders)
const DEFAULT_MONGO_CONFIG: MongoConfig = {
  apiKey: '',
  endpoint: '',
  dataSource: 'Cluster0',
  database: 'invoice_app',
  collection: 'invoices'
};

const App: React.FC = () => {
  // Global default business state to auto-fill new invoices
  const [defaultBusiness, setDefaultBusiness] = useState<BusinessDetails>({
    name: 'Your Company LLC',
    addressLine1: '123 Business Rd',
    city: 'New York',
    state: 'NY',
    pincode: '10001',
    phone: '(555) 123-4567',
    logoUrl: '',
  });

  const [invoices, setInvoices] = useState<InvoiceData[]>([createEmptyInvoice(defaultBusiness)]);
  
  // Settings & Sync State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mongoConfig, setMongoConfig] = useState<MongoConfig>(DEFAULT_MONGO_CONFIG);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  
  // Validation / Warning Modal State
  const [printWarning, setPrintWarning] = useState<{ isOpen: boolean; missingFields: string[]; invoiceIndex: number } | null>(null);
  const [pendingAction, setPendingAction] = useState<'print' | 'download' | null>(null);

  // Load settings from local storage on boot
  useEffect(() => {
    const savedConfig = localStorage.getItem('mongoConfig');
    if (savedConfig) {
      try {
        setMongoConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
  }, []);

  // Update default business when first invoice changes
  useEffect(() => {
    if (invoices.length > 0) {
      setDefaultBusiness(invoices[0].business);
    }
  }, [invoices]);

  const saveConfig = (newConfig: MongoConfig) => {
    setMongoConfig(newConfig);
    localStorage.setItem('mongoConfig', JSON.stringify(newConfig));
  };

  const addInvoice = () => {
    setInvoices([...invoices, createEmptyInvoice(defaultBusiness)]);
  };

  const updateInvoice = (updated: InvoiceData) => {
    setInvoices(invoices.map(inv => inv.id === updated.id ? updated : inv));
  };

  const deleteInvoice = (id: string) => {
    if (invoices.length === 1) {
       setInvoices([createEmptyInvoice(defaultBusiness)]);
    } else {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const executePDFGeneration = async () => {
    setIsSyncing(true);
    setSyncMessage('Generating PDF...');
    
    const element = document.getElementById('pdf-print-layout');
    if (!element) {
        alert("Error: PDF Content not found");
        setIsSyncing(false);
        setSyncMessage(null);
        return;
    }

    const opt = {
      margin: 10,
      filename: `zapinvo-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    if (window.html2pdf) {
        try {
             // @ts-ignore
            await window.html2pdf().set(opt).from(element).save();
        } catch (e) {
            console.error(e);
            alert("Failed to generate PDF. Please try using the Print button and 'Save as PDF' instead.");
        }
    } else {
        alert("PDF generator library not loaded. Please refresh the page.");
    }
    
    setIsSyncing(false);
    setSyncMessage(null);
  };

  const handleActionRequest = (action: 'print' | 'download') => {
    // Check for incomplete fields (Total Amount is now optional)
    const incompleteInvoice = invoices.find(inv => 
      !inv.business.name?.trim() || 
      !inv.customer.name?.trim()
    );

    if (incompleteInvoice) {
      const index = invoices.indexOf(incompleteInvoice);
      const missing = [];
      if (!incompleteInvoice.business.name?.trim()) missing.push("Business Name");
      if (!incompleteInvoice.customer.name?.trim()) missing.push("Customer Name");
      
      setPendingAction(action);
      setPrintWarning({
        isOpen: true,
        missingFields: missing,
        invoiceIndex: index + 1
      });
      
      // Scroll to the problem area
      const element = document.getElementById(`invoice-card-${incompleteInvoice.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Execute immediately if valid
    if (action === 'print') {
        window.print();
    } else {
        executePDFGeneration();
    }
  };

  const handleConfirmAction = () => {
    setPrintWarning(null);
    setTimeout(() => {
        if (pendingAction === 'print') {
            window.print();
        } else if (pendingAction === 'download') {
            executePDFGeneration();
        }
        setPendingAction(null);
    }, 50);
  };

  const handleCloseWarning = () => {
      setPrintWarning(null);
      setPendingAction(null);
  }

  const handleSaveToCloud = async () => {
    if (!mongoConfig.apiKey || !mongoConfig.endpoint) {
      setIsSettingsOpen(true);
      return;
    }
    
    setIsSyncing(true);
    setSyncMessage('Saving...');
    try {
      // Save all current invoices
      await Promise.all(invoices.map(inv => saveInvoiceToMongo(inv, mongoConfig)));
      setSyncMessage('Saved!');
      setTimeout(() => setSyncMessage(null), 2000);
    } catch (error: any) {
      console.error(error);
      setSyncMessage('Error Saving');
      setTimeout(() => setSyncMessage(null), 3000);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadFromCloud = async () => {
     if (!mongoConfig.apiKey || !mongoConfig.endpoint) {
      setIsSettingsOpen(true);
      return;
    }

    setIsSyncing(true);
    setSyncMessage('Loading...');
    try {
      const fetchedInvoices = await fetchInvoicesFromMongo(mongoConfig);
      if (fetchedInvoices.length > 0) {
        setInvoices(fetchedInvoices);
        setSyncMessage('Loaded!');
      } else {
        setSyncMessage('No invoices found');
      }
      setTimeout(() => setSyncMessage(null), 2000);
    } catch (error: any) {
      console.error(error);
      setSyncMessage('Error Loading');
      setTimeout(() => setSyncMessage(null), 3000);
      alert(`Failed to load: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white font-sans">
      
      {/* Warning Modal for Print/Download */}
      {printWarning && printWarning.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-amber-600">
                <AlertTriangle size={28} />
                <h3 className="text-lg font-bold text-slate-900">Missing Details</h3>
              </div>
              
              <p className="text-slate-600 text-sm mb-4">
                Invoice <strong>#{printWarning.invoiceIndex}</strong> is incomplete. The following fields are missing:
              </p>
              <ul className="list-disc list-inside text-sm text-slate-700 font-medium bg-amber-50 p-3 rounded-lg mb-6">
                {printWarning.missingFields.map(field => (
                  <li key={field}>{field}</li>
                ))}
              </ul>

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={handleCloseWarning}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Back to Edit
                </button>
                <button 
                  onClick={handleConfirmAction}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {pendingAction === 'download' ? 'Download Anyway' : 'Print Anyway'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen Layout: Editor */}
      <div className="no-print max-w-5xl mx-auto px-4 py-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            {/* Logo Image */}
            <div className="flex items-center gap-2 mb-2">
               <img 
                 src="/logo.png" 
                 alt="ZapInvo" 
                 className="h-14 object-contain"
                 onError={(e) => {
                   // Fallback to jpg if png fails, or keep alt text
                   const target = e.target as HTMLImageElement;
                   if (target.src.endsWith('png')) {
                      target.src = '/logo.jpg';
                   }
                 }} 
               />
            </div>
            <p className="text-slate-500 mt-1">Lightning fast, AI-powered invoice generation.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            {/* Database Controls */}
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 mr-2 shadow-sm">
               <button 
                onClick={handleSaveToCloud}
                disabled={isSyncing}
                title="Save All to Database"
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-50"
              >
                {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <CloudUpload size={20} />}
              </button>
              <button 
                onClick={handleLoadFromCloud}
                disabled={isSyncing}
                title="Load from Database"
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-50"
              >
                <CloudDownload size={20} />
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                title="Database Settings"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors border-l border-slate-100 ml-1"
              >
                <Settings size={20} />
              </button>
            </div>
            {syncMessage && <span className="text-xs font-semibold text-indigo-600 animate-pulse mr-2">{syncMessage}</span>}

            {/* Main Actions */}
            <button 
              onClick={addInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
            >
              <Plus size={18} />
              Add
            </button>

            <div className="flex items-center gap-2">
                <button 
                onClick={() => handleActionRequest('download')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg font-bold hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md"
                >
                <FileText size={18} />
                PDF
                </button>
                <button 
                onClick={() => handleActionRequest('print')}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                <Printer size={18} />
                Print
                </button>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          {invoices.map((invoice, index) => (
            <div key={invoice.id} id={`invoice-card-${invoice.id}`} className="relative scroll-mt-24">
               {/* Visual counter on the side for desktop */}
               <div className="hidden xl:block absolute -left-12 top-6 text-slate-300 font-bold text-4xl select-none">
                 {index + 1}
               </div>
               <InvoiceForm 
                 invoice={invoice} 
                 onUpdate={updateInvoice} 
                 onDelete={() => deleteInvoice(invoice.id)}
                 defaultBusiness={defaultBusiness}
               />
            </div>
          ))}

          <div className="flex justify-center mt-8 pb-12">
            <button 
              onClick={addInvoice}
              className="flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 group-hover:border-indigo-400 flex items-center justify-center">
                <Plus size={24} />
              </div>
              <span className="font-medium text-sm">Add Another Invoice</span>
            </button>
          </div>
        </main>
      </div>

      {/* Print Layout: Standard browser print */}
      <PrintLayout invoices={invoices} />

      {/* PDF Generation Layout: Hidden from screen but accessible to html2pdf */}
      <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '210mm', backgroundColor: 'white' }}>
         <PrintLayout invoices={invoices} id="pdf-print-layout" className="" />
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={mongoConfig}
        onSave={saveConfig}
      />

    </div>
  );
};

export default App;
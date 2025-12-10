import React, { useState, useEffect } from 'react';
import { MongoConfig } from '../types';
import { X, Save, Database } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MongoConfig;
  onSave: (config: MongoConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [formData, setFormData] = useState<MongoConfig>(config);

  // Reset form data when config changes or modal opens
  useEffect(() => {
    setFormData(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const inputClass = "w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Database size={18} className="text-indigo-600" />
            Database Settings
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500 mb-4">
            Configure your MongoDB Atlas Data API connection to save and load invoices.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">API Endpoint URL</label>
            <input
              type="text"
              name="endpoint"
              value={formData.endpoint}
              onChange={handleChange}
              placeholder="https://.../data/v1"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">API Key</label>
            <input
              type="password"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="Secret API Key"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
             <div className="col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cluster Name / Data Source</label>
                <input
                  type="text"
                  name="dataSource"
                  value={formData.dataSource}
                  onChange={handleChange}
                  placeholder="Cluster0"
                  className={inputClass}
                  required
                />
             </div>
             <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Database</label>
                <input
                  type="text"
                  name="database"
                  value={formData.database}
                  onChange={handleChange}
                  placeholder="db_name"
                  className={inputClass}
                  required
                />
             </div>
             <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Collection</label>
                <input
                  type="text"
                  name="collection"
                  value={formData.collection}
                  onChange={handleChange}
                  placeholder="invoices"
                  className={inputClass}
                  required
                />
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Save size={16} />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
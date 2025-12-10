import { InvoiceData, MongoConfig } from '../types';

export const saveInvoiceToMongo = async (invoice: InvoiceData, config: MongoConfig) => {
  // Validating config presence
  if (!config.apiKey || !config.endpoint) {
    throw new Error("Missing MongoDB Configuration");
  }

  // Use updateOne with upsert to save or update based on ID
  // This ensures we don't create duplicates if we save the same invoice twice
  const body = {
    dataSource: config.dataSource,
    database: config.database,
    collection: config.collection,
    filter: { id: invoice.id },
    update: { $set: invoice },
    upsert: true,
  };

  const response = await fetch(`${config.endpoint}/action/updateOne`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`MongoDB Error: ${errText}`);
  }

  return response.json();
};

export const fetchInvoicesFromMongo = async (config: MongoConfig): Promise<InvoiceData[]> => {
  if (!config.apiKey || !config.endpoint) {
    throw new Error("Missing MongoDB Configuration");
  }

  const body = {
    dataSource: config.dataSource,
    database: config.database,
    collection: config.collection,
    filter: {},
    limit: 50, // Reasonable limit for a demo
    sort: { date: -1 } 
  };

  const response = await fetch(`${config.endpoint}/action/find`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify(body),
  });

   if (!response.ok) {
    const errText = await response.text();
    throw new Error(`MongoDB Error: ${errText}`);
  }

  const data = await response.json();
  return data.documents || [];
};

import { GoogleGenAI, Type } from "@google/genai";
import { AIExtractionResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const parseInvoiceFromText = async (text: string): Promise<AIExtractionResponse> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Skipping AI extraction.");
    return {};
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract invoice details from the following text. 
      The text might contain business details (sender) and customer details (receiver).
      Extract as much as possible.
      
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            business: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                addressLine1: { type: Type.STRING },
                city: { type: Type.STRING },
                state: { type: Type.STRING },
                pincode: { type: Type.STRING },
                phone: { type: Type.STRING },
              }
            },
            customer: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                addressLine1: { type: Type.STRING },
                city: { type: Type.STRING },
                state: { type: Type.STRING },
                pincode: { type: Type.STRING },
                phone: { type: Type.STRING },
              }
            },
            invoiceNumber: { type: Type.STRING },
            date: { type: Type.STRING },
            totalAmount: { type: Type.STRING },
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return {};
    return JSON.parse(jsonText) as AIExtractionResponse;

  } catch (error) {
    console.error("Error parsing invoice with Gemini:", error);
    return {};
  }
};

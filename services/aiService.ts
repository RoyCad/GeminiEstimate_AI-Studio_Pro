
import { GoogleGenAI } from "@google/genai";

// Safely handle process.env for browser environments
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : ''; 

const ai = new GoogleGenAI({ apiKey });

export const analyzeStructuralFile = async (fileBase64: string, mimeType: string) => {
  try {
    if (!apiKey) {
        throw new Error("API Key is missing");
    }

    const model = 'gemini-2.5-flash'; 
    
    const prompt = `You are an expert AI cost estimator for construction projects in Bangladesh. Analyze the provided structural drawing or image.
    
    If it IS a structural plan:
    - Analyze dimensions and details.
    - Calculate estimated costs in BDT based on current market rates.
    - Return a JSON object with: { "totalEstimatedCost": number, "costPerFloor": string, "analysisSummary": string }.
    
    If it is NOT a structural plan:
    - Return { "totalEstimatedCost": 0, "costPerFloor": "N/A", "analysisSummary": "Not a valid structural drawing." }`;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
            { inlineData: { mimeType, data: fileBase64 } },
            { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};

export const getMarketPrices = async (materialName: string) => {
    try {
        if (!apiKey) {
            return { prices: [] };
        }

        const model = 'gemini-2.5-flash';
        const prompt = `Get current market prices for ${materialName} in Bangladesh. 
        Return a JSON object with a 'prices' array. Each item should have 'brand', 'price', 'unit'.`;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{"prices": []}');
    } catch (e) {
        console.error(e);
        return { prices: [] };
    }
}

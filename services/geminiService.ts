
import { GoogleGenAI } from "@google/genai";
import { Project } from "../types";

// Initialize the Gemini API client
// Safely handle process.env for browser environments
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : ''; 

const ai = new GoogleGenAI({ apiKey: apiKey });

export const generateProjectResponse = async (
  project: Project,
  userQuery: string
): Promise<string> => {
  try {
    if (!apiKey) {
        return "API Key is missing. Please configure the API key in your environment variables.";
    }

    const model = 'gemini-2.5-flash';

    // Construct a system instruction that includes the project context
    const systemInstruction = `
      You are a specialized construction assistant for the project "${project.name}".
      
      Your Role:
      - Analyze the provided project JSON data.
      - Answer questions about costs, materials, status, and budget.
      - Provide construction advice if asked, but prioritize the data.
      - Be polite, professional, and concise.
      
      Project Data Context:
      ${JSON.stringify(project, null, 2)}
      
      Current Date: ${new Date().toLocaleDateString()}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    return response.text || "I apologize, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the AI service right now. Please check your API key or internet connection.";
  }
};

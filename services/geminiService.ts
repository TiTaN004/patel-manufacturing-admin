
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface ImageAnalysisResult {
  productName: string;
  shortDescription: string;
  estimatedPrice?: number;
  keywords: string[];
}

export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeProductImage = async (base64Image: string, mimeType: string): Promise<ImageAnalysisResult> => {
  try {
    const modelId = 'gemini-3-flash-preview'; 
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Analyze this product image for an e-commerce listing. Extract a catchy product name, a short SEO-friendly description (max 150 chars), and 5 keywords. Also estimate a price if possible, or return 0."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            shortDescription: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER },
            keywords: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["productName", "shortDescription", "keywords"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as ImageAnalysisResult;

  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      productName: "",
      shortDescription: "",
      keywords: [],
      estimatedPrice: 0
    };
  }
};

import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const getNameMeaning = async (name: string): Promise<string> => {
  try {
    const ai = getClient();
    
    const prompt = `
      You are an expert in Arabic etymology and history. 
      Provide a brief, poetic meaning of the Arabic name "${name}". 
      Keep it under 30 words. 
      Answer in Arabic.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "لم أتمكن من العثور على معنى لهذا الاسم.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
  }
};

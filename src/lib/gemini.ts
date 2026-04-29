import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runBenchmark(task: string, prompt: string, model: string = "gemini-3-flash-preview") {
  try {
    const startTime = Date.now();
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          text: `Maritime Security Benchmark Task: ${task}\n\nContext: You are a counter-terrorism advisor for Navisea. Analyze the following maritime data:\n\n${prompt}\n\nProvide deep reasoning and a security classification.`,
        }
      ],
    });
    const endTime = Date.now();
    
    return {
      text: response.text,
      latency: endTime - startTime,
      model: model,
    };
  } catch (error) {
    console.error("Benchmark error:", error);
    throw error;
  }
}

import { GoogleGenAI, Type } from "@google/genai";
import { ParticleConfig, MoodResponse } from "../components/zen/types";

export const analyzeMood = async (userInput: string): Promise<MoodResponse> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || "";

    if (!apiKey) {
        console.warn("Gemini API Key missing");
        return {
            insight: "I'm here to support you. Let's find some calm together.",
            config: {
                colorPrimary: "#4fd1c5",
                colorSecondary: "#63b3ed",
                size: 0.05,
                count: 2000,
                speed: 0.5,
                turbulence: 1.0,
                interactionMode: 'drift'
            }
        };
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: {
                role: "user",
                parts: [{
                    text: `Analyze the following emotional statement and provide a corresponding 3D particle system configuration designed to soothe or reflect the user's state. 
                    User state: "${userInput}"
                    
                    The response MUST be a JSON object containing:
                    1. 'config': { colorPrimary (hex), colorSecondary (hex), size (0.01-0.1), count (500-3000), speed (0.1-2.0), turbulence (0.1-3.0), interactionMode ('attract'|'repel'|'drift') }
                    2. 'insight': A short, compassionate 1-sentence supportive message.`
                }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        config: {
                            type: Type.OBJECT,
                            properties: {
                                colorPrimary: { type: Type.STRING },
                                colorSecondary: { type: Type.STRING },
                                size: { type: Type.NUMBER },
                                count: { type: Type.NUMBER },
                                speed: { type: Type.NUMBER },
                                turbulence: { type: Type.NUMBER },
                                interactionMode: { type: Type.STRING }
                            },
                            required: ["colorPrimary", "colorSecondary", "size", "count", "speed", "turbulence", "interactionMode"]
                        },
                        insight: { type: Type.STRING }
                    },
                    required: ["config", "insight"]
                }
            }
        });

        const text = response.text;

        if (!text) throw new Error("Empty response from AI");

        const data = JSON.parse(text.trim());
        return data as MoodResponse;
    } catch (error) {
        console.error("Failed to parse AI response", error);
        return {
            insight: "I'm here to support you. Let's find some calm together.",
            config: {
                colorPrimary: "#4fd1c5",
                colorSecondary: "#63b3ed",
                size: 0.05,
                count: 2000,
                speed: 0.5,
                turbulence: 1.0,
                interactionMode: 'drift'
            }
        };
    }
};

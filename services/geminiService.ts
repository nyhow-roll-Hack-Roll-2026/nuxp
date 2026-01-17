import { GoogleGenAI } from "@google/genai";
import { Achievement } from "../types";

// Initialize the API client
// Note: In a real production app, you might proxy this through a backend to protect the key.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const getAchievementLore = async (
  achievement: Achievement,
): Promise<string> => {
  if (!apiKey)
    return "Unlock the mysteries of the API Key to reveal this lore.";

  try {
    const prompt = `
      You are the narrator of a Minecraft-themed adventure game set in the National University of Singapore (NUS).
      Write a short, witty, 1-2 sentence "flavor text" or "lore" for an achievement called "${achievement.title}".
      Description: ${achievement.description}.
      Style: Cryptic, funny, or pixel-art game style. 
      Keep it under 30 words.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return (
      response.text?.trim() || "The ancient scrolls are silent on this matter."
    );
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Data corrupted. The void stares back.";
  }
};

export const getPersonalizedTip = async (
  unlockedCount: number,
): Promise<string> => {
  if (!apiKey) return "Keep exploring to find more secrets!";

  try {
    const prompt = `
          The user has completed ${unlockedCount} achievements in the NUS Minecraft Adventure.
          Give them a short, encouraging, 1-sentence tip on how to survive university life in Singapore.
          Style: Minecraft loading screen tip.
        `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text?.trim() || "Tip: Don't forget to sleep.";
  } catch (error) {
    return "Tip: Press WASD to move (in real life, just walk).";
  }
};

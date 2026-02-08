import { GoogleGenAI, Type } from "@google/genai";
import { WordPair, Language } from "../types";

// Fallback words in case API fails or limit reached
const FALLBACK_WORDS_EN: WordPair[] = [
  { civilianWord: "Coffee", undercoverWord: "Tea" },
  { civilianWord: "Helicopter", undercoverWord: "Drone" },
  { civilianWord: "Superman", undercoverWord: "Batman" },
  { civilianWord: "Facebook", undercoverWord: "Instagram" },
  { civilianWord: "Guitar", undercoverWord: "Violin" },
  { civilianWord: "Apple", undercoverWord: "Pear" },
  { civilianWord: "Cat", undercoverWord: "Dog" },
  { civilianWord: "Train", undercoverWord: "Bus" },
  { civilianWord: "Pasta", undercoverWord: "Noodles" },
  { civilianWord: "Ocean", undercoverWord: "Lake" },
];

const FALLBACK_WORDS_ZH: WordPair[] = [
  { civilianWord: "咖啡", undercoverWord: "茶" },
  { civilianWord: "直升机", undercoverWord: "无人机" },
  { civilianWord: "超人", undercoverWord: "蝙蝠侠" },
  { civilianWord: "微信", undercoverWord: "QQ" },
  { civilianWord: "吉他", undercoverWord: "小提琴" },
  { civilianWord: "苹果", undercoverWord: "梨" },
  { civilianWord: "猫", undercoverWord: "狗" },
  { civilianWord: "火车", undercoverWord: "公交" },
  { civilianWord: "意大利面", undercoverWord: "面条" },
  { civilianWord: "海洋", undercoverWord: "湖泊" },
];

// Normalize words for comparison: trim, lowercase, remove punctuation, collapse spaces
const normalizeWord = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");

export const generateGameWords = async (topic: string | undefined, language: Language, excludeWords: string[] = []): Promise<WordPair> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API Key not found, using fallback.");
      return getRandomFallback(language, excludeWords.map(normalizeWord));
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Using a more creative model for word association
    const modelId = "gemini-3-flash-preview"; 

    const langInstruction = language === 'zh' 
        ? "Generate the words in Simplified Chinese (Mandarin)." 
        : "Generate the words in English.";

    const topicPrompt = topic && topic.trim() !== "" 
      ? `The words should be related to the topic: "${topic}".` 
      : "The words can be from any common category (e.g., Food, Objects, Places, People).";

    // Normalize and limit history to last 50
    const recentHistory = (excludeWords || []).map(normalizeWord).slice(-50);
    const excludeInstruction = recentHistory.length > 0
        ? `6. DO NOT use the following words (or their close variations): ${recentHistory.join(', ')}.`
        : "";

    const prompt = `
      Generate a pair of words for the party game "Who is the Undercover" (also known as Spyfall or 谁是卧底).
      
      Rules for the words:
      1. They must be distinct nouns.
      2. They must be related enough that descriptions might be ambiguous (e.g., Apple vs Pear, Lipstick vs Crayon).
      3. They must NOT be the same word.
      4. Avoid extremely obscure words.
      5. ${langInstruction}
      ${excludeInstruction}
      
      ${topicPrompt}
      
      Return the result strictly as a JSON object.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            civilianWord: { type: Type.STRING },
            undercoverWord: { type: Type.STRING },
          },
          required: ["civilianWord", "undercoverWord"],
        },
        temperature: 0.9, 
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");

    const parsed = JSON.parse(jsonText) as WordPair;
    
    // Basic validation
    if (!parsed.civilianWord || !parsed.undercoverWord) {
        throw new Error("Invalid format");
    }

    // Don't capitalize for Chinese
    if (language === 'zh') {
        return parsed;
    }

    return {
      civilianWord: capitalize(parsed.civilianWord),
      undercoverWord: capitalize(parsed.undercoverWord)
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return getRandomFallback(language, excludeWords.map(normalizeWord));
  }
};

const getRandomFallback = (language: Language, excludeNormalized: string[] = []): WordPair => {
  const source = language === 'zh' ? FALLBACK_WORDS_ZH : FALLBACK_WORDS_EN;
  const excludeSet = new Set((excludeNormalized || []).map(normalizeWord));

  // Filter out any fallback pairs where either normalized word is in the exclude set
  const filtered = source.filter(p => {
    const civ = normalizeWord(p.civilianWord);
    const spy = normalizeWord(p.undercoverWord);
    return civ && spy && !excludeSet.has(civ) && !excludeSet.has(spy) && civ !== spy;
  });

  if (filtered.length === 0) {
    // If none left after filtering, return a random pair from the full list
    const index = Math.floor(Math.random() * source.length);
    return source[index];
  }

  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

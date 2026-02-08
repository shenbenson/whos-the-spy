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
    .replace(/[^^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");

export const generateGameWords = async (
  topic: string | undefined,
  language: Language,
  excludeWords: string[] = [],
  count: number = 1
): Promise<WordPair[]> => {
  try {
    const apiKey = process.env.API_KEY;
    const recentHistory = (excludeWords || []).map(normalizeWord).slice(-50);

    if (!apiKey) {
      console.warn("API Key not found, using fallback.");
      return getRandomFallbacks(language, recentHistory, count);
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-3-flash-preview";

    const langInstruction = language === "zh" ? "Generate the words in Simplified Chinese (Mandarin)." : "Generate the words in English.";

    const topicPrompt = topic && topic.trim() !== "" ? `The words should be related to the topic: \"${topic}\".` : "The words can be from any common category (e.g., Food, Objects, Places, People).";

    const excludeInstruction = recentHistory.length > 0 ? `Do NOT use the following words (or their close variations): ${recentHistory.join(', ')}.` : "";

    // Request an array of candidate pairs in a single response
    const prompt = `
      Return exactly ${count} candidate pairs as a JSON array of objects. Each object should have the properties: { "civilianWord": string, "undercoverWord": string }.
      Make each pair distinct and prefer pairs from different categories to improve variety.

      Tone & style guidance:
      - Favor playful, vivid, and memorable words that make describing them fun (e.g., "marshmallow", "scooter", "starlight").
      - Prefer everyday nouns with quirky or colorful associations rather than dry or overly technical terms.
      - Avoid overly generic pairs (e.g., "cat"/"dog") unless they are framed in an interesting category.
      - Do not use region-specific slang; keep words broadly familiar.

      Rules for each pair:
      1. Both entries should be single words or short noun phrases (1-2 words).
      2. The two words in a pair must be related but not identical.
      3. Prefer pairs from different categories across the list (food, transport, nature, pop culture, objects) to maximize variety.
      4. Avoid obscure or overly specialized terms.
      5. ${langInstruction}
      ${excludeInstruction}

      ${topicPrompt}

      Output only valid JSON (no explanation).
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              civilianWord: { type: Type.STRING },
              undercoverWord: { type: Type.STRING },
            },
            required: ["civilianWord", "undercoverWord"],
          },
        },
        temperature: 0.9,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");

    const parsed = JSON.parse(jsonText) as WordPair[];
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid format: expected array");

    // Basic validation & normalization and ensure uniqueness
    const seen = new Set<string>();
    const results: WordPair[] = [];
    for (const item of parsed) {
      if (!item?.civilianWord || !item?.undercoverWord) continue;
      const civ = item.civilianWord;
      const spy = item.undercoverWord;
      const civNorm = normalizeWord(civ);
      const spyNorm = normalizeWord(spy);
      if (civNorm === spyNorm) continue;
      if (recentHistory.includes(civNorm) || recentHistory.includes(spyNorm)) continue;
      const key = civNorm + '||' + spyNorm;
      if (seen.has(key)) continue;
      seen.add(key);
      // Capitalize English words for display
      results.push(language === 'zh' ? { civilianWord: civ, undercoverWord: spy } : { civilianWord: capitalize(civ), undercoverWord: capitalize(spy) });
      if (results.length >= count) break;
    }

    // If not enough valid results from the model, fill from filtered fallbacks
    if (results.length < count) {
      const needed = count - results.length;
      const fallbacks = getRandomFallbacks(language, recentHistory, needed, seen);
      results.push(...fallbacks);
    }

    return results.slice(0, count);
  } catch (error) {
    console.error("Gemini API Error:", error);
    const recentHistory = (excludeWords || []).map(normalizeWord).slice(-50);
    return getRandomFallbacks(language, recentHistory, count);
  }
};

const getRandomFallbacks = (language: Language, excludeNormalized: string[] = [], count: number = 1, alreadySeen: Set<string> | null = null): WordPair[] => {
  const source = language === 'zh' ? FALLBACK_WORDS_ZH : FALLBACK_WORDS_EN;
  const excludeSet = new Set((excludeNormalized || []).map(normalizeWord));
  const picked: WordPair[] = [];
  const usedKeys = new Set<string>(alreadySeen ? Array.from(alreadySeen) : []);

  const candidates = source.filter(p => {
    const civ = normalizeWord(p.civilianWord);
    const spy = normalizeWord(p.undercoverWord);
    const key = civ + '||' + spy;
    return civ && spy && civ !== spy && !excludeSet.has(civ) && !excludeSet.has(spy) && !usedKeys.has(key);
  });

  // Shuffle candidates
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (const p of candidates) {
    if (picked.length >= count) break;
    picked.push(p);
    usedKeys.add(normalizeWord(p.civilianWord) + '||' + normalizeWord(p.undercoverWord));
  }

  // If still not enough, fill from full source allowing repeats
  while (picked.length < count) {
    const idx = Math.floor(Math.random() * source.length);
    const p = source[idx];
    picked.push(p);
  }

  return picked.slice(0, count);
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

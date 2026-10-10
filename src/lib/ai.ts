import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export const geminiFlash = google("gemini-3.5-flash");

export interface AIResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

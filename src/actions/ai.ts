"use server";

import { generateText } from "ai";
import { geminiFlash } from "@/lib/ai";
import { verifyWorkspaceMember } from "@/lib/authorization";
import {
  generateTaskDescriptionSchema,
  generateTaskBreakdownSchema,
  type GenerateTaskDescriptionInput,
  type GenerateTaskBreakdownInput,
} from "@/lib/validations/ai";

interface AITextResult {
  success: boolean;
  text?: string;
  error?: string;
}

interface AIBreakdownResult {
  success: boolean;
  subtasks?: string[];
  error?: string;
}

export async function generateTaskDescription(
  workspaceSlug: string,
  input: GenerateTaskDescriptionInput,
): Promise<AITextResult> {
  await verifyWorkspaceMember(workspaceSlug);

  const result = generateTaskDescriptionSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  const { title, projectName, context } = result.data;

  try {
    const prompt = [
      `Write a clear, professional task description for a software project task.`,
      `Task title: "${title}"`,
      projectName ? `Project: "${projectName}"` : "",
      context ? `Additional context: "${context}"` : "",
      ``,
      `Requirements:`,
      `- 2-4 sentences maximum`,
      `- Clear and actionable`,
      `- No bullet points`,
      `- Focus on what needs to be done and why`,
      `- Do not repeat the title`,
      `- Output only the description, nothing else`,
    ]
      .filter(Boolean)
      .join("\n");

    const { text } = await generateText({
      model: geminiFlash,
      prompt,
      maxTokens: 200,
      temperature: 0.7,
    });

    return { success: true, text: text.trim() };
  } catch (error) {
    console.error("AI description error:", error);
    return {
      success: false,
      error: "AI could not generate a description. Please try again.",
    };
  }
}

export async function generateTaskBreakdown(
  workspaceSlug: string,
  input: GenerateTaskBreakdownInput,
): Promise<AIBreakdownResult> {
  await verifyWorkspaceMember(workspaceSlug);

  const result = generateTaskBreakdownSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  const { title, description, projectName } = result.data;

  try {
    const prompt = [
      `Break down this software task into 3-6 specific, actionable subtasks.`,
      `Task: "${title}"`,
      description ? `Description: "${description}"` : "",
      projectName ? `Project: "${projectName}"` : "",
      ``,
      `Rules:`,
      `- Each subtask must be one clear action`,
      `- Start each with a verb (Implement, Create, Add, Update, Test, etc.)`,
      `- Be specific, not vague`,
      `- Output ONLY a JSON array of strings, nothing else`,
      `- Example: ["Implement X", "Create Y component", "Add Z validation"]`,
    ]
      .filter(Boolean)
      .join("\n");

    const { text } = await generateText({
      model: geminiFlash,
      prompt,
      maxTokens: 400,
      temperature: 0.5,
    });

    const cleaned = text
      .trim()
      .replace(/```json|```/g, "")
      .trim();
    const subtasks = JSON.parse(cleaned) as string[];

    if (!Array.isArray(subtasks)) {
      return { success: false, error: "AI did not return the correct format" };
    }

    return {
      success: true,
      subtasks: subtasks.slice(0, 6).filter((s) => typeof s === "string"),
    };
  } catch (error) {
    console.error("AI breakdown error:", error);
    return {
      success: false,
      error: "AI could not generate the breakdown.",
    };
  }
}

export async function generateProjectSummary(
  workspaceSlug: string,
  projectName: string,
  stats: {
    total: number;
    todo: number;
    inProgress: number;
    inReview: number;
    done: number;
    overdue: number;
  },
): Promise<AITextResult> {
  await verifyWorkspaceMember(workspaceSlug);

  if (!projectName || stats.total === 0) {
    return {
      success: false,
      error: "Project mein tasks hone chahiye summary ke liye",
    };
  }

  try {
    const completionRate = Math.round((stats.done / stats.total) * 100);

    const prompt = [
      `Write a brief, professional project status summary (2-3 sentences).`,
      `Project: "${projectName}"`,
      `Stats:`,
      `- Total tasks: ${stats.total}`,
      `- Completion rate: ${completionRate}%`,
      `- In progress: ${stats.inProgress}`,
      `- In review: ${stats.inReview}`,
      `- Overdue: ${stats.overdue}`,
      ``,
      `Be honest about the status. If overdue tasks exist, mention it.`,
      `Output only the summary, no labels or headers.`,
    ]
      .filter(Boolean)
      .join("\n");

    const { text } = await generateText({
      model: geminiFlash,
      prompt,
      maxTokens: 150,
      temperature: 0.6,
    });

    return { success: true, text: text.trim() };
  } catch (error) {
    console.error("AI summary error:", error);
    return { success: false, error: "Could not generate summary" };
  }
}

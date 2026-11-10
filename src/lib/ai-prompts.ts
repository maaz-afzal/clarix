export function buildDescriptionPrompt(input: {
  title: string
  projectName?: string
  context?: string
}): string {
  return [
    "Write a clear, professional task description for a software project task.",
    `Task title: "${input.title}"`,
    input.projectName ? `Project: "${input.projectName}"` : "",
    input.context ? `Additional context: "${input.context}"` : "",
    "",
    "Requirements:",
    "- 2-4 sentences maximum",
    "- Clear and actionable",
    "- No bullet points",
    "- Focus on what needs to be done and why",
    "- Do not repeat the title",
    "- Output only the description, nothing else",
  ]
    .filter(Boolean)
    .join("\n")
}

export function buildSummaryPrompt(input: {
  projectName: string
  stats: {
    total: number
    todo: number
    inProgress: number
    inReview: number
    done: number
    overdue: number
  }
}): string {
  const completionRate =
    input.stats.total > 0
      ? Math.round((input.stats.done / input.stats.total) * 100)
      : 0

  return [
    "Write a brief, professional project status summary (2-3 sentences).",
    `Project: "${input.projectName}"`,
    `Stats:`,
    `- Total tasks: ${input.stats.total}`,
    `- Completion rate: ${completionRate}%`,
    `- In progress: ${input.stats.inProgress}`,
    `- In review: ${input.stats.inReview}`,
    `- Overdue: ${input.stats.overdue}`,
    ``,
    `Be honest about the status. If overdue tasks exist, mention it.`,
    `Output only the summary, no labels or headers.`,
  ]
    .filter(Boolean)
    .join("\n")
}
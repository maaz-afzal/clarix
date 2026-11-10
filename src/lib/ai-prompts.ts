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
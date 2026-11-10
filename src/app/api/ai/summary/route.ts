import { NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { auth } from "@/lib/auth"
import { geminiFlash } from "@/lib/ai"
import { buildSummaryPrompt } from "@/lib/ai-prompts"
import { getWorkspaceMembership } from "@/lib/dal/workspace"
import { getProjectAnalytics } from "@/lib/dal/analytics"
import { getProjectById } from "@/lib/dal/project"
import { checkRateLimit } from "@/lib/rate-limit"
import { notFound } from "next/navigation"

export const maxDuration = 30

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please log in to continue" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { workspaceSlug, projectId } = body as { workspaceSlug?: string; projectId?: string }
  if (!workspaceSlug || !projectId) {
    return NextResponse.json({ error: "Missing workspaceSlug or projectId" }, { status: 400 })
  }

  const membership = await getWorkspaceMembership(workspaceSlug, session.user.id)
  if (!membership) {
    return NextResponse.json(
      { error: "You do not have access to this workspace" },
      { status: 403 }
    )
  }

  const project = await getProjectById(projectId)
  if (!project || project.workspaceId !== membership.workspaceId) {
    notFound()
  }

  const analytics = await getProjectAnalytics(projectId, membership.workspaceId)

  const limit = checkRateLimit(`ai:${session.user.id}`, 20, 60 * 60 * 1000)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many AI requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
        },
      }
    )
  }

  const stats = {
    total: analytics.total,
    todo: analytics.byStatus.todo,
    inProgress: analytics.byStatus["in-progress"],
    inReview: analytics.byStatus["in-review"],
    done: analytics.byStatus.done,
    overdue: analytics.overdue,
  }

  const result = streamText({
    model: geminiFlash,
    prompt: buildSummaryPrompt({ projectName: project.name, stats }),
    maxOutputTokens: 150,
    temperature: 0.6,
    abortSignal: request.signal,
    onError: ({ error }) => {
      console.error("AI stream error:", error)
    },
  })

  return result.toTextStreamResponse()
}
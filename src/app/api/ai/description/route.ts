import { NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { auth } from "@/lib/auth"
import { geminiFlash } from "@/lib/ai"
import { buildDescriptionPrompt } from "@/lib/ai-prompts"
import { getWorkspaceMembership } from "@/lib/dal/workspace"
import { checkRateLimit } from "@/lib/rate-limit"
import { streamDescriptionRequestSchema } from "@/lib/validations/ai"

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

  const parsed = streamDescriptionRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const { workspaceSlug, title, projectName, context } = parsed.data

  const membership = await getWorkspaceMembership(workspaceSlug, session.user.id)
  if (!membership) {
    return NextResponse.json(
      { error: "You do not have access to this workspace" },
      { status: 403 }
    )
  }

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

  const result = streamText({
    model: geminiFlash,
    prompt: buildDescriptionPrompt({ title, projectName, context }),
    maxOutputTokens: 200,
    temperature: 0.7,
    abortSignal: request.signal,
    onError: ({ error }) => {
      console.error("AI stream error:", error)
    },
  })

  return result.toTextStreamResponse()
}
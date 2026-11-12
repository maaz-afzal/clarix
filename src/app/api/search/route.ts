import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getWorkspaceMembership } from "@/lib/dal/workspace";
import { searchWorkspace } from "@/lib/dal/search";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Please log in to continue" },
      { status: 401 },
    );
  }

  const { searchParams } = request.nextUrl;
  const workspaceSlug = searchParams.get("workspaceSlug");
  const q = searchParams.get("q")?.trim() ?? "";

  if (!workspaceSlug) {
    return NextResponse.json(
      { error: "workspaceSlug is required" },
      { status: 400 },
    );
  }
  if (q.length < 2 || q.length > 100) {
    return NextResponse.json(
      { error: "Query must be between 2 and 100 characters" },
      { status: 400 },
    );
  }

  const membership = await getWorkspaceMembership(
    workspaceSlug,
    session.user.id,
  );
  if (!membership) {
    return NextResponse.json(
      { error: "You do not have access to this workspace" },
      { status: 403 },
    );
  }

  const limit = checkRateLimit(`search:${session.user.id}`, 60, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many search requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const results = await searchWorkspace(membership.workspaceId, q);

  return NextResponse.json(results, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

# Routing Behavior Documentation

## Project Structure

```
src/app/(main)/[workspaceSlug]/
├── layout.tsx                    # WorkspaceShell with sidebar
├── projects/
│   ├── page.tsx                  # Project list
│   └── [projectId]/
│       ├── layout.tsx            # Project layout (provides modal slot)
│       ├── @modal/
│       │   ├── default.tsx       # Empty default for parallel route
│       │   └── (.)tasks/[taskId]/page.tsx  # Intercepted modal route
│       ├── tasks/[taskId]/
│       │   ├── page.tsx          # Full page route
│       │   └── loading.tsx       # Page loading skeleton
│       ├── board/page.tsx        # Kanban board
│       └── list/page.tsx         # Task list view
├── dashboard/page.tsx
├── tasks/page.tsx
├── tasks/[taskId]/page.tsx
├── search/page.tsx
└── notifications/page.tsx
```

---

## Test 4: Modal Open + F5 Refresh

**Behavior**: When modal is open and F5 is pressed, the full task page loads (not the modal).

**Why**: F5 triggers a hard navigation (full page reload). The browser requests the actual URL `/projects/[projectId]/tasks/[taskId]`, which matches the page route, not the intercepted route. The interception only works for client-side navigation (Next.js router.push/Link).

---

## Test 6: Dashboard/Search/Notifications → Task Link

**Observation**: Clicking a task link from Dashboard, Search, or Notifications opens the **full page**, not the modal.

**Evidence from code**:
- **Dashboard** (`overdue-tasks.tsx:35`, `my-tasks.tsx:42`): `href={`/${workspaceSlug}/projects/${task.projectId}/tasks/${task._id}`}`
- **Search** (`search-results.tsx:82`): `href={`/${workspaceSlug}/projects/${task.projectId}/tasks/${task._id}`}`
- **Notifications** (`notification-list.tsx:122`): `href={notification.link}` where link is set to full page URL in `notifications.ts:65`

**Why**: These pages are **outside** the `projects/[projectId]/layout.tsx` that defines the `@modal` slot. Interception only works for navigations that originate from within the same layout segment. Since Dashboard, Search, and Notifications are siblings of `projects/[projectId]` in the route tree, their links target the actual page route, not the intercepted modal route.

**Result**: ✅ Full page opens (expected behavior for cross-section navigation)

---

## Test 8: Modal Comment Add → List Update

**Observation**: After adding a comment in the modal, the new comment does **not** appear in the list immediately.

**Root Cause**: The `addComment` action uses `revalidatePath` with the full page URL:
```typescript
// actions/comment.ts:57-59
revalidatePath(`/${workspaceSlug}/projects/${task.projectId.toString()}/tasks/${taskId}`);
```

However, the modal is rendered at the intercepted route `/projects/[projectId]/@modal/(.)tasks/[taskId]`, which is a **different path**. `revalidatePath` only invalidates the specific path given, so the intercepted view doesn't revalidate.

**Fix Applied**: Added `router.refresh()` after `reset()` in `comment-section.tsx` to force a client-side re-fetch of the server component data.

```typescript
// comment-section.tsx:57
reset();
router.refresh();
```

This triggers a fresh request for the intercepted route's server component, which re-fetches comments.

---

## Routing Architecture Summary

| Navigation Origin | Target | Result |
|-------------------|--------|--------|
| Kanban Board (`board/page.tsx`) | Task link | Modal (intercepted) |
| Task List (`list/page.tsx`) | Task link | Modal (intercepted) |
| Dashboard | Task link | Full page |
| Search | Task link | Full page |
| Notifications | Task link | Full page |
| Direct URL / F5 | Task URL | Full page |
| Browser Back (from modal) | Previous page | Closes modal, stays on board/list |

---

## Key Technical Details

### Parallel Route Interception
- `@modal` is a parallel route slot defined in `projects/[projectId]/layout.tsx`
- `(.)tasks/[taskId]` intercepts `tasks/[taskId]` for client-side navigation
- `default.tsx` returns `null` to show nothing when no modal is open

### Loading States
- `tasks/[taskId]/loading.tsx` → Full page skeleton
- `@modal/(.)tasks/[taskId]/loading.tsx` → Modal skeleton (inside TaskModal)

### Cache Behavior
- Server components are cached by path
- `revalidatePath` invalidates by exact path match
- Intercepted route has different path → separate cache entry
- `router.refresh()` forces re-fetch of current route's server components

---

*Generated: 2026-11-19*
*Next.js: 16.3.4 | React: 19*
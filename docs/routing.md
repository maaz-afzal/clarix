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
├── search/page.tsx
└── notifications/page.tsx
```

---

## Test 4: Modal Open + F5 Refresh

### Observed in browser
When modal is open and F5 is pressed, the full task page loads (not the modal).

### Reasoned from code
F5 triggers a hard navigation (full page reload). The browser requests the actual URL `/projects/[projectId]/tasks/[taskId]`, which matches the page route, not the intercepted route. The interception only works for client-side navigation (Next.js router.push/Link).

---

## Test 6: Dashboard/Search/Notifications → Task Link

### Observed in browser
Clicking a task link from Dashboard, Search, or Notifications opens the **full page**, not the modal.

### Reasoned from code
These pages are **outside** the `projects/[projectId]/layout.tsx` that defines the `@modal` slot. Interception only works for navigations that originate from within the same layout segment. Since Dashboard, Search, and Notifications are siblings of `projects/[projectId]` in the route tree, their links target the actual page route, not the intercepted modal route.

**Evidence from code**:
- Dashboard (`overdue-tasks.tsx:35`, `my-tasks.tsx:42`): `href={`/${workspaceSlug}/projects/${task.projectId}/tasks/${task._id}`}`
- Search (`search-results.tsx:82`): `href={`/${workspaceSlug}/projects/${task.projectId}/tasks/${task._id}`}`
- Notifications (`notification-list.tsx:122`): `href={notification.link}` where link is set to full page URL in `notifications.ts:65`

**Result**: ✅ Full page opens (expected behavior for cross-section navigation)

---

## Test 8: Modal Comment Add → List Update

### Observed in browser
After adding a comment in the modal, the new comment does **not** appear in the list immediately.

### Fix applied
Added `router.refresh()` after `reset()` in `comment-section.tsx:60` to force a client-side re-fetch of the server component data.

### Root Cause
Hypothesis (not verified): The `revalidatePath` in the server action targets the page route, but the intercepted modal route may have a separate cache entry. `router.refresh()` forces re-fetch of the current route's server components regardless of cache.

---

## Additional Observations

### ProjectHeader active tab state
**Observed in browser**: When modal is open, no tab in ProjectHeader shows as active.

**Reasoned from code**: The modal URL is `/projects/[projectId]/tasks/[taskId]`, which doesn't match any of the ProjectHeader tab paths (board, list, analytics). The header's active state logic only checks for those specific paths.

### Modal open latency
**Observed in browser**: Modal appears within ~100-200ms after clicking a task card on the board/list.

**Reasoned from code**: The intercepted route uses a server component (`@modal/(.)tasks/[taskId]/page.tsx`) which must fetch task data before streaming the response. The `loading.tsx` skeleton shows immediately while the server component resolves.

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
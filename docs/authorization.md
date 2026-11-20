# Authorization Rules

## Shared Task Modify Rule

**Function:** `canModifyTask(task, userId, role)` in `src/lib/authorization.ts`

**Rule:** A user can modify a task (change status) if they are:
1. **Owner or Admin** (has `task_update_any` permission), OR
2. **Task Creator** (`task.createdBy === userId`), OR
3. **Task Assignee** (`task.assigneeId === userId`)

**Why include assignee?**
- If an admin assigns a task to a member, that member should be able to update it (status, priority, etc.)
- Without this, assigned members couldn't move their own tasks to "Done"
- Product decision: assignee shares ownership for updates

## Where Used

| Location | Purpose |
|----------|---------|
| `verifyTaskAccess` (authorization.ts) | Validates `update` action for sidebar, list view, page |
| `updateTaskPositions` (actions/task.ts) | Validates status changes during Kanban drag (position-only changes allowed for all) |

## Permission Matrix

| Role | Change Status | Reorder (Same Column) | Delete |
|------|---------------|----------------------|--------|
| Owner | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ |
| Member (Creator) | ✅ | ✅ | ❌ |
| Member (Assignee) | ✅ | ✅ | ❌ |
| Member (Other) | ❌ | ✅ | ❌ |

- **Change Status**: Moving between columns (Todo → In Progress, etc.)
- **Reorder (Same Column)**: Drag up/down within same status column
- **Delete**: Only Owner/Admin

## Fix Applied

1. **`verifyTaskAccess`** - Now uses `canModifyTask` for `update` action. Also returns `NOT_FOUND` for missing/other-workspace tasks (hides existence).
2. **`updateTaskPositions`** - Pre-checks all updates: if any status change violates `canModifyTask`, entire batch rejected with `FORBIDDEN`. Position-only changes within same column still allowed for all members.
3. **`callAction`** helper - Catches network errors in client, shows server's actual error message (e.g., "You do not have permission to do this").

## Hinglish → English Strings Fixed

| File | Before | After |
|------|--------|-------|
| `notification-list.tsx:45` | "Mark nahi ho saka" | "Could not mark as read" |
| `invite/[token]/page.tsx:40` | "Home pe jao" | "Go to Home" |
| `actions/ai.ts:135` | "Project mein tasks hone chahiye summary ke liye" | "Project must have tasks to generate a summary" |
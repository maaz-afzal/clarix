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

| Role | Change Status | Reorder (Same Column) | Delete | Observed |
|------|---------------|----------------------|--------|----------|
| Owner | ✅ | ✅ | ✅ | ✅ All actions work |
| Admin | ✅ | ✅ | ✅ | ✅ All actions work |
| Member (Creator) | ✅ | ✅ | ❌ | ✅ Can change status, reorder; delete blocked |
| Member (Assignee) | ✅ | ✅ | ❌ | ✅ Can change status, reorder; delete blocked |
| Member (Other) | ❌ | ✅ | ❌ | ✅ Can reorder within column; status change blocked with toast |

- **Change Status**: Moving between columns (Todo → In Progress, etc.)
- **Reorder (Same Column)**: Drag up/down within same status column
- **Delete**: Only Owner/Admin
- **Observed**: What was actually seen in browser testing

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

## Questions & Answers

### 1. CreateTask assigneeId validation

**Issue:** In `createTask`, a member can pass any `assigneeId` string when creating a task — even a user who is not a member of the workspace. The server only validates that it's a valid ObjectId, not that the user belongs to the workspace.

**Why it matters:** Could assign tasks to non-members, creating orphaned assignments and potential confusion.

**How to check:** In `createTask` (actions/task.ts), after parsing input, query `WorkspaceMember` for the given `assigneeId` and `workspaceId`. If not found, return validation error: "Assignee must be a workspace member."

### 2. Drag prevention UX

**Observed:** Member can drag a card they can't modify — it snaps back with a toast. This is confusing.

**Fix applied:** Added `disabled: !canDrag` to `useSortable` in `SortableTaskCard`. Now cards that the user cannot modify (based on `canModifyTask` logic) are not draggable at all. Visual cue: cursor stays default, no drag ghost. Server-side check in `updateTaskPositions` remains as safety net.

### 3. Authorization matrix test

**Observed results** filled in the Permission Matrix "Observed" column above. All roles behave as expected per the shared `canModifyTask` rule.
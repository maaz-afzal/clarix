# Authorization Rules

## Current State (Mismatch)

| Action | Rule |
|--------|------|
| `updateTask` (sidebar, list select) | Only task creator (`task_update_own`) or admin/owner (`task_update_any`) can update. Members cannot update others' tasks. |
| `updateTaskPositions` (Kanban drag) | **Any workspace member** can change any task's status/position. No creator check. |

## Correct Rule

**Only the task creator (or admin/owner) should be able to change a task's status.**

**Why:**
- Status changes are semantic updates to task ownership/progress, not just visual reordering.
- Allowing any member to move any task to "Done" or change status breaks accountability.
- The Kanban drag is a UI affordance for the same action (`status` field update) — it must enforce the same permission.
- `updateTaskPositions` should verify `task_update_own` / `task_update_any` before applying status changes, same as `updateTask`.

## Fix Required (Not Applied Yet)

In `updateTaskPositions` (actions/task.ts), add creator/admin check before allowing status change:
- If `u.status !== current.status`, verify `hasPermission(role, "task_update_any")` OR `current.createdBy === userId`.
- Position-only changes within same column can remain open to all members (reordering).
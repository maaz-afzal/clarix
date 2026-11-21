# Tenant Isolation Audit

## grep Results Analysis

| File | Line | Method | Scoped? | Guard | Notes |
|------|------|--------|---------|-------|-------|
| `src/actions/user.ts` | 33 | `User.findByIdAndUpdate` | ✅ Yes | Current user session | Updates own profile only |
| `src/actions/members.ts` | 130 | `WorkspaceMember.findByIdAndDelete` | ✅ Yes | `verifyPermission("member_remove")` + workspace-scoped findOne first |
| `src/actions/members.ts` | 263 | `Invitation.findByIdAndUpdate` | ✅ Yes | Invitation fetched by token, not ID |
| `src/actions/members.ts` | 275 | `Invitation.findByIdAndUpdate` | ✅ Yes | Same invitation from token lookup |
| `src/actions/task.ts` | 194 | `Task.findByIdAndUpdate` | ✅ Yes | `verifyTaskAccess` guards workspace + permissions |
| `src/actions/task.ts` | 251 | `Task.findByIdAndDelete` | ✅ Yes | `verifyTaskAccess` guards workspace + permissions |
| `src/actions/attachment.ts` | 32 | `Attachment.findById` | ✅ Yes | Workspace ID check on line 37-39 |
| `src/actions/attachment.ts` | 53 | `Attachment.findByIdAndDelete` | ✅ Yes | Same attachment from scoped findById |
| `src/actions/project.ts` | 206 | `Project.findByIdAndDelete` | ✅ Yes | Workspace-scoped findOne first (line 195-198) |
| `src/actions/comment.ts` | 91 | `Comment.findByIdAndDelete` | ✅ Yes | `findCommentInWorkspace` scopes to workspace |
| `src/app/api/upload/route.ts` | 92 | `Task.findById` | ✅ Yes | Workspace membership + task workspace check |
| `src/lib/dal/task.ts` | 189 | `Task.findById` | ❌ No | Caller responsibility (pages use `requireWorkspaceMember` + post-check) |
| `src/lib/dal/project.ts` | 77 | `Project.findById` | ❌ No | Caller responsibility (ProjectLayout + pages verify) |

## Unscoped DAL Functions

### `src/lib/dal/task.ts:189` - `getTaskById`
- **Status**: Not workspace-scoped
- **Callers**: 
  - TaskDetailView (verifies via `requireWorkspaceMember` + post-check on lines 33-39)
  - TaskDetailPage generateMetadata (no verification - metadata only)
  - ProjectLayout for navProjects (verifies in layout)
- **Risk**: Low - all server component callers verify workspace membership before or after

### `src/lib/dal/project.ts:77` - `getProjectById`
- **Status**: Not workspace-scoped
- **Callers**:
  - ProjectLayout (verifies on lines 22-24)
  - Board/List/Analytics pages (verify after fetch)
  - generateMetadata functions (no verification - metadata only)
- **Risk**: Low - all server component callers verify workspace membership

## No Unprotected IDOR Found

All direct database operations in actions are properly guarded by:
1. Workspace membership verification (`verifyWorkspaceMember`, `requireWorkspaceMember`)
2. Workspace-scoped queries (`workspaceId` in query)
3. Post-fetch ownership/permission checks (`verifyTaskAccess`, `canModifyTask`)

## Recommendations

1. **Add workspaceId to DAL findById functions** for defense in depth:
   ```typescript
   // In getTaskById
   const task = await Task.findOne({ _id: taskId, workspaceId }).lean();
   
   // In getProjectById  
   const project = await Project.findOne({ _id: projectId, workspaceId }).lean();
   ```

2. **Add workspaceId parameter** to DAL functions or use a context pattern

3. **Metadata leakage**: generateMetadata functions call unscoped DAL functions - could leak names in SEO metadata. Low risk but fixable.
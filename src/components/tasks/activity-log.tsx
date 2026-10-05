import { formatRelativeTime } from "@/lib/utils";
import type { ActivityItem } from "@/lib/dal/comments";

function getActivityMessage(
  action: string,
  metadata: Record<string, unknown>,
): string {
  switch (action) {
    case "task_created":
      return "created this task";
    case "task_status_changed":
      return `changed status: ${metadata.from} → ${metadata.to}`;
    case "task_assigned":
      return `assigned to: ${metadata.assigneeName ?? "someone"}`;
    case "comment_added":
      return "added a comment";
    default:
      return `performed ${action.replace(/_/g, " ")}`;
  }
}

interface ActivityLogProps {
  activities: ActivityItem[];
}

export default function ActivityLog({ activities }: ActivityLogProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No activity yet</p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity._id} className="flex gap-3">
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
            {activity.user.image ? (
              <img
                src={activity.user.image}
                alt={activity.user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                {activity.user.name[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              <span className="text-muted-foreground">
                {getActivityMessage(activity.action, activity.metadata)}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatRelativeTime(activity.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

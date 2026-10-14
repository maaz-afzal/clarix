import { formatRelativeTime } from "@/lib/utils";
import type { RecentActivityItem } from "@/lib/dal/dashboard";

function getActivityText(
  action: string,
  metadata: Record<string, unknown>,
  projectName?: string,
): string {
  const project = projectName ? ` in ${projectName}` : "";

  switch (action) {
    case "task_created":
      return `created task "${metadata.taskTitle ?? "Untitled"}"${project}`;
    case "task_status_changed":
      return `changed status from ${metadata.from} to ${metadata.to}${project}`;
    case "task_assigned":
      return `assigned a task${project}`;
    default:
      return `${action.replace(/_/g, " ")}${project}`;
  }
}

interface ActivityFeedProps {
  activities: RecentActivityItem[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No recent activity
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity._id} className="flex gap-3">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
            {activity.user.image ? (
              <img
                src={activity.user.image}
                alt={activity.user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-primary">
                {activity.user.name[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              <span className="text-muted-foreground">
                {getActivityText(
                  activity.action,
                  activity.metadata,
                  activity.projectName,
                )}
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

import { formatRelativeTime } from "@/lib/utils";
import type { RecentActivityItem } from "@/lib/dal/dashboard";
import UserAvatar from "@/components/shared/user-avatar";

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
          <UserAvatar name={activity.user.name} image={activity.user.image} size={28} />
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

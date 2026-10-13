"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatRelativeTime } from "@/lib/utils";
import { markNotificationRead, markAllRead } from "@/actions/notification";
import type { NotificationItem } from "@/lib/dal/notifications";

const NOTIFICATION_ICONS: Record<string, string> = {
  assignment: "📋",
  comment: "💬",
  invitation: "✉️",
  mention: "@",
  due_date: "📅",
};

interface NotificationListProps {
  notifications: NotificationItem[];
  workspaceSlug: string;
  workspaceId: string;
}

export default function NotificationList({
  notifications,
  workspaceSlug,
  workspaceId,
}: NotificationListProps) {
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function handleMarkRead(notificationId: string) {
    startTransition(async () => {
      await markNotificationRead(workspaceSlug, notificationId);
    });
  }

  function handleMarkAllRead() {
    if (unreadCount === 0) return;
    startTransition(async () => {
      const result = await markAllRead(workspaceSlug, workspaceId);
      if (!result.success) toast.error("Mark nahi ho saka");
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bell className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="font-medium">No notifications</p>
        <p className="text-sm text-muted-foreground mt-1">
          When there's activity, it will show up here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Mark all read */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications */}
      {notifications.map((notification) => {
        const icon = NOTIFICATION_ICONS[notification.type] ?? "🔔";

        const content = (
          <div
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border transition-colors",
              !notification.isRead
                ? "bg-primary/5 border-primary/20"
                : "bg-card border-border",
              notification.link && "cursor-pointer hover:bg-accent",
            )}
          >
            <span className="text-lg shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
              <p
                className={cn("text-sm", !notification.isRead && "font-medium")}
              >
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRelativeTime(notification.createdAt)}
              </p>
            </div>
            {!notification.isRead && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMarkRead(notification._id);
                }}
                disabled={isPending}
                className="text-xs text-muted-foreground hover:text-foreground shrink-0 mt-1 disabled:opacity-50"
                title="Mark as read"
              >
                ✕
              </button>
            )}
          </div>
        );

        if (notification.link) {
          return (
            <Link
              key={notification._id}
              href={notification.link}
              onClick={() =>
                !notification.isRead && handleMarkRead(notification._id)
              }
            >
              {content}
            </Link>
          );
        }

        return <div key={notification._id}>{content}</div>;
      })}
    </div>
  );
}

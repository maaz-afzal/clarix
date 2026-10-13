import { requireWorkspaceMember } from "@/lib/authorization";
import { getNotifications } from "@/lib/dal/notifications";
import NotificationList from "@/components/notifications/notification-list";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notifications" };

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export default async function NotificationsPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const { user, membership } = await requireWorkspaceMember(workspaceSlug);

  const notifications = await getNotifications(user.id, membership.workspaceId);

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
      </div>

      <NotificationList
        notifications={notifications}
        workspaceSlug={workspaceSlug}
        workspaceId={membership.workspaceId}
      />
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from "@/lib/validations/members";
import { inviteMember } from "@/actions/members";

interface InviteMemberFormProps {
  workspaceSlug: string;
}

export default function InviteMemberForm({
  workspaceSlug,
}: InviteMemberFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { role: "member" },
  });

  function onSubmit(data: InviteMemberInput) {
    startTransition(async () => {
      const result = await inviteMember(workspaceSlug, data);

      if (!result.success) {
        toast.error(result.error || "Could not send invitation");
        return;
      }

      toast.success("Invitation sent!");
      reset();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <input
            {...register("email")}
            type="email"
            placeholder="colleague@company.com"
            disabled={isPending}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <select
            {...register("role")}
            disabled={isPending}
            className="px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 h-9.5"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap h-9.5"
        >
          {isPending ? "Sending invitation..." : "Invite"}
        </button>
      </div>
    </form>
  );
}

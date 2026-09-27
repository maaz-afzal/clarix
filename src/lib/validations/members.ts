import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().email("Valid email address required").toLowerCase().trim(),
  role: z.enum(["admin", "member"], {
    errorMap: () => ({ message: "Role must be either admin or member" }),
  }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

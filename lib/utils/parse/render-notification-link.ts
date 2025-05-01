import { Role } from "@/db/schemas";

export default function renderNotificationLink({
  type,
  role,
  id,
}: {
  type: "notice" | "inquiries" | "documents";
  role: Role;
  id: number;
}) {
  if (role === Role.SUPERADMIN) {
    return `/super-admin/${type}/${id.toString()}`;
  }
  if (role === Role.ADMIN) {
    return `/admin/${type}/${id.toString()}`;
  }

  if (role === Role.USER) {
    return `/user/${type}/${id.toString()}`;
  }

  return "404";
}

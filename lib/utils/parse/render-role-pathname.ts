import { Role } from "@/db/schemas";

export default function renderBaseRolePathname(role: Role) {
  switch (role) {
    case Role.SUPERADMIN:
      return "super-admin";
    case Role.ADMIN:
      return "admin";
    case Role.USER:
      return "user";
  }
}

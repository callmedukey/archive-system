import { Role } from "@/db/schemas";

export default function renderRole(role: Role) {
  switch (role) {
    case Role.SUPERADMIN:
      return "총괄 관리자";
    case Role.ADMIN:
      return "관리자";
    case Role.USER:
      return "사용자";
  }
}

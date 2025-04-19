import { Role } from "@/db/schemas";

export default function renderRoleName(
  currentRole: Role,
  authorRole: Role,
  islandName?: string
) {
  switch (currentRole) {
    case Role.SUPERADMIN:
      if (authorRole === Role.SUPERADMIN) {
        return "총괄관리자";
      }
      if (authorRole === Role.ADMIN) {
        return "총괄관리자";
      }
      if (authorRole === Role.USER) {
        return islandName ?? "등록자";
      }
    case Role.ADMIN:
      if (authorRole === Role.SUPERADMIN) {
        return "총괄관리자";
      }
      if (authorRole === Role.ADMIN) {
        return "관리자";
      }
      if (authorRole === Role.USER) {
        return islandName ?? "등록자";
      }
    case Role.USER:
      if (authorRole === Role.SUPERADMIN) {
        return "총괄관리자";
      }
      if (authorRole === Role.ADMIN) {
        return `${islandName} 관리자`;
      }
      if (authorRole === Role.USER) {
        return islandName ?? "등록자";
      }
    default:
      return "알수없음";
  }
}

import { DocumentStatus } from "@/db/schemas";

const statusLabels: Record<DocumentStatus, string> = {
  [DocumentStatus.SUBMITTED]: "제출됨",
  [DocumentStatus.EDIT_REQUESTED]: "보완요청",
  [DocumentStatus.EDIT_COMPLETED]: "보완완료",
  [DocumentStatus.UNDER_REVIEW]: "검토중",
  [DocumentStatus.APPROVED]: "검토완료",
};

export default statusLabels;

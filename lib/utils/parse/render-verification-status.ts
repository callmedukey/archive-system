import { VerificationStatus } from "@/db/schemas";

export default function renderVerificationStatus(status: VerificationStatus) {
  switch (status) {
    case VerificationStatus.VERIFIED:
      return "승인";
    case VerificationStatus.UNVERIFIED:
      return "미승인";
    case VerificationStatus.VERIFICATION_PENDING:
      return "승인대기";
    default:
      return "알 수 없음";
  }
}

export function renderVerificationStatusMessage({
  status,
  username,
}: {
  status: VerificationStatus;
  username: string;
}) {
  switch (status) {
    case VerificationStatus.UNVERIFIED:
      return `${username} 계정은 현재 가입이 접수된 상태입니다. 승인이 완료되면 이용하실 수 있으니 잠시 후 다시 확인해 주시기 바랍니다.`;
    case VerificationStatus.VERIFICATION_PENDING:
      return `${username} 계정은 현재 승인 검토 중입니다. 승인이 완료되면 이용하실 수 있으니 잠시 후 다시 확인해 주시기 바랍니다.`;
    default:
      return "알 수 없음";
  }
}

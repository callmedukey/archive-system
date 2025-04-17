export enum ErrorCode {
  InvalidCredentials = "InvalidCredentials",
  InvalidPassword = "InvalidPassword",
  UserNotFound = "UserNotFound",
}

export function renderErrorMessage(errorCode: string) {
  switch (errorCode) {
    case ErrorCode.UserNotFound:
      return "존재하지 않는 아이디입니다.";
    case ErrorCode.InvalidCredentials:
      return "아이디 또는 비밀번호가 일치하지 않습니다.";
    case ErrorCode.InvalidPassword:
      return "비밀번호가 일치하지 않습니다.";
  }
}

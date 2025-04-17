"use client";
import Link from "next/link";
import { useActionState } from "react";

import { login } from "@/app/(auth)/actions/auth";
import InputWithLabelAndError from "@/components/shared/input-with-label-and-error";
import PasswordWithLabelAndError from "@/components/shared/password-with-label-and-error.tsx";
import SubmitButton from "@/components/shared/subtmit-button";
import { Button } from "@/components/ui/button";
import { Role } from "@/db/schemas";
import { UserSignUpSchemaType } from "@/lib/schemas/auth/signup.schema";
import { renderErrorMessage } from "@/lib/utils/parse/render-error-message";
import { ActionResponse } from "@/types/action";

const initialState: ActionResponse<UserSignUpSchemaType> = {
  success: false,
  message: "",
};

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, isPending] = useActionState(login, initialState);

  return (
    <form action={action} className="space-y-2">
      {state.errorCode && (
        <p className="text-destructive text-xs text-center">
          {renderErrorMessage(state.errorCode)}
        </p>
      )}
      <InputWithLabelAndError
        label={redirectTo === "/user" ? "섬 이름 (아이디)" : "아이디"}
        name="username"
        type="text"
        error={state.errors?.username?.[0]}
        defaultValue={state.inputs?.username}
      />
      <PasswordWithLabelAndError
        label="비밀번호"
        name="password"
        error={state.errors?.password?.[0]}
        defaultValue={state.inputs?.password}
      />
      {state?.message && (
        <p className="text-center text-sm text-muted-foreground">
          {state.message}
        </p>
      )}
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input
        type="hidden"
        name="role"
        value={redirectTo === "/user" ? Role.USER : Role.ADMIN}
      />
      <SubmitButton
        type="submit"
        disabled={isPending}
        className="w-full disabled:opacity-50 mt-4"
        loading={isPending}
      >
        로그인
      </SubmitButton>
      <Button asChild variant="outline">
        <Link href="/signup" className="w-full">
          회원가입
        </Link>
      </Button>
    </form>
  );
}

export default LoginForm;

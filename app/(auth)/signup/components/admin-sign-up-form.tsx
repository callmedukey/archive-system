"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import InputWithLabelAndError from "@/components/shared/input-with-label-and-error";
import PasswordWithLabelAndError from "@/components/shared/password-with-label-and-error.tsx";
import SelectWithLabel from "@/components/shared/select-with-label";
import SubmitButton from "@/components/shared/subtmit-button";
import { Button } from "@/components/ui/button";
import { AdminSignUpSchemaType } from "@/lib/schemas/auth/signup.schema";
import { ActionResponse } from "@/types/action";

import { adminSignup } from "../../actions/auth";

const initialState: ActionResponse<AdminSignUpSchemaType> = {
  success: false,
  message: "",
};

export function AdminSignUpForm({
  regionsOptions,
}: {
  regionsOptions: { label: string; value: string }[];
}) {
  const [state, action, isPending] = useActionState(adminSignup, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success === true) {
      toast.success(state.message);
      router.replace("/login");
    }
  }, [state.success, state.message, router]);

  return (
    <form action={action} className="space-y-2">
      <SelectWithLabel
        label="권역"
        name="region"
        options={regionsOptions}
        placeholder="권역을 선택해주세요."
        error={state.errors?.region?.[0]}
        defaultValue={state.inputs?.region}
      />
      <InputWithLabelAndError
        label="아이디"
        name="username"
        type="text"
        error={state.errors?.username?.[0]}
        defaultValue={state.inputs?.username}
      />
      <InputWithLabelAndError
        label="이메일"
        name="email"
        type="email"
        error={state.errors?.email?.[0]}
        defaultValue={state.inputs?.email}
      />
      <InputWithLabelAndError
        label="연락처"
        name="phone"
        type="tel"
        error={state.errors?.phone?.[0]}
        defaultValue={state.inputs?.phone}
      />
      <PasswordWithLabelAndError
        label="비밀번호"
        name="password"
        error={state.errors?.password?.[0]}
        defaultValue={state.inputs?.password}
      />
      <PasswordWithLabelAndError
        label="비밀번호 확인"
        name="confirmPassword"
        error={state.errors?.confirmPassword?.[0]}
        defaultValue={state.inputs?.confirmPassword}
      />
      {state?.message && (
        <p className="text-center text-sm text-muted-foreground">
          {state.message}
        </p>
      )}
      <SubmitButton
        type="submit"
        disabled={isPending}
        className="w-full disabled:opacity-50 mt-4"
        loading={isPending}
      >
        회원가입
      </SubmitButton>
      <Button asChild variant="outline">
        <Link href="/login" className="w-full">
          뒤로가기
        </Link>
      </Button>
    </form>
  );
}

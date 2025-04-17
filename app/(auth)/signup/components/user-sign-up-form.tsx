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
import { UserSignUpSchemaType } from "@/lib/schemas/auth/signup.schema";
import { ActionResponse } from "@/types/action";

import { userSignup } from "../../actions/auth";
const initialState: ActionResponse<UserSignUpSchemaType> = {
  success: false,
  message: "",
};

interface UserSignUpFormProps {
  regionsOptions: { label: string; value: string }[];
}

export function UserSignUpForm({ regionsOptions }: UserSignUpFormProps) {
  const [state, action, isPending] = useActionState(userSignup, initialState);
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
        placeholder="권역을 선택해주세요."
        options={regionsOptions}
        defaultValue={state.inputs?.region}
        error={state.errors?.region?.[0]}
      />
      <InputWithLabelAndError
        label="섬 이름 (아이디)"
        name="username"
        type="text"
        error={state.errors?.username?.[0]}
        defaultValue={state.inputs?.username}
      />
      <SelectWithLabel
        label="사업단계"
        name="level"
        options={[
          { label: "1단계", value: 1 },
          { label: "2단계", value: 2 },
          { label: "3단계", value: 3 },
          { label: "4단계", value: 4 },
        ]}
        defaultValue={state.inputs?.level || 1}
        error={state.errors?.level?.[0]}
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
      <InputWithLabelAndError
        label="회사명"
        name="company"
        type="text"
        error={state.errors?.company?.[0]}
        defaultValue={state.inputs?.company}
      />
      <InputWithLabelAndError
        label="회사 연락처"
        name="companyPhone"
        type="tel"
        error={state.errors?.companyPhone?.[0]}
        defaultValue={state.inputs?.companyPhone}
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

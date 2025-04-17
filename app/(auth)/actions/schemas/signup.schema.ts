import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Role, users } from "@/db/schemas/auth";

const phoneRegex = /[()0-9\-]/;
const adminUsernameRegex = /^[a-zA-Z0-9]+$/;
const koreanUsernameRegex = /^[가-힣ㄱ-ㅎㅏ-ㅣ]+$/;

export const AdminSignUpSchema = createInsertSchema(users)
  .pick({
    email: true,
    password: true,
    username: true,
    phone: true,
  })
  .extend({
    email: z
      .string({ required_error: "이메일은 필수 입력 항목입니다." })
      .email("이메일 형식이 올바르지 않습니다.")
      .trim(),
    password: z
      .string({ required_error: "비밀번호는 필수 입력 항목입니다." })
      .trim()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    confirmPassword: z
      .string({ required_error: "비밀번호 확인은 필수 입력 항목입니다." })
      .trim()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    username: z
      .string({ required_error: "아이디는 필수 입력 항목입니다." })
      .trim()
      .min(4, "아이디는 최소 4자 이상이어야 합니다.")
      .regex(
        adminUsernameRegex,
        "아이디는 영문자와 숫자만 사용할 수 있습니다."
      ),
    phone: z
      .string({ required_error: "전화번호는 필수 입력 항목입니다." })
      .regex(phoneRegex, "전화번호 형식이 올바르지 않습니다.")
      .trim(),
    role: z.nativeEnum(Role).default(Role.ADMIN),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export type AdminSignUpSchemaType = z.infer<typeof AdminSignUpSchema>;

export const UserSignUpSchema = createInsertSchema(users)
  .pick({
    email: true,
    password: true,
    name: true,
    username: true,
    level: true,
    phone: true,
    company: true,
    companyPhone: true,
  })
  .extend({
    email: z
      .string({ required_error: "이메일은 필수 입력 항목입니다." })
      .email("이메일 형식이 올바르지 않습니다."),
    company: z.string({ required_error: "회사명은 필수 입력 항목입니다." }),
    companyPhone: z
      .string({ required_error: "회사 전화번호는 필수 입력 항목입니다." })
      .min(11, "회사 전화번호는 최소 11자 이상이어야 합니다.")
      .regex(phoneRegex, "회사 전화번호 형식이 올바르지 않습니다."),
    phone: z.string({ required_error: "전화번호는 필수 입력 항목입니다." }),
    password: z
      .string({ required_error: "비밀번호는 필수 입력 항목입니다." })
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    name: z
      .string({ required_error: "이름은 필수 입력 항목입니다." })
      .min(2, "이름은 최소 2자 이상이어야 합니다."),
    username: z
      .string({ required_error: "아이디는 필수 입력 항목입니다." })
      .min(2, "아이디는 최소 2자 이상이어야 합니다.")
      .regex(koreanUsernameRegex, "섬 이름을 이용해주세요."),
    level: z
      .number()
      .min(1, "사업단계는 1 이상이어야 합니다.")
      .max(4, "사업단계는 4 이하여야 합니다."),
    role: z.nativeEnum(Role).default(Role.USER),
  });

export type UserSignUpSchemaType = z.infer<typeof UserSignUpSchema>;

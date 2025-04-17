import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "@/db/schemas";

import { koreanUsernameRegex } from "./signup.schema";

export const LoginSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
  })
  .extend({
    username: z
      .string({ required_error: "아이디를 입력해주세요." })
      .trim()
      .min(1, "아이디를 입력해주세요."),
    password: z
      .string({ required_error: "비밀번호를 입력해주세요." })
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
  });

export type LoginSchemaType = z.infer<typeof LoginSchema>;

export const UserLoginSchema = LoginSchema.extend({
  username: z
    .string({ required_error: "아이디를 입력해주세요." })
    .trim()
    .min(1, "아이디를 입력해주세요.")
    .regex(koreanUsernameRegex, "섬 이름을 입력해주세요."),
});

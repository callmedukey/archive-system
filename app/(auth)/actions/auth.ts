"use server";

import { eq, and, or } from "drizzle-orm";
import { AuthError } from "next-auth";
import { ZodError } from "zod";

import { signIn } from "@/auth";
import { db } from "@/db";
import { Role, users, usersToRegions } from "@/db/schemas";
import { notifications } from "@/db/schemas/notifications";
import {
  LoginSchema,
  LoginSchemaType,
  UserLoginSchema,
} from "@/lib/schemas/auth/login.schema";
import {
  AdminSignUpSchema,
  AdminSignUpSchemaType,
  UserSignUpSchema,
  UserSignUpSchemaType,
} from "@/lib/schemas/auth/signup.schema";
import createSalt from "@/lib/utils/createSalt";
import { hashPassword } from "@/lib/utils/hashPassword";
import { ActionResponse } from "@/types/action";

export async function adminSignup(
  _: ActionResponse<AdminSignUpSchemaType> | null,
  formData: FormData
): Promise<ActionResponse<AdminSignUpSchemaType>> {
  const inputs = Object.fromEntries(
    formData
  ) as unknown as AdminSignUpSchemaType;
  const result = AdminSignUpSchema.safeParse(inputs);

  const response: ActionResponse<AdminSignUpSchemaType> = {
    success: false,
    message: "",
    inputs,
  };

  if (!result.success) {
    response.errors = result.error?.flatten().fieldErrors;
    response.message = "입력 항목을 확인해주세요.";
    return response;
  }

  const { email, password, username, phone, role, region } = result.data;

  const [user, emailUser] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.username, username),
    }),
    db.query.users.findFirst({
      where: eq(users.email, email),
    }),
  ]);

  if (user) {
    response.message = "이미 존재하는 아이디입니다.";
    return response;
  }

  if (emailUser) {
    response.message = "이미 존재하는 이메일입니다.";
    return response;
  }

  const hashed = await hashPassword(password, createSalt());

  try {
    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashed.hash,
        salt: hashed.salt,
        username,
        phone,
        role,
      })
      .returning();

    await db.insert(usersToRegions).values({
      userId: user.id,
      regionId: region,
    });

    const recipients = await db
      .select({ id: users.id })
      .from(users)
      .leftJoin(usersToRegions, eq(users.id, usersToRegions.userId))
      .where(
        or(
          eq(users.role, Role.SUPERADMIN),
          and(eq(users.role, Role.ADMIN), eq(usersToRegions.regionId, region))
        )
      );

    const recipientIds = recipients
      .map((r) => r.id)
      .filter((id) => id !== user.id);

    if (recipientIds.length > 0) {
      await db.insert(notifications).values(
        recipientIds.map((recipientId) => ({
          title: "관리자 계정 승인 요청",
          content: `새로운 관리자 ${username}님의 계정 승인이 필요합니다.`,
          userId: recipientId,
        }))
      );
    }

    response.success = true;
    response.message = "관리자 회원가입 신청이 완료되었습니다.";
    return response;
  } catch (error) {
    console.error(error);

    if (error instanceof ZodError) {
      response.errors = error.flatten().fieldErrors;
      response.message = "입력 항목을 확인해주세요.";
      return response;
    }

    response.message =
      "알 수 없는 오류가 발생했습니다. 관리자에게 문의해주세요.";
    return response;
  }
}

export async function userSignup(
  _: ActionResponse<UserSignUpSchemaType> | null,
  formData: FormData
): Promise<ActionResponse<UserSignUpSchemaType>> {
  const inputs = Object.fromEntries(
    formData
  ) as unknown as UserSignUpSchemaType;
  const result = UserSignUpSchema.safeParse(inputs);

  const response: ActionResponse<UserSignUpSchemaType> = {
    success: false,
    message: "",
    inputs,
  };

  if (!result.success) {
    response.errors = result.error?.flatten().fieldErrors;
    response.message = "입력 항목을 확인해주세요.";
    return response;
  }

  const {
    email,
    password,
    username,
    phone,
    role,
    company,
    companyPhone,
    level,
    region,
  } = result.data;

  const [user, emailUser] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.username, username),
    }),
    db.query.users.findFirst({
      where: eq(users.email, email),
    }),
  ]);

  if (user) {
    response.message = "이미 존재하는 아이디입니다.";
    return response;
  }

  if (emailUser) {
    response.message = "이미 존재하는 이메일입니다.";
    return response;
  }

  const hashed = await hashPassword(password, createSalt());

  try {
    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashed.hash,
        salt: hashed.salt,
        username,
        phone,
        role,
        company,
        companyPhone,
        level,
      })
      .returning();

    await db.insert(usersToRegions).values({
      userId: user.id,
      regionId: region,
    });

    const recipients = await db
      .select({ id: users.id })
      .from(users)
      .leftJoin(usersToRegions, eq(users.id, usersToRegions.userId))
      .where(
        or(
          eq(users.role, Role.SUPERADMIN),
          and(eq(users.role, Role.ADMIN), eq(usersToRegions.regionId, region))
        )
      );

    const recipientIds = recipients
      .map((r) => r.id)
      .filter((id) => id !== user.id);

    if (recipientIds.length > 0) {
      await db.insert(notifications).values(
        recipientIds.map((recipientId) => ({
          title: "등록자 계정 승인 요청",
          content: `새로운 등록자 ${username}님의 계정 승인이 필요합니다.`,
          userId: recipientId,
        }))
      );
    }

    response.success = true;
    response.message = "등록자 회원가입 신청이 완료되었습니다.";

    return response;
  } catch (error) {
    console.error(error);

    if (error instanceof ZodError) {
      response.errors = error.flatten().fieldErrors;
      response.message = "입력 항목을 확인해주세요.";
      return response;
    }

    response.message =
      "알 수 없는 오류가 발생했습니다. 관리자에게 문의해주세요.";
    return response;
  }
}

export async function login(
  _: ActionResponse<LoginSchemaType> | null,
  formData: FormData
): Promise<ActionResponse<LoginSchemaType>> {
  const inputs = Object.fromEntries(formData) as unknown as LoginSchemaType & {
    redirectTo: "/user" | "/admin";
    role: Role;
  };

  const response: ActionResponse<LoginSchemaType> = {
    success: false,
    message: "",
    inputs,
  };

  if (inputs.redirectTo !== "/user" && inputs.redirectTo !== "/admin") {
    response.message = "잘못된 접근입니다.";
    return response;
  }

  if (inputs.role !== Role.USER && inputs.role !== Role.ADMIN) {
    response.message = "잘못된 접근입니다.";
    return response;
  }

  let result;
  if (inputs.role === Role.USER) {
    result = UserLoginSchema.safeParse(inputs);
  } else {
    result = LoginSchema.safeParse(inputs);
  }

  if (!result.success) {
    response.errors = result.error?.flatten().fieldErrors;
    response.message = "입력 항목을 확인해주세요.";
    return response;
  }

  try {
    await signIn("credentials", {
      username: inputs.username,
      password: inputs.password,
      redirectTo: inputs.redirectTo,
      role: inputs.role,
    });

    response.success = true;
    response.message = "로그인이 완료되었습니다.";
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      if ("code" in error && typeof error.code === "string") {
        response.errorCode = error.code;
      }
      return response;
    }
    throw error;
  }
}

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { Role, User, users } from "@/db/schemas";
import renderBaseRolePathname from "@/lib/utils/parse/render-role-pathname";

export async function updateUser(userId: string, newUserData: Partial<User>) {
  const session = await auth();
  if (!session || session.user.role !== Role.SUPERADMIN) {
    return { error: "관리자 권한이 필요합니다." };
  }

  delete newUserData.id;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return { error: "존재하지 않는 사용자입니다." };
  }
  if (user.email === newUserData.email) {
    delete newUserData.email;
  }

  try {
    await db.update(users).set({
      ...newUserData,
    });
  } catch (error) {
    console.error(error);
    return { error: "사용자 정보 업데이트 중 오류가 발생했습니다." };
  }

  revalidatePath(`/${renderBaseRolePathname(session.user.role as Role)}/users`);

  return { success: "사용자 정보가 성공적으로 업데이트되었습니다." };
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session || session.user.role !== Role.SUPERADMIN) {
    return { error: "관리자 권한이 필요합니다." };
  }
  try {
    await db.delete(users).where(eq(users.id, userId));
  } catch (error) {
    console.error(error);
    return { error: "사용자 삭제 중 오류가 발생했습니다." };
  }

  revalidatePath(`/${renderBaseRolePathname(session.user.role as Role)}/users`);

  return { success: "사용자가 성공적으로 삭제되었습니다." };
}

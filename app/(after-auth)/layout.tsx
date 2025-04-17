import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import { db } from "@/db";
import { Role, users, VerificationStatus } from "@/db/schemas";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  if (session.user.role !== Role.SUPERADMIN) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        id: true,
        verified: true,
      },
    });
    if (!user) {
      return redirect("/login");
    }
    if (user.verified !== VerificationStatus.VERIFIED) {
      return redirect("/verify");
    }
  }

  return children;
};

export default layout;

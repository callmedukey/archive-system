import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getUsersByRegion } from "@/app/(after-auth)/super-admin/actions/dashboard-filters";
import { auth } from "@/auth";
import { db } from "@/db";
import { User, usersToRegions } from "@/db/schemas";

interface UsersWrapperProps {
  children: (users: User[]) => React.ReactNode;
}

const UsersWrapper = async ({ children }: UsersWrapperProps) => {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  const userRegion = await db.query.usersToRegions.findFirst({
    where: eq(usersToRegions.userId, session.user.id),
  });

  if (!userRegion) {
    throw new Error("Unexpected error: User region not found");
  }

  const foundUsers = await getUsersByRegion(userRegion.regionId);

  return children(foundUsers);
};

export default UsersWrapper;

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Role } from "@/db/schemas";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  if (session.user.role === Role.USER) {
    return redirect("/user");
  }

  if (session.user.role === Role.ADMIN) {
    return redirect("/admin");
  }

  if (session.user.role === Role.SUPERADMIN) {
    return redirect("/super-admin");
  }
}

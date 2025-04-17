import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import { Role } from "@/db/schemas";

const page = async () => {
  const session = await auth();

  if (session?.user.role === Role.USER) {
    return redirect("/login");
  }

  if (session?.user.role === Role.SUPERADMIN) {
    return redirect("/super-admin");
  }

  return <div>Admin Page</div>;
};

export default page;

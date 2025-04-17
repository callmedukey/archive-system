import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import { Role } from "@/db/schemas";

const page = async () => {
  const session = await auth();

  if (session?.user.role !== Role.USER) {
    return redirect("/login");
  }

  return <div>User Page</div>;
};

export default page;

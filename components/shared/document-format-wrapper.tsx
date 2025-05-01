import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import { db } from "@/db";
import { documentFormats } from "@/db/schemas";

interface DocumentFormatWrapperProps {
  children: (
    formats: (typeof documentFormats.$inferSelect)[]
  ) => React.ReactNode;
}

const DocumentFormatWrapper = async ({
  children,
}: DocumentFormatWrapperProps) => {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  const formats = await db.query.documentFormats.findMany();

  return children(formats);
};

export default DocumentFormatWrapper;

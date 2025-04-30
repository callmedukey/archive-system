import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import { db } from "@/db";
import { documentFormats } from "@/db/schemas";

interface DocumentFormatWrapperProps {
  children: (
    queryDocumentFormats: (typeof documentFormats.$inferSelect)[]
  ) => React.ReactNode;
}

const DocumentFormatWrapper = async ({
  children,
}: DocumentFormatWrapperProps) => {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/login");
  }

  const queryDocumentFormats = await db.query.documentFormats.findMany();

  return children(queryDocumentFormats);
};

export default DocumentFormatWrapper;

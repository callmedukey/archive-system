import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { documentFormats } from "@/db/schemas";

import NewDocumentFormatPage from "../../new/page";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { id } = await params;

  const documentFormat = await db.query.documentFormats.findFirst({
    where: eq(documentFormats.id, id),
  });

  if (!documentFormat) {
    return notFound();
  }

  return (
    <NewDocumentFormatPage
      content={documentFormat.content}
      name={documentFormat.name}
      applyActivity={documentFormat.applyActivity}
      isUpdate
      id={documentFormat.id}
    />
  );
};

export default page;

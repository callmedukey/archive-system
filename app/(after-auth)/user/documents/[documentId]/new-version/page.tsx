import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/db";
import { DocumentFormat, documents } from "@/db/schemas";
import getNextVersionNumber from "@/lib/utils/parse/get-next-version-number";

import NewDocumentForm from "../../new/[formatId]/components/new-document-form";

interface PageProps {
  params: Promise<{ documentId: string }>;
}

const page = async ({ params }: PageProps) => {
  const { documentId } = await params;

  const session = await auth();
  if (!session) {
    return redirect("/sign-in");
  }
  const document = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
    with: {
      format: {
        columns: {
          id: true,
          name: true,
        },
      },
      images: true,
      files: true,
      user: {
        columns: {
          username: true,
        },
      },
    },
  });
  if (!document) {
    return notFound();
  }
  return (
    <NewDocumentForm
      userId={session.user.id}
      reportDate={new Date().toISOString()}
      format={document.format as DocumentFormat}
      regionName={document.regionName}
      username={document.user?.username || ""}
      level={document.level?.toString() || ""}
      contractPeriodStart={document.contractPeriodStart?.toISOString() || ""}
      contractPeriodEnd={document.contractPeriodEnd?.toISOString() || ""}
      company={document.reportingCompany || ""}
      existingContent={document.content}
      reporter={document.reporter}
      version={`V${getNextVersionNumber(document.name)}`}
      documentName={document.name}
      reportMonth={document.reportMonth?.toString() || ""}
      previousFormatId={document.formatId as string}
    />
  );
};

export default page;

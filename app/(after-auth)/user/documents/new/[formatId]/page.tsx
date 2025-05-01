import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  ActivityContent,
  ActivityType,
  documentFormats,
  users,
} from "@/db/schemas";

import NewDocumentForm from "../../../../../../components/shared/new-document-form";

interface PageProps {
  params: Promise<{ formatId: string }>;
}

const page = async ({ params }: PageProps) => {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { formatId } = await params;

  const format = await db.query.documentFormats.findFirst({
    where: eq(documentFormats.id, formatId),
  });

  let activityTypes: ActivityType[] = [];
  let activityContents: ActivityContent[] = [];

  if (format?.applyActivity) {
    const [foundActivityTypes, foundActivityContents] = await Promise.all([
      db.query.documentActivityTypes.findMany(),
      db.query.documentActivityContents.findMany(),
    ]);

    activityTypes = foundActivityTypes;
    activityContents = foundActivityContents;
  }

  const userWithRegion = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      username: true,
      level: true,
      contractPeriodStart: true,
      contractPeriodEnd: true,
      company: true,
    },
    with: {
      regions: {
        with: {
          region: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!userWithRegion) {
    return notFound();
  }

  if (!format) {
    return notFound();
  }

  return (
    <div>
      <h1>{format.name} 작성</h1>
      <NewDocumentForm
        userId={session.user.id}
        reportDate={new Date().toISOString()}
        format={format}
        regionName={userWithRegion?.regions[0].region.name}
        username={userWithRegion?.username}
        level={userWithRegion?.level?.toString() || ""}
        contractPeriodStart={
          userWithRegion?.contractPeriodStart?.toISOString() || ""
        }
        contractPeriodEnd={
          userWithRegion?.contractPeriodEnd?.toISOString() || ""
        }
        company={userWithRegion?.company || ""}
        activityTypes={activityTypes}
        activityContents={activityContents}
      />
    </div>
  );
};

export default page;

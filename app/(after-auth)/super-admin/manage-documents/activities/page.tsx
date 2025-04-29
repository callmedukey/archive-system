import { format } from "date-fns";
import { eq, asc } from "drizzle-orm";
import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import {
  documentActivityContents,
  documentActivityTypes,
} from "@/db/schemas/documents";

import AddActivityDialog from "../components/add-activity-dialog";

const page = async () => {
  const activitiesResult = await db
    .select({
      content: documentActivityContents,
      type: documentActivityTypes,
    })
    .from(documentActivityContents)
    .leftJoin(
      documentActivityTypes,
      eq(documentActivityContents.activityTypeId, documentActivityTypes.id)
    )
    .orderBy(
      asc(documentActivityTypes.textCode),
      asc(documentActivityContents.numericalCode)
    );

  const activities = activitiesResult.map((row) => ({
    ...row.content,
    activityType: row.type,
  }));

  const activityTypes = await db
    .select()
    .from(documentActivityTypes)
    .orderBy(asc(documentActivityTypes.textCode));

  return (
    <div>
      <h1>활동 관리</h1>
      <aside className="flex justify-end mt-6">
        <AddActivityDialog
          activities={activities}
          activityTypes={activityTypes}
        />
      </aside>
      <Table className="mt-6 *:text-center">
        <TableHeader>
          <TableRow>
            <TableHead className="">활동 코드</TableHead>
            <TableHead className="">활동 분류</TableHead>
            <TableHead>활동 내용</TableHead>
            <TableHead>생성일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>
                {activity.activityType?.textCode}-{activity.numericalCode}
              </TableCell>
              <TableCell>{activity.activityType?.name}</TableCell>
              <TableCell>{activity.name}</TableCell>
              <TableCell>
                {activity.createdAt
                  ? format(new Date(activity.createdAt), "yyyy-MM-dd")
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default page;

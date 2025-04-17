"use client";
import { format } from "date-fns";
import Link from "next/link";
import React, { useState, useTransition } from "react";

import AsideNoticesQuery from "@/app/(after-auth)/super-admin/manage-notice/components/aside-notices-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  Table,
  TableCell,
} from "@/components/ui/table";
import { FetchedNotice, Role } from "@/db/schemas";

interface AdminsNoticesTableProps {
  initialNotices: FetchedNotice[];
  role: Role;
}

const AdminsNoticesTable = ({
  initialNotices,
  role,
}: AdminsNoticesTableProps) => {
  const [notices, setNotices] = useState<FetchedNotice[]>(initialNotices || []);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <AsideNoticesQuery
        setNotices={setNotices}
        startTransition={startTransition}
      />
      <section>
        {isPending ? (
          <div className="flex flex-col gap-4 mt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-120 w-full" />
          </div>
        ) : (
          <Table className="mt-6 **:text-center">
            <TableHeader className="bg-primary-foreground">
              <TableRow>
                <TableHead className="w-[12rem]">작성자</TableHead>
                <TableHead className="">제목</TableHead>
                <TableHead className="w-[10rem]">작성일자</TableHead>
                <TableHead className="w-[4rem]">조회수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="*:not-last:border-b">
              {notices.map((notice) => (
                <TableRow key={notice.id} className="*:py-4">
                  <TableCell>
                    {role === Role.SUPERADMIN
                      ? "총괄관리자"
                      : `${notice.author?.islands?.[0]?.island?.name} 관리자`}
                  </TableCell>
                  <TableCell className="hover:underline">
                    <Link
                      href={`/super-admin/manage-notice/${notice.id}`}
                      prefetch={false}
                    >
                      {notice.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {format(notice.createdAt, "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell>{notice.viewCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
};

export default AdminsNoticesTable;

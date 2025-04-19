"use client";
import { format } from "date-fns";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState, useTransition } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  Table,
  TableCell,
} from "@/components/ui/table";
import { FetchedNoticesWithoutContent, Role } from "@/db/schemas";
import renderRoleName from "@/lib/utils/parse/render-role-name";
import renderRolePathname from "@/lib/utils/parse/render-role-pathname";

import SearchInputWithButton from "./search-input-with-button";
import SelectWithLabel from "./select-with-label";
import StandardPagination from "./standard-pagination";

interface NoticesTableProps {
  initialNotices: FetchedNoticesWithoutContent[];
  role: Role;
  totalCount: number;
  initialPage?: number;
  initialLimit?: number;
  initialQuery?: string;
}

const NoticesTable = ({
  initialNotices,
  role,
  totalCount,
  initialPage = 1,
  initialLimit = 10,
  initialQuery = "",
}: NoticesTableProps) => {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const buildQueryString = (
    currentPage: number,
    currentLimit: number,
    currentSearchQuery: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", currentPage.toString());
    params.set("limit", currentLimit.toString());
    if (currentSearchQuery) {
      params.set("query", currentSearchQuery);
    } else {
      params.delete("query");
    }
    return params.toString();
  };

  const handleNavigation = (
    newPage: number,
    newLimit: number,
    newSearchQuery: string
  ) => {
    startTransition(() => {
      const queryString = buildQueryString(newPage, newLimit, newSearchQuery);
      router.push(`${pathname}?${queryString}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    handleNavigation(newPage, limit, query);
  };

  const handleSearch = () => {
    setPage(1);
    handleNavigation(1, limit, query);
  };

  const handleLimitChange = (newLimitValue: string | number) => {
    const numericLimit = parseInt(String(newLimitValue), 10);
    if (isNaN(numericLimit)) return;
    setLimit(numericLimit);
    setPage(1);
    handleNavigation(1, numericLimit, query);
  };

  const totalPages = Math.ceil(totalCount / limit);
  console.log(initialNotices);
  return (
    <div>
      <aside className="grid grid-cols-2 gap-4 items-baseline max-w-xs mt-6">
        <SearchInputWithButton
          value={query}
          placeholder="제목 또는 내용 검색..."
          onChange={(e) => setQuery(e.target.value)}
          disabled={isPending}
          onSearch={handleSearch}
        />
        <SelectWithLabel
          label=""
          disabled={isPending}
          disableLabel
          value={limit.toString()}
          onChange={handleLimitChange}
          options={[
            { label: "10개씩", value: "10" },
            { label: "20개씩", value: "20" },
            { label: "50개씩", value: "50" },
            { label: "100개씩", value: "100" },
          ]}
          name="limit"
        />
      </aside>
      <section className="mt-6 relative">
        <Table className="**:text-center">
          <TableHeader className="bg-primary-foreground">
            <TableRow>
              <TableHead className="w-[12rem]">작성자</TableHead>
              <TableHead className="">제목</TableHead>
              <TableHead className="w-[10rem]">작성일자</TableHead>
              <TableHead className="w-[4rem]">조회수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="*:not-last:border-b">
            {initialNotices.map((notice) => (
              <TableRow key={notice.id} className="*:py-4">
                <TableCell>
                  {renderRoleName(
                    role,
                    notice.author?.role as Role,
                    notice.author?.islands?.[0]?.island?.name
                  )}
                </TableCell>
                <TableCell className="hover:underline">
                  <Link
                    href={`/${renderRolePathname(role)}/notice/${notice.id}`}
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
            {initialNotices.length === 0 && !isPending && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  공지사항이 없습니다.
                </TableCell>
              </TableRow>
            )}
            {isPending && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Skeleton className="w-full h-120 rounded-lg" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
      <aside className="mt-6 flex justify-center">
        {totalPages > 1 && (
          <StandardPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </aside>
    </div>
  );
};

export default NoticesTable;

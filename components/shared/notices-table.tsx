"use client";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState, useTransition, useCallback, memo } from "react";

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
import { Button } from "../ui/button";

interface NoticesTableProps {
  pinnedNotices: FetchedNoticesWithoutContent[];
  initialNotices: FetchedNoticesWithoutContent[];
  role: Role;
  totalCount: number;
  initialPage?: number;
  initialLimit?: number;
  initialQuery?: string;
}

const NoticesTable = ({
  pinnedNotices,
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

  const buildQueryString = useCallback(
    (currentPage: number, currentLimit: number, currentSearchQuery: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", currentPage.toString());
      params.set("limit", currentLimit.toString());
      if (currentSearchQuery) {
        params.set("query", currentSearchQuery);
      } else {
        params.delete("query");
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleNavigation = useCallback(
    (newPage: number, newLimit: number, newSearchQuery: string) => {
      startTransition(() => {
        const queryString = buildQueryString(newPage, newLimit, newSearchQuery);
        router.push(`${pathname}?${queryString}`);
      });
    },
    [router, pathname, buildQueryString]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      handleNavigation(newPage, limit, query);
    },
    [limit, query, handleNavigation]
  );

  const handleSearch = useCallback(() => {
    setPage(1);
    handleNavigation(1, limit, query);
  }, [limit, query, handleNavigation]);

  const handleLimitChange = useCallback(
    (newLimitValue: string | number) => {
      const numericLimit = parseInt(String(newLimitValue), 10);
      if (isNaN(numericLimit)) return;
      setLimit(numericLimit);
      setPage(1);
      handleNavigation(1, numericLimit, query);
    },
    [query, handleNavigation]
  );

  const totalPages = Math.ceil(totalCount / limit);
  return (
    <div>
      <div className="flex justify-between items-center mt-6">
        <aside className="grid grid-cols-2 gap-4 items-baseline max-w-xs">
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
        <Button asChild>
          <Link href={`${pathname}/new`}>
            <Plus />
            <span className="hidden sm:block">공지 작성</span>
          </Link>
        </Button>
      </div>
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
            {pinnedNotices?.map((notice) => (
              <NoticeRow
                key={`pinned-${notice.id}`}
                notice={notice}
                role={role}
                isPinned
              />
            ))}
            {!isPending &&
              initialNotices?.map((notice) => (
                <NoticeRow key={notice.id} notice={notice} role={role} />
              ))}
            {initialNotices.length === 0 &&
              pinnedNotices.length === 0 &&
              !isPending && (
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

// Define NoticeRow props
interface NoticeRowProps {
  notice: FetchedNoticesWithoutContent;
  role: Role;
  isPinned?: boolean;
}

// Create the memoized NoticeRow component
const NoticeRow = memo(({ notice, role, isPinned = false }: NoticeRowProps) => {
  return (
    <TableRow className={`*:py-4 ${isPinned ? "bg-secondary" : ""}`}>
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
      <TableCell>{format(notice.createdAt, "yyyy-MM-dd HH:mm")}</TableCell>
      <TableCell>{notice.viewCount}</TableCell>
    </TableRow>
  );
});

// Add display name for better debugging
NoticeRow.displayName = "NoticeRow";

export default NoticesTable;

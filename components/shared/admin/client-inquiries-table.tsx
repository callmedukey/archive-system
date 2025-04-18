"use client";

import { format } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InquiryWithUser } from "@/db/schemas/inquiries";

import SearchInputWithButton from "../search-input-with-button";
import SelectWithLabel from "../select-with-label";
import StandardPagination from "../standard-pagination";

interface ClientInquiriesTableProps {
  initialInquiries: InquiryWithUser[];
  totalCount: number;
  initialPage?: number;
  initialLimit?: number;
  initialOrderBy?: "asc" | "desc";
  initialSearchTerm?: string;
}

export default function ClientInquiriesTable({
  initialInquiries,
  totalCount,
  initialPage = 1,
  initialLimit = 10,
  initialOrderBy = "desc",
  initialSearchTerm = "",
}: ClientInquiriesTableProps) {
  const router = useRouter();
  const pathname = usePathname(); // Use pathname for navigation
  const searchParams = useSearchParams(); // Read initial state from URL reliably

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [orderBy, setOrderBy] = useState<"asc" | "desc">(initialOrderBy);
  const [isPending, startTransition] = useTransition();

  const buildQueryString = (
    currentPage: number,
    currentLimit: number,
    currentOrderBy: "asc" | "desc",
    currentSearchTerm: string
  ) => {
    const params = new URLSearchParams(searchParams.toString()); // Preserve existing params
    params.set("page", currentPage.toString());
    params.set("limit", currentLimit.toString());
    params.set("orderBy", currentOrderBy);
    if (currentSearchTerm) {
      params.set("searchTerm", currentSearchTerm);
    } else {
      params.delete("searchTerm");
    }
    return params.toString();
  };

  const handleNavigation = (
    newPage: number,
    newLimit: number,
    newOrderBy: "asc" | "desc",
    newSearchTerm: string
  ) => {
    startTransition(() => {
      const queryString = buildQueryString(
        newPage,
        newLimit,
        newOrderBy,
        newSearchTerm
      );
      router.push(`${pathname}?${queryString}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    handleNavigation(newPage, limit, orderBy, searchTerm);
  };

  const handleSearch = () => {
    if (searchTerm.length === 0) {
      toast.error("검색어를 입력해주세요");
      return;
    }
    // Reset to page 1 on new search
    handleNavigation(1, limit, orderBy, searchTerm);
  };

  const handleOrderChange = (value: string | number) => {
    // Reset to page 1 on order change
    // We know the value will be 'asc' or 'desc' based on the options provided
    setOrderBy(value as "asc" | "desc");
    handleNavigation(1, limit, value as "asc" | "desc", searchTerm);
  };

  const handleLimitChange = (newLimitValue: string | number) => {
    const numericLimit = parseInt(String(newLimitValue), 10);
    if (isNaN(numericLimit)) return;
    // Reset to page 1 on limit change
    setLimit(numericLimit);
    handleNavigation(1, numericLimit, orderBy, searchTerm);
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <aside className="grid grid-cols-3 gap-4 items-baseline max-w-md mt-6">
        <SearchInputWithButton
          value={searchTerm}
          placeholder="검색어를 입력해주세요"
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isPending}
          onSearch={handleSearch}
        />
        <SelectWithLabel
          label=""
          disabled={isPending}
          disableLabel
          value={orderBy}
          onChange={handleOrderChange}
          options={[
            { label: "최신순", value: "desc" },
            { label: "오래된순", value: "asc" },
          ]}
          name="orderBy"
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
              <TableHead className="">작성자</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead className="">조회수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialInquiries.map((inquiry) => (
              <TableRow
                key={inquiry.inquiry.id}
                className="*:not-last:border-b"
              >
                <TableCell className="">
                  {inquiry.user?.username ?? "-"}{" "}
                </TableCell>
                <TableCell>{inquiry.inquiry.title}</TableCell>
                <TableCell>
                  {format(inquiry.inquiry.createdAt, "yyyy-MM-dd HH:mm")}
                </TableCell>
                <TableCell className="">{inquiry.inquiry.viewCount}</TableCell>
              </TableRow>
            ))}
            {initialInquiries.length === 0 && !isPending && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  문의사항이 없습니다.
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
}

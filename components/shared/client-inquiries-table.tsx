"use client";

import { format } from "date-fns";
import { MailQuestion } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback, memo } from "react";
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

import SearchInputWithButton from "./search-input-with-button";
import SelectWithLabel from "./select-with-label";
import StandardPagination from "./standard-pagination";
import { Button } from "../ui/button";

interface ClientInquiriesTableProps {
  initialInquiries: InquiryWithUser[];
  totalCount: number;
  initialPage?: number;
  initialLimit?: number;
  initialOrderBy?: "asc" | "desc";
  initialSearchTerm?: string;
  withAddButton?: boolean;
}

export default function ClientInquiriesTable({
  initialInquiries,
  totalCount,
  initialPage = 1,
  initialLimit = 10,
  initialOrderBy = "desc",
  initialSearchTerm = "",
  withAddButton = false,
}: ClientInquiriesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    const params = new URLSearchParams(searchParams.toString());
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

  const handleNavigation = useCallback(
    (
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
    },
    [searchParams, router, pathname]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      handleNavigation(newPage, limit, orderBy, searchTerm);
    },
    [limit, orderBy, searchTerm, handleNavigation]
  );

  const handleSearch = useCallback(() => {
    if (searchTerm.length === 0) {
      toast.error("검색어를 입력해주세요");
      return;
    }
    handleNavigation(1, limit, orderBy, searchTerm);
  }, [limit, orderBy, searchTerm, handleNavigation]);

  const handleOrderChange = useCallback(
    (value: string | number) => {
      setOrderBy(value as "asc" | "desc");
      handleNavigation(1, limit, value as "asc" | "desc", searchTerm);
    },
    [limit, searchTerm, handleNavigation]
  );

  const handleLimitChange = useCallback(
    (newLimitValue: string | number) => {
      const numericLimit = parseInt(String(newLimitValue), 10);
      if (isNaN(numericLimit)) return;
      setLimit(numericLimit);
      handleNavigation(1, numericLimit, orderBy, searchTerm);
    },
    [orderBy, searchTerm, handleNavigation]
  );

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <div className="flex justify-between items-end mt-6 gap-2">
        <aside className="grid grid-cols-3 gap-2 lg:gap-4 items-baseline md:max-w-md max-w-xs">
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
        {withAddButton && (
          <Button asChild>
            <Link href="/user/inquiries/new">
              <MailQuestion />
              <span className="hidden sm:block">문의하기</span>
            </Link>
          </Button>
        )}
      </div>

      <section className="mt-6 relative">
        <Table className="**:text-center">
          <TableHeader className="bg-primary-foreground">
            <TableRow>
              <TableHead className="w-[10rem]">작성자</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-[10rem]">작성일</TableHead>
              <TableHead className="w-[10rem]">조회수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="*:not-last:border-b">
            {!isPending &&
              initialInquiries.map((inquiry) => (
                <InquiryRow
                  key={inquiry.inquiry.id}
                  inquiry={inquiry}
                  pathname={pathname}
                />
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

interface InquiryRowProps {
  inquiry: InquiryWithUser;
  pathname: string;
}

const InquiryRow = memo(({ inquiry, pathname }: InquiryRowProps) => {
  const routeToInquiry = (inquiryId: number) => {
    return `${pathname}/${inquiryId}`;
  };

  return (
    <TableRow key={inquiry.inquiry.id}>
      <TableCell className="">{inquiry.user?.username ?? "-"}</TableCell>
      <TableCell>
        <Link
          href={routeToInquiry(inquiry.inquiry.id)}
          className="hover:underline"
          prefetch={false}
        >
          {inquiry.inquiry.title}
        </Link>
      </TableCell>
      <TableCell>
        {format(inquiry.inquiry.createdAt, "yyyy-MM-dd HH:mm")}
      </TableCell>
      <TableCell className="">{inquiry.inquiry.viewCount}</TableCell>
    </TableRow>
  );
});

InquiryRow.displayName = "InquiryRow";

"use client";

import { format } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback, useMemo } from "react";

import type { DocumentWithUser } from "@/components/shared/admin/server/document-wrapper";

import { Skeleton } from "../../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import SearchInputWithButton from "../search-input-with-button";
import SelectWithLabel from "../select-with-label";
import StandardPagination from "../standard-pagination";
import DocumentsAdvancedFilter from "./documents-advanced-filter";

interface DocumentsTableProps {
  initialDocuments: DocumentWithUser[];
  totalCount: number;
  initialPage?: number;
  initialLimit?: number;
  initialOrderBy?: "asc" | "desc";
  initialSearchTerm?: string;
}

const DocumentsTable = ({
  initialDocuments,
  totalCount,
  initialPage = 1,
  initialLimit = 10, // Default should match the server page
  initialOrderBy = "desc", // Default should match the server page
  initialSearchTerm = "",
}: DocumentsTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit); // Manage limit if needed
  const [orderBy, setOrderBy] = useState<"asc" | "desc">(initialOrderBy); // Manage order if needed
  const [isPending, startTransition] = useTransition();

  const buildQueryString = useMemo(
    () =>
      (
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
      },
    [searchParams]
  );

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
        // Using replace to avoid polluting history for filters/search
        router.replace(`${pathname}?${queryString}`);
      });
    },
    [buildQueryString, router, pathname]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      handleNavigation(newPage, limit, orderBy, searchTerm);
    },
    [limit, orderBy, searchTerm, handleNavigation]
  );

  const handleSearch = useCallback(() => {
    setPage(1); // Reset to page 1 on new search
    handleNavigation(1, limit, orderBy, searchTerm);
  }, [limit, orderBy, searchTerm, handleNavigation]);

  // Add handleLimitChange and handleOrderChange if implementing those controls
  const handleOrderChange = useCallback(
    (value: string | number) => {
      const newOrderBy = value as "asc" | "desc";
      setOrderBy(newOrderBy);
      setPage(1); // Reset to page 1
      handleNavigation(1, limit, newOrderBy, searchTerm);
    },
    [limit, searchTerm, handleNavigation]
  );

  const handleLimitChange = useCallback(
    (newLimitValue: string | number) => {
      const numericLimit = parseInt(String(newLimitValue), 10);
      if (isNaN(numericLimit)) return;
      setLimit(numericLimit);
      setPage(1); // Reset to page 1
      handleNavigation(1, numericLimit, orderBy, searchTerm);
    },
    [orderBy, searchTerm, handleNavigation]
  );

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      {/* Control Area: Search, Filters, etc. */}
      <aside className="flex justify-between items-end mt-6 gap-2">
        {/* Adjust max-width and grid layout as needed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 lg:gap-4 items-baseline md:max-w-md max-w-xs">
          <SearchInputWithButton
            value={searchTerm}
            placeholder="문서 검색..."
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isPending}
            onSearch={handleSearch}
            className="md:col-span-3" // Example: make search span full width on mobile
          />
          {/* Add SelectWithLabel for OrderBy and Limit here if desired */}
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
            className="md:col-span-1" // Adjust span as needed
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
            className="md:col-span-1" // Adjust span as needed
          />
        </div>
        <DocumentsAdvancedFilter />
      </aside>

      {/* Table Area */}
      <section className="mt-6 relative">
        <Table className="**:text-center">
          <TableHeader className="bg-primary-foreground">
            <TableRow>
              {/* Define your table headers based on DocumentWithUser */}
              <TableHead>문서명</TableHead>
              <TableHead>섬</TableHead>
              <TableHead>지역</TableHead>
              <TableHead>보고자</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead>작성자</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="*:not-last:border-b">
            {!isPending &&
              initialDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  {/* Populate cells, add Link for details if needed */}
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.islandName ?? "-"}</TableCell>
                  <TableCell>{doc.regionName ?? "-"}</TableCell>
                  <TableCell>{doc.reporter ?? "-"}</TableCell>
                  <TableCell>
                    {doc.createdAt
                      ? format(new Date(doc.createdAt), "yyyy-MM-dd")
                      : "-"}
                  </TableCell>
                  <TableCell>{doc.user?.username ?? "-"}</TableCell>
                </TableRow>
              ))}
            {initialDocuments.length === 0 && !isPending && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  등록된 문서가 없습니다.
                </TableCell>
              </TableRow>
            )}
            {/* Skeleton Loading State */}
            {isPending && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <Skeleton className="w-full h-120 rounded-lg" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      {/* Pagination Area */}
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

export default DocumentsTable;

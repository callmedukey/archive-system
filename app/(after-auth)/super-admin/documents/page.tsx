import React, { Suspense } from "react";

import DocumentsTable from "@/components/shared/admin/documents-table";
import DocumentWrapper from "@/components/shared/admin/server/document-wrapper";
import RegionsWrapper from "@/components/shared/admin/server/regions-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentPageProps {
  searchParams: Promise<{
    searchTerm?: string;
    page?: string;
    limit?: string;
    orderBy?: "asc" | "desc";
  }>;
}

const page = async ({ searchParams }: DocumentPageProps) => {
  const resolvedSearchParams = await searchParams;

  const safeSearchTerm = resolvedSearchParams.searchTerm ?? "";
  const safePage = Math.max(
    1,
    resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1
  );
  const safeLimit = Math.max(
    1,
    Math.min(
      100,
      resolvedSearchParams.limit ? parseInt(resolvedSearchParams.limit) : 10
    )
  );
  const safeOrderBy = resolvedSearchParams.orderBy ?? "desc";

  return (
    <div>
      <h1>자료 관리</h1>
      <Suspense
        fallback={
          <div className="mt-6">
            <div className="flex items-center">
              <div className="grid grid-cols-3 gap-4 items-baseline max-w-md w-full">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-24 ml-auto mr-0" />
            </div>
            <Skeleton className="w-full h-120 rounded-lg mt-6" />
          </div>
        }
      >
        <RegionsWrapper>
          {(regions) => (
            <DocumentWrapper
              searchTerm={safeSearchTerm}
              page={safePage}
              limit={safeLimit}
              orderBy={safeOrderBy}
            >
              {(data, totalCount, documentFormats) => (
                <DocumentsTable
                  initialDocuments={data}
                  totalCount={totalCount}
                  initialPage={safePage}
                  initialLimit={safeLimit}
                  initialOrderBy={safeOrderBy}
                  initialSearchTerm={safeSearchTerm}
                  initialDocumentFormats={documentFormats}
                  initialRegions={regions}
                />
              )}
            </DocumentWrapper>
          )}
        </RegionsWrapper>
      </Suspense>
    </div>
  );
};

export default page;

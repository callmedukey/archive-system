import { Suspense } from "react";

import InquiriesWrapper from "@/components/shared/admin/server/inquiries-wapper";
import ClientInquiriesTable from "@/components/shared/client-inquiries-table";
import { Skeleton } from "@/components/ui/skeleton";

interface InquiriesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    orderBy?: "desc" | "asc";
    searchTerm?: string;
  }>;
}

const page = async ({ searchParams }: InquiriesPageProps) => {
  const { page, limit, orderBy, searchTerm } = await searchParams;

  const safePage = Math.max(1, page ? parseInt(page) : 1);
  const safeLimit = Math.max(1, Math.min(10, limit ? parseInt(limit) : 10));
  const safeOrderBy = orderBy ?? "desc";
  const safeSearchTerm = searchTerm ?? "";

  return (
    <div>
      <h1>문의사항</h1>
      <Suspense
        fallback={
          <div className="mt-6">
            <div className="grid grid-cols-3 gap-4 items-baseline max-w-md">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="w-full h-120 rounded-lg mt-6" />
          </div>
        }
      >
        <InquiriesWrapper
          searchTerm={safeSearchTerm}
          page={safePage}
          limit={safeLimit}
          orderBy={safeOrderBy}
        >
          {(inquiries, totalCount) => {
            return (
              <ClientInquiriesTable
                withAddButton
                initialInquiries={inquiries}
                totalCount={totalCount}
                initialPage={safePage}
                initialLimit={safeLimit}
                initialOrderBy={safeOrderBy}
                initialSearchTerm={safeSearchTerm}
              />
            );
          }}
        </InquiriesWrapper>
      </Suspense>
    </div>
  );
};

export default page;

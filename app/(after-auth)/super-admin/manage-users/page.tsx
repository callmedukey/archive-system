import { Suspense } from "react";

import AsideRegionsAndIslandsWrapper from "@/components/shared/admin/aside-regions-wrapper";
import AsideUserFilter from "@/components/shared/admin/aside-user-filter";
import SectionUsersTable from "@/components/shared/admin/section-users-table";
import UsersDataContextProvider from "@/components/shared/admin/users-data-context-provider";
import { Skeleton } from "@/components/ui/skeleton";

const page = async () => {
  return (
    <div>
      <h1>사용자 관리</h1>
      <section className="mt-6">
        <Suspense
          fallback={
            <>
              <div className="max-w-xs grid grid-cols-3 gap-2">
                <Skeleton className="w-full h-10 rounded-lg" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
              <Skeleton className="w-full h-10 rounded-lg mt-6" />
              <Skeleton className="w-full h-[60vh] rounded-lg mt-6" />
            </>
          }
        >
          <AsideRegionsAndIslandsWrapper>
            {(regions) => (
              <UsersDataContextProvider>
                <AsideUserFilter regions={regions} />
                <SectionUsersTable />
              </UsersDataContextProvider>
            )}
          </AsideRegionsAndIslandsWrapper>
        </Suspense>
      </section>
    </div>
  );
};

export default page;

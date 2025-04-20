import { Suspense } from "react";

import AsideUserFilter from "@/components/shared/admin/aside-user-filter";
import SectionUsersTable from "@/components/shared/admin/section-users-table";
import RegionsWrapper from "@/components/shared/admin/server/regions-wrapper";
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
              <div className="max-w-md grid grid-cols-2 gap-2">
                <Skeleton className="w-full h-10 rounded-lg" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
              <Skeleton className="w-full h-120 rounded-lg mt-6" />
            </>
          }
        >
          <RegionsWrapper>
            {(regions) => (
              <UsersDataContextProvider>
                <AsideUserFilter regions={regions} />
                <SectionUsersTable />
              </UsersDataContextProvider>
            )}
          </RegionsWrapper>
        </Suspense>
      </section>
    </div>
  );
};

export default page;

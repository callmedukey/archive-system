import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import SectionUsersTable from "@/components/shared/admin/section-users-table";
import UsersWrapper from "@/components/shared/admin/server/users-wrapper";
import UsersDataContextProvider from "@/components/shared/admin/users-data-context-provider";
import { Skeleton } from "@/components/ui/skeleton";

const page = async () => {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  return (
    <div>
      <h1>사용자 관리</h1>
      <section className="mt-6">
        <Suspense
          fallback={
            <>
              <Skeleton className="w-full h-120 rounded-lg mt-6" />
            </>
          }
        >
          <UsersWrapper>
            {(users) => (
              <UsersDataContextProvider foundUsers={users}>
                <SectionUsersTable />
              </UsersDataContextProvider>
            )}
          </UsersWrapper>
        </Suspense>
      </section>
    </div>
  );
};

export default page;

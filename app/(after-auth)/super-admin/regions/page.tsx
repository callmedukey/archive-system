import React, { Suspense } from "react";

import RegionsWrapper from "@/components/shared/admin/server/regions-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

import RegionCreateDialog from "./components/region-create-dialog";
import RegionsTable from "./components/regions-table";
const page = () => {
  return (
    <div>
      <h1>권역 관리</h1>
      <aside className="mt-2 flex justify-end">
        <RegionCreateDialog />
      </aside>
      <Suspense
        fallback={<Skeleton className="w-full h-120 rounded-lg mt-4" />}
      >
        <RegionsWrapper>
          {(regions) => <RegionsTable regions={regions} />}
        </RegionsWrapper>
      </Suspense>
    </div>
  );
};

export default page;

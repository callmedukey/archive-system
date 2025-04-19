import React, { Suspense } from "react";

import DashboardMainClient from "@/components/shared/dashboard-main-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Role } from "@/db/schemas";

import DashboardInfoTableCard from "../../../components/shared/dashboard-info-table-card";
import DashboardMainWrapper from "../../../components/shared/dashboard-main-wrapper";
const page = async () => {
  return (
    <div className="pb-6">
      <h1>전체 현황판</h1>
      <aside className="grid lg:grid-cols-3 gap-2 mt-6">
        <DashboardInfoTableCard
          title="제안서 및 협약 서류"
          data={[
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
          ]}
        />
        <DashboardInfoTableCard
          title="제안서 및 협약 서류"
          data={[
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
          ]}
        />
        <DashboardInfoTableCard
          title="제안서 및 협약 서류"
          data={[
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
          ]}
        />
      </aside>

      <section className="mt-6">
        <Suspense
          fallback={
            <>
              <div className="max-w-xs grid grid-cols-2 gap-2">
                <Skeleton className="w-full h-10 rounded-lg" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
              <Skeleton className="w-full h-[200px] rounded-lg mt-6" />
              <Skeleton className="w-full h-[200px] rounded-lg mt-6" />
            </>
          }
        >
          <DashboardMainWrapper role={Role.SUPERADMIN}>
            {(regions) => (
              <DashboardMainClient regions={regions} role={Role.SUPERADMIN} />
            )}
          </DashboardMainWrapper>
        </Suspense>
      </section>
      <aside className="grid lg:grid-cols-3 gap-2 mt-6">
        <DashboardInfoTableCard
          title="제안서 및 협약 서류"
          data={[
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
          ]}
        />
        <DashboardInfoTableCard
          title="제안서 및 협약 서류"
          data={[
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
          ]}
        />
        <DashboardInfoTableCard
          title="제안서 및 협약 서류"
          data={[
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "뚝불나니야 섬 PM단 제안서",
              date: "2024.04.15",
            },
          ]}
        />
      </aside>
    </div>
  );
};

export default page;

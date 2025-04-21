import { redirect } from "next/navigation";
import React, { Suspense } from "react";

import { auth } from "@/auth";
import DashboardInfoTableCard from "@/components/shared/dashboard-info-table-card";
import DashboardMainClient from "@/components/shared/dashboard-main-client";
import DashboardMainWrapper from "@/components/shared/dashboard-main-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

const page = async () => {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

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
              </div>
              <Skeleton className="w-full h-[200px] rounded-lg mt-6" />
              <Skeleton className="w-full h-[200px] rounded-lg mt-6" />
            </>
          }
        >
          <DashboardMainWrapper role={session.user.role}>
            {(regions, regionId) => (
              <DashboardMainClient
                regions={regions}
                role={session.user.role}
                currentRegionId={regionId}
              />
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

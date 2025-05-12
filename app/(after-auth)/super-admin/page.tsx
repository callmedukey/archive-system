import { redirect } from "next/navigation";
import React, { Suspense } from "react";

import { auth } from "@/auth";
import ScheduleCalendar from "@/components/schedule-calendar";
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
              title: "A섬 PM단 제안서",
              date: "2024.04.15",
            },
            {
              title: "B섬 PM단 협약서류",
              date: "2024.04.15",
            },
            {
              title: "C섬 착수계",
              date: "2024.04.15",
            },
          ]}
        />
        <DashboardInfoTableCard
          title="월간보고서 등록 현황"
          data={[
            {
              title: "A섬 4월 월간보고서 V1",
              date: "2024.04.15",
            },
            {
              title: "B섬 4월 월간보고서 V1",
              date: "2024.04.15",
            },
            {
              title: "C섬 4월 월간보고서 V1",
              date: "2024.04.15",
            },
          ]}
        />
        <DashboardInfoTableCard
          title="운영결과보고서 등록 현황"
          data={[
            {
              title: "A섬 운영결과보고서 (2024)",
              date: "2024.04.15",
            },
            {
              title: "B섬 운영결과보고서 (2024)",
              date: "2024.04.15",
            },
            {
              title: "C섬 운영결과보고서 (2024)",
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
          title="운영결과보고서 등록 현황"
          data={[
            {
              title: "A섬 운영결과보고서",
              date: "2024.04.15",
            },
            {
              title: "B섬 운영결과보고서",
              date: "2024.04.15",
            },
            {
              title: "C섬 운영결과보고서",
              date: "2024.04.15",
            },
          ]}
        />
        <DashboardInfoTableCard
          title="1~4단계 마을발전계획서"
          data={[
            {
              title: "A섬 마을발전계획서 (1단계)",
              date: "2024.04.15",
            },
            {
              title: "B섬 마을발전계획서 (2단계)",
              date: "2024.04.15",
            },
            {
              title: "C섬 마을발전계획서 (3단계)",
              date: "2024.04.15",
            },
          ]}
        />
        <DashboardInfoTableCard
          title="문의사항"
          data={[
            {
              title: "사용법 문의사항입니다",
              date: "2024.04.15",
            },
            {
              title: "문서 형식 문의사항입니다",
              date: "2024.04.15",
            },
            {
              title: "문서 형식 문의사항입니다",
              date: "2024.04.15",
            },
          ]}
        />
      </aside>
      <ScheduleCalendar />
    </div>
  );
};

export default page;

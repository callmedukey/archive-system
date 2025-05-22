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
              date: "2025.04.16",
              number: "30",
            },
            {
              title: "B섬 PM단 제안서",
              date: "2025.04.16",
              number: "29",
            },
            {
              title: "C섬 PM단 제안서",
              date: "2025.04.15",
              number: "28",
            },
            {
              title: "D섬 PM단 제안서",
              date: "2025.04.15",
              number: "27",
            },
            {
              title: "E섬 PM단 제안서",
              date: "2025.04.15",
              number: "26",
            },
          ]}
        />
        <DashboardInfoTableCard
          title="월간보고서"
          data={[
            {
              title: "A섬 5월 월간보고",
              date: "2025.04.28",
              number: "31",
            },
            {
              title: "B섬 5월 월간보고",
              date: "2025.04.28",
              number: "30",
            },
            {
              title: "C섬 5월 월간보고",
              date: "2025.04.28",
              number: "29",
            },
            {
              title: "D섬 5월 월간보고",
              date: "2025.04.28",
              number: "28",
            },
            {
              title: "E섬 5월 월간보고",
              date: "2025.04.28",
              number: "27",
            },
          ]}
        />
        <DashboardInfoTableCard
          title="운영결과보고서"
          data={[
            {
              title: "A섬 2024년 1단계 운영결과보고서",
              date: "2025.02.05",
              number: "32",
            },
            {
              title: "B섬 2024년 2단계 운영결과보고서",
              date: "2025.02.04",
              number: "31",
            },
            {
              title: "C섬 2024년 1단계 운영결과보고서",
              date: "2025.02.04",
              number: "30",
            },
            {
              title: "D섬 2024년 3단계 운영결과보고서",
              date: "2025.02.03",
              number: "29",
            },
            {
              title: "E섬 2024년 1단계 운영결과보고서",
              date: "2025.02.03",
              number: "28",
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
          title="기타활동자료"
          data={[
            {
              title: "A섬 주민회의 사진자료",
              date: "2025.05.10",
              number: "30",
            },
            {
              title: "B섬 주민교육 1차 사진자료",
              date: "2025.05.10",
              number: "29",
            },
            {
              title: "C섬 홍보용 사진 및 영상자료",
              date: "2025.05.04",
              number: "28",
            },
            {
              title: "D섬 주민인터뷰 영상자료",
              date: "2025.05.01",
              number: "27",
            },
            {
              title: "E섬 마을 문화활동 사진 및 영상자료",
              date: "2025.04.29",
              number: "26",
            },
          ]}
        />
        <DashboardInfoTableCard
          title="마을발전계획서"
          data={[
            {
              title: "A섬 2024년 1단계 마을발전계획서 ",
              date: "2025.02.05",
              number: "31",
            },
            {
              title: "B섬 2024년 2단계 마을발전계획서 ",
              date: "2025.02.04",
              number: "30",
            },
            {
              title: "C섬 2024년 1단계 마을발전계획서 ",
              date: "2025.02.04",
              number: "29",
            },
            {
              title: "D섬 2024년 3단계 마을발전계획서 ",
              date: "2025.02.03",
              number: "28",
            },
            {
              title: "E섬 2024년 1단계 마을발전계획서 ",
              date: "2025.02.03",
              number: "27",
            },
          ]}
        />
        <DashboardInfoTableCard
          title="문의사항"
          data={[
            {
              title: "A섬 문의드립니다",
              date: "2025.05.17",
              number: "30",
            },
            {
              title: "B섬 문의드립니다",
              date: "2025.05.15",
              number: "29",
            },
            {
              title: "C섬 문의드립니다",
              date: "2025.05.04",
              number: "28",
            },
            {
              title: "D섬 문의드립니다",
              date: "2025.04.05",
              number: "27",
            },
            {
              title: "E섬 문의드립니다",
              date: "2025.04.01",
              number: "26",
            },
          ]}
        />
      </aside>
      <ScheduleCalendar />
    </div>
  );
};

export default page;

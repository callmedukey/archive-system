"use client";

import React, {
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Cell, LabelList } from "recharts";

import SelectWithLabel from "@/components/shared/select-with-label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Island, Region, Role } from "@/db/schemas/auth";
import { cn } from "@/lib/utils";

import { getIslandsByRegion } from "../../app/(after-auth)/super-admin/actions/dashboard-filters";

interface DashboardMainClientProps {
  regions: Region[];
  role: Role;
  currentRegionId?: string;
}

const DashboardMainClient = ({
  regions,
  role,
  currentRegionId,
}: DashboardMainClientProps) => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(
    currentRegionId
      ? regions.find((region) => region.id === currentRegionId) || null
      : null
  );
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
  const [selectableIslands, action, isPending] = useActionState(
    getIslandsByRegion,
    []
  );

  const handleRegionChange = (value: string) => {
    startTransition(() => {
      action(value);
    });
  };

  const initialPlaceholderData: (string | number)[][] = [
    ["월별보고", 5, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    ["활동계획", 15, 1, 1, 3, 5, 5, 10, 10, 10, 7, 8, 4, 4],
    ["진행현황", 12, 1, 1, 3, 4, 3, "-", "-", "-", "-", "-", "-", "-"],
  ];

  const 활동계획Row = initialPlaceholderData.find(
    (row) => row[0] === "활동계획"
  );
  const 진행현황Row = initialPlaceholderData.find(
    (row) => row[0] === "진행현황"
  );

  // Define assumedCurrentCalendarMonth in a scope accessible by the table rendering logic
  const assumedCurrentCalendarMonth = 5; // May (1-indexed for calendar month when comparing)

  // Dynamically create and append the "수행률" row
  if (활동계획Row && 진행현황Row) {
    const newSuhangryulRow: (string | number)[] = ["수행률"];

    // Iterate for "전체" and 12 months (data indices 1 through 13 in the source rows)
    // These correspond to dataCellIndex for accessing elements in 활동계획Row and 진행현황Row
    for (let dataCellIndex = 1; dataCellIndex <= 13; dataCellIndex++) {
      const isTotalColumn = dataCellIndex === 1;
      // monthForColumn: 1 (Jan) to 12 (Dec). This is relevant for dataCellIndex 2 through 13.
      // Represents the actual calendar month number.
      const calendarMonth = dataCellIndex - 1;

      let cellValue: string | number = "-"; // Default to "-"

      if (!isTotalColumn && calendarMonth > assumedCurrentCalendarMonth) {
        // For months after the assumed current month (e.g., June onwards if May is current)
        cellValue = "-";
      } else {
        // For the "전체" column OR for months up to and including the assumed current month
        const aktivPlanValue = 활동계획Row[dataCellIndex];
        const progressStatusValue = 진행현황Row[dataCellIndex];

        if (
          typeof progressStatusValue === "string" &&
          progressStatusValue.trim() === "-"
        ) {
          cellValue = "-";
        } else {
          const aktivPlanNum = Number(aktivPlanValue);
          const progressStatusNum = Number(progressStatusValue);

          if (
            !isNaN(aktivPlanNum) &&
            !isNaN(progressStatusNum) &&
            aktivPlanNum > 0
          ) {
            cellValue = Math.round((progressStatusNum / aktivPlanNum) * 100);
          } else {
            // If calculation is not possible (e.g., non-numeric, or "활동계획" is 0)
            cellValue = "-";
          }
        }
      }
      newSuhangryulRow.push(cellValue);
    }
    initialPlaceholderData.push(newSuhangryulRow);
  }

  const chartConfig = {
    plan: {
      label: "활동계획",
      color: "hsl(var(--chart-1))", // Using a chart color variable
    },
    actual: {
      label: "진행현황",
      color: "hsl(var(--chart-2))", // Using another chart color variable
    },
  };

  const chartData = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthName = `${monthIndex + 1}월`;
    let planValue = 0;
    let actualValue = 0;

    if (활동계획Row && 활동계획Row[monthIndex + 2]) {
      // +2 because index 0 is title, index 1 is "전체"
      planValue = Number(활동계획Row[monthIndex + 2]) || 0;
    }

    if (진행현황Row && 진행현황Row[monthIndex + 2]) {
      // +2 for similar reasons
      // Check if the value is "-", if so, keep it as 0, otherwise convert to number
      actualValue =
        진행현황Row[monthIndex + 2] === "-"
          ? 0
          : Number(진행현황Row[monthIndex + 2]) || 0;
    }

    let actualFillColor: string;
    let actualFillOpacity: number | undefined = undefined; // Default to full opacity
    const isMay = monthIndex === 4; // May is the 5th month (0-indexed)

    if (isMay) {
      actualFillColor = "var(--primary)"; // Use primary color for May
      actualFillOpacity = 0.7; // Apply 70% opacity for May
    } else {
      if (actualValue < planValue) {
        actualFillColor = "red"; // Color red if actual is less than plan for other months
      } else {
        // actualValue >= planValue
        actualFillColor = "var(--primary)"; // Use primary blue when plan is met or exceeded
      }
      // actualFillOpacity remains undefined (full opacity by default) for non-May months
    }

    let suhaengryulValue: number | null = null;
    if (planValue > 0) {
      suhaengryulValue = Math.round((actualValue / planValue) * 100);
    } else if (planValue === 0 && actualValue === 0) {
      suhaengryulValue = 0;
    }

    return {
      name: monthName,
      plan: planValue,
      actual: actualValue,
      actualFillColor: actualFillColor,
      actualFillOpacity: actualFillOpacity,
      suhaengryul: suhaengryulValue,
    };
  });

  useEffect(() => {
    if (currentRegionId) {
      startTransition(() => {
        action(currentRegionId);
      });
    }
  }, [currentRegionId, action]);

  return (
    <>
      {role !== Role.USER && (
        <div className="max-w-xs grid grid-cols-2 gap-2">
          {role === Role.SUPERADMIN && (
            <SelectWithLabel
              label="권역"
              name="region"
              placeholder="권역 선택"
              className="rounded-lg"
              options={regions
                .map((region) => ({
                  label: region.name,
                  value: region.id,
                }))
                .sort((a, b) => a.label.localeCompare(b.label))}
              value={selectedRegion?.id || ""}
              onChange={(value) => {
                const region = regions.find((region) => region.id === value);
                setSelectedRegion(region || null);
                handleRegionChange(value as string);
              }}
              disableLabel
            />
          )}
          <SelectWithLabel
            label="섬"
            name="island"
            placeholder={
              selectedRegion ? "섬을 선택해주세요" : "권역을 선택해주세요"
            }
            disabled={isPending}
            className={cn("rounded-lg", isPending && "animate-pulse")}
            options={selectableIslands.map((island) => ({
              label: island.name,
              value: island.id,
            }))}
            value={selectedIsland?.id || ""}
            onChange={(value) => {
              const island = selectableIslands.find(
                (island) => island.id === value
              );
              setSelectedIsland(island || null);
            }}
            disableLabel
          />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="*:text-center">
            <TableHead>{new Date().getFullYear()}년</TableHead>
            <TableHead>전체</TableHead>
            <TableHead>1월</TableHead>
            <TableHead>2월</TableHead>
            <TableHead>3월</TableHead>
            <TableHead>4월</TableHead>
            <TableHead>5월</TableHead>
            <TableHead>6월</TableHead>
            <TableHead>7월</TableHead>
            <TableHead>8월</TableHead>
            <TableHead>9월</TableHead>
            <TableHead>10월</TableHead>
            <TableHead>11월</TableHead>
            <TableHead>12월</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="**:text-center">
          {initialPlaceholderData.map((row) => (
            <TableRow key={row[0]}>
              {row.map((cell, i) => {
                const isSuhangryulRow = row[0] === "수행률";
                const isDataCell = i > 0; // Excludes the row title cell like "수행률"
                // assumedCurrentCalendarMonth is 5 (May), so currentMonthDataColIndex is 6
                const currentMonthDataColIndex =
                  assumedCurrentCalendarMonth + 1;
                const isCurrentMonthColumn = i === currentMonthDataColIndex;

                let cellContent: React.ReactNode = cell;
                const classNames: Record<string, boolean> = {};

                if (isSuhangryulRow && isDataCell && typeof cell === "number") {
                  cellContent = `${cell}%`;
                  // Apply colors if it's not the current month's column
                  // This will include the "전체" column and all other months except the current one.
                  if (!isCurrentMonthColumn) {
                    if (cell < 100) {
                      classNames["bg-red-500"] = true;
                      classNames["text-white"] = true;
                    } else if (cell === 100) {
                      classNames["bg-blue-500"] = true;
                      classNames["text-white"] = true;
                    }
                  }
                }

                return (
                  <TableCell
                    key={row[0] + i.toString()}
                    className={cn(classNames)}
                  >
                    {cellContent}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="w-full mt-6">
        <ChartContainer
          config={chartConfig}
          className="min-h-[300px] max-h-[300px] w-full"
        >
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              xAxisId={0}
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              width={24}
            />
            <XAxis
              dataKey="name"
              xAxisId={1}
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              width={24}
              hide
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="plan" fill="hsl(0, 0%, 90%)" radius={6} xAxisId={0} />
            <Bar dataKey="actual" radius={6} xAxisId={1}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.actualFillColor}
                  fillOpacity={entry.actualFillOpacity}
                />
              ))}
              <LabelList
                dataKey="suhaengryul"
                position="center"
                formatter={(value: number | null) =>
                  value !== null && value !== 0 ? `${value}%` : ""
                }
                className="font-bold"
                fill="white"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </>
  );
};

export default DashboardMainClient;

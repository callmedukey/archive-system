"use client";

import React, { startTransition, useActionState, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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
}

const DashboardMainClient = ({ regions, role }: DashboardMainClientProps) => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
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

  const initialPlaceholderData = [
    ["월별보고", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ["활동계획", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ["진행계획", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ["활동보고", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  // Calculate monthly totals across all categories
  const chartData = Array.from({ length: 12 }, (_, monthIndex) => {
    // For each month, sum values across all categories
    const monthTotal = initialPlaceholderData.reduce(
      (sum, category) => sum + Number(category[monthIndex + 1]),
      0
    );
    return {
      name: `${monthIndex + 1}월`,
      value: monthTotal,
    };
  });

  const chartConfig = {
    value: {
      label: "월별 합계",
      color: "hsl(220, 70%, 50%)",
    },
  };

  return (
    <>
      {role !== Role.USER && (
        <div className="max-w-xs grid grid-cols-2 gap-2">
          <SelectWithLabel
            label="권역"
            name="region"
            placeholder="권역 선택"
            className="rounded-lg"
            options={regions.map((region) => ({
              label: region.name,
              value: region.id,
            }))}
            value={selectedRegion?.id || ""}
            onChange={(value) => {
              const region = regions.find((region) => region.id === value);
              setSelectedRegion(region || null);
              handleRegionChange(value as string);
            }}
            disableLabel
          />
          <SelectWithLabel
            label="섬"
            name="island"
            placeholder={
              selectedRegion ? "선택된 권역의 섬 선택" : "권역을 선택해주세요."
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
              {row.map((cell, i) => (
                <TableCell key={row[0] + i.toString()}>{cell}</TableCell>
              ))}
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
              tickLine={false}
              tickMargin={2}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-primary)" radius={6} />
          </BarChart>
        </ChartContainer>
      </div>
    </>
  );
};

export default DashboardMainClient;

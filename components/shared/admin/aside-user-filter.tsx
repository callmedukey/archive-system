"use client";

import { useState, useTransition } from "react";

import {
  getAdminsByRegion,
  getUsersByRegion,
} from "@/app/(after-auth)/super-admin/actions/dashboard-filters";
import { Role } from "@/db/schemas";
import { Region } from "@/db/schemas";
import { cn } from "@/lib/utils";
import renderRole from "@/lib/utils/parse/render-role";

import SelectWithLabel from "../select-with-label";
import { useUsersData } from "./users-data-context-provider";

interface AsideUserFilterProps {
  regions: Region[];
  userRole: Role;
}

const AsideUserFilter = ({ regions, userRole }: AsideUserFilterProps) => {
  const { setUsers, role, setRole } = useUsersData();

  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRegionChange = async (value: string | number) => {
    const regionId = String(value);
    const region = regions.find((r) => r.id === regionId) || null;
    setSelectedRegion(region);

    startTransition(async () => {
      if (role === Role.ADMIN) {
        const data = await getAdminsByRegion(regionId);
        setUsers(data);
      } else if (role === Role.USER) {
        const data = await getUsersByRegion(regionId);
        setUsers(data);
      } else {
        setUsers([]);
      }
    });
  };

  const handleRoleChange = (value: string | number) => {
    const newRole = String(value) as Role;
    setRole(newRole);
    setUsers([]);
    setSelectedRegion(null);
  };

  if (userRole !== Role.SUPERADMIN) {
    return null;
  }

  return (
    <>
      <aside className="max-w-md grid grid-cols-2 gap-2">
        <SelectWithLabel
          name="role"
          options={Object.values(Role)
            .filter((r) => r !== Role.SUPERADMIN)
            .map((r) => ({
              label: renderRole(r),
              value: r,
            }))}
          label=""
          disableLabel
          className={cn("w-full", isPending && "animate-pulse")}
          disabled={isPending}
          placeholder="역할 선택"
          value={role as string}
          onChange={handleRoleChange}
        />
        <SelectWithLabel
          name="region"
          label=""
          options={regions.map((region) => ({
            label: region.name,
            value: region.id,
          }))}
          disableLabel
          value={selectedRegion?.id || ""}
          placeholder="권역 선택"
          onChange={handleRegionChange}
          disabled={isPending || !role}
          className="w-full grow"
        />
      </aside>
      <div className="mt-6">
        {!selectedRegion && (
          <p className="text-sm text-gray-500">권역을 선택해주세요.</p>
        )}
      </div>
    </>
  );
};

export default AsideUserFilter;

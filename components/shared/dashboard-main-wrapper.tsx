import React from "react";

import { Region, Role } from "@/db/schemas";
import { getRegions } from "@/lib/utils/db/fetchers/areas";

interface DashboardMainWrapperProps {
  role: Role;
  children: (regions: Region[]) => React.ReactNode;
}

const DashboardMainWrapper = async ({
  role,
  children,
}: DashboardMainWrapperProps) => {
  let regions: Region[] = [];

  if (role === Role.SUPERADMIN) {
    regions = await getRegions();
  }

  return children(regions);
};

export default DashboardMainWrapper;

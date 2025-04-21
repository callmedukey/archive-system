import React from "react";

import { auth } from "@/auth";
import { Region, Role } from "@/db/schemas";
import { getRegions } from "@/lib/utils/db/fetchers/areas";

interface DashboardMainWrapperProps {
  role: Role;
  children: (regions: Region[], regionId?: string) => React.ReactNode;
}

const DashboardMainWrapper = async ({
  role,
  children,
}: DashboardMainWrapperProps) => {
  let regions: Region[] = [];

  const session = await auth();

  if (!session) {
    return null;
  }

  if (role !== Role.USER) {
    regions = await getRegions();
  }

  return children(regions, session.user.regionId);
};

export default DashboardMainWrapper;

import React from "react";

import { getRegions } from "@/lib/utils/db/fetchers/areas";

import DashboardMainClient from "./dashboard-main-client";

const DashboardMainWrapper = async () => {
  const regions = await getRegions();

  return <DashboardMainClient regions={regions} />;
};

export default DashboardMainWrapper;

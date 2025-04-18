import React from "react";

import { Region } from "@/db/schemas";
import { getRegions } from "@/lib/utils/db/fetchers/areas";

interface AsideRegionsWrapperProps {
  children: (regions: Region[]) => React.ReactNode;
}

const AsideRegionsWrapper = async ({ children }: AsideRegionsWrapperProps) => {
  const regions = await getRegions();

  return children(regions);
};

export default AsideRegionsWrapper;

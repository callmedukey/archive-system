import React from "react";

import { Region } from "@/db/schemas";
import { getRegions } from "@/lib/utils/db/fetchers/areas";

interface RegionsWrapperProps {
  children: (regions: Region[]) => React.ReactNode;
}

const RegionsWrapper = async ({ children }: RegionsWrapperProps) => {
  const regions = await getRegions();

  return children(regions);
};

export default RegionsWrapper;

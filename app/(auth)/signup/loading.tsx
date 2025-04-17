import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

const loading = () => {
  return (
    <Skeleton className="w-full max-w-md h-full min-h-[50rem] rounded-2xl" />
  );
};

export default loading;

import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

const loading = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">알림</h1>
        </div>
      </div>
      <div className="grid gap-4 mt-12">
        {[...Array(10)].map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
};

export default loading;

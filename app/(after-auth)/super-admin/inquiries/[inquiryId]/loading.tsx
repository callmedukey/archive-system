import React from "react";

import LoadingSpinner from "@/components/ui/loading-spinner";

const loading = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
};

export default loading;

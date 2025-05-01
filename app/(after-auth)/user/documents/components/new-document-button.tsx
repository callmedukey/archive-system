import { PlusIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

const NewDocumentButton = () => {
  return (
    <Button asChild className="fixed bottom-4 right-4">
      <Link href="/user/documents/new">
        <PlusIcon className="w-4 h-4 mr-2" />새 자료 등록
      </Link>
    </Button>
  );
};

export default NewDocumentButton;

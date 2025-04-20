"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { Button } from "../ui/button";

const EditButton = () => {
  const pathname = usePathname();

  return (
    <Button variant="outline" className="rounded-lg" asChild>
      <Link href={`${pathname}/edit`}>
        <Pencil className="w-4 h-4" /> 수정
      </Link>
    </Button>
  );
};

export default EditButton;

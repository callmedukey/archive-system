"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import React, { Dispatch, SetStateAction, useState } from "react";

import SearchInputWithButton from "@/components/shared/search-input-with-button";
import SelectWithLabel from "@/components/shared/select-with-label";
import { Button } from "@/components/ui/button";
import { FetchedNotice } from "@/db/schemas";

import { queryNotices } from "../actions/query-notices";

interface AsideNoticesQueryProps {
  setNotices: Dispatch<SetStateAction<FetchedNotice[]>>;
  startTransition: (fn: () => Promise<void>) => void;
}

const AsideNoticesQuery = ({
  setNotices,
  startTransition,
}: AsideNoticesQueryProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleOrderByChange = (value: string | number) => {
    if (value === "latest") {
      setNotices((notices: FetchedNotice[]) =>
        [...notices].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } else {
      setNotices((notices: FetchedNotice[]) =>
        [...notices].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
    }
  };

  const handleSearch = async () => {
    startTransition(async () => {
      const results = await queryNotices(searchTerm);
      setNotices(results);
    });
  };

  return (
    <aside className="mt-6 flex items-end justify-between">
      <div className="grid grid-cols-2 gap-2 max-w-xs items-baseline">
        <SearchInputWithButton
          className="rounded-lg"
          name="query"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          onSearch={handleSearch}
        />
        <SelectWithLabel
          label="정렬"
          disableLabel
          name="orderBy"
          options={[
            { label: "최신순", value: "latest" },
            { label: "오래된순", value: "oldest" },
          ]}
          placeholder="최신순"
          defaultValue="latest"
          className="rounded-lg"
          onChange={handleOrderByChange}
        />
      </div>
      <Button className="rounded-lg" asChild>
        <Link href="/super-admin/manage-notice/new">
          <Plus />
          공지사항 작성
        </Link>
      </Button>
    </aside>
  );
};

export default AsideNoticesQuery;

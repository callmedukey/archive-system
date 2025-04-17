import Link from "next/link";

import SearchInputWithButton from "@/components/shared/search-input-with-button";
import StandardPagination from "@/components/shared/standard-pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
const page = async () => {
  return (
    <div className="">
      <h1>카테고리 및 양식관리</h1>
      <aside className="mt-6 flex justify-between items-center">
        <form className="max-w-[15rem]">
          <SearchInputWithButton
            disableLabel
            placeholder="검색"
            name="query"
            className="rounded-lg"
          />
        </form>
        <Button className="rounded-lg" asChild>
          <Link href="/super-admin/manage-categories/new">신규 카테고리</Link>
        </Button>
      </aside>
      <section className="mt-6">
        <Table>
          <TableHeader className="bg-primary-foreground **:text-center">
            <TableRow>
              <TableHead className="">자료 카테고리</TableHead>
              <TableHead>하위 카테고리</TableHead>
              <TableHead>단계 여부</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead>...</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="**:text-center *:not-first:border-t">
            <TableRow className="*:py-4">
              <TableCell>마을발전보고서</TableCell>
              <TableCell>-</TableCell>
              <TableCell>여</TableCell>
              <TableCell>2025년 1월 1일 13:00</TableCell>
              <TableCell>
                <Button className="rounded-lg" variant={"outline"}>
                  수정하기
                </Button>
              </TableCell>
            </TableRow>
            <TableRow className="">
              <TableCell>마을발전보고서</TableCell>
              <TableCell>-</TableCell>
              <TableCell>여</TableCell>
              <TableCell>2025년 1월 1일 13:00</TableCell>
              <TableCell>
                <Button className="rounded-lg" variant={"outline"}>
                  수정하기
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
      <aside className="mt-6">
        <StandardPagination
          currentPage={1}
          totalPages={10}
          paginationItemsToDisplay={5}
        />
      </aside>
    </div>
  );
};

export default page;

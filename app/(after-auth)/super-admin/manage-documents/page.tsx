import { format } from "date-fns";
import { EllipsisIcon, Pen } from "lucide-react";
import Link from "next/link";

import SearchInputWithButton from "@/components/shared/search-input-with-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";

import DeleteDocumentFormatButton from "./components/delete-document-format-button";

const page = async () => {
  const documentFormats = await db.query.documentFormats.findMany();

  return (
    <div className="">
      <h1>양식관리</h1>
      <aside className="mt-6 flex justify-between items-center">
        <form className="max-w-[15rem]">
          <SearchInputWithButton
            disableLabel
            placeholder="검색"
            name="query"
            className="rounded-lg"
          />
        </form>
        <div className="flex gap-2">
          <Button className="rounded-lg" asChild>
            <Link href="/super-admin/manage-documents/new">양식 생성</Link>
          </Button>
          <Button className="rounded-lg" asChild>
            <Link href="/super-admin/manage-documents/activities">
              활동 관리
            </Link>
          </Button>
        </div>
      </aside>
      <section className="mt-6">
        <Table>
          <TableHeader className="bg-primary-foreground **:text-center">
            <TableRow>
              <TableHead className="">자료 명</TableHead>
              <TableHead className="w-[10rem]">생성일</TableHead>
              <TableHead className="w-[10rem]">...</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="**:text-center *:not-first:border-t">
            {documentFormats.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  등록된 자료가 없습니다.
                </TableCell>
              </TableRow>
            )}
            {documentFormats.map((documentFormat) => (
              <TableRow key={documentFormat.id} className="*:py-4">
                <TableCell>{documentFormat.name}</TableCell>
                <TableCell>
                  {format(new Date(documentFormat.createdAt), "yyyy-MM-dd")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <EllipsisIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/super-admin/manage-documents/update/${documentFormat.id}`}
                          className="flex items-center gap-2 py-0.5 rounded-lg"
                        >
                          <Pen className="size-4" />
                          수정
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <DeleteDocumentFormatButton id={documentFormat.id} />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
};

export default page;

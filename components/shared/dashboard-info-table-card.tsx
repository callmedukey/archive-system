import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardInfoTableCardProps {
  title: string;
  data: {
    number: string;
    title: string;
    date: string;
  }[];
}

const DashboardInfoTableCard = ({
  title,
  data,
}: DashboardInfoTableCardProps) => {
  return (
    <Card className="w-full py-0 overflow-clip gap-0">
      <CardHeader className="bg-primary items-center flex py-2 justify-center relative">
        <CardTitle className="font-medium text-white">{title}</CardTitle>
        <span className="right-2 absolute text-xs text-white underline font-semibold cursor-pointer">
          더보기
        </span>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[12rem] w-full">
          <Table className="py-0 max-w-[100%]">
            <TableHeader className="bg-primary-foreground">
              <TableRow className="*:h-0 *:py-1">
                <TableHead className="text-center border-r">구분</TableHead>
                <TableHead className="w-[70%] text-center border-r">
                  제목
                </TableHead>
                <TableHead className="text-center">날짜</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {data.map((item, index) => (
                <TableRow className="border-b" key={title + index}>
                  <TableCell className="font-medium text-center border-r text-xs">
                    {item.number}
                  </TableCell>
                  <TableCell className="font-medium text-left border-r text-xs">
                    {item.title}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {item.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DashboardInfoTableCard;

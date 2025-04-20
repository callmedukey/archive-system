import React from "react";

import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  Table,
  TableCell,
} from "@/components/ui/table";
import { Region } from "@/db/schemas";
interface RegionsTableProps {
  regions: Region[];
}

const RegionsTable = ({ regions }: RegionsTableProps) => {
  return (
    <Table className="**:text-center mt-6">
      <TableHeader className="bg-primary-foreground">
        <TableRow>
          <TableHead className="">번호</TableHead>
          <TableHead>권역명</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {regions.map((region, index) => (
          <TableRow key={region.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{region.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RegionsTable;

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

import DeleteRegionButton from "./delete-region-button";
interface RegionsTableProps {
  regions: Region[];
}

const RegionsTable = ({ regions }: RegionsTableProps) => {
  return (
    <Table className="**:text-center mt-6">
      <TableHeader className="bg-primary-foreground">
        <TableRow>
          <TableHead className="">번호</TableHead>
          <TableHead className="w-full">권역명</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {regions.map((region, index) => (
          <TableRow key={region.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{region.name}</TableCell>
            <TableCell>
              <DeleteRegionButton regionId={region.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RegionsTable;

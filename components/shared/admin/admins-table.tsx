import { format } from "date-fns";
import React from "react";

import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { User, VerificationStatus } from "@/db/schemas";
import renderVerificationStatus from "@/lib/utils/parse/render-verification-status";

import { useUsersData } from "./users-data-context-provider";
import SelectWithLabel from "../select-with-label";

interface AdminsTableProps {
  isPending: boolean;
  handleVerificationStatusChange: (
    userId: string,
    status: VerificationStatus
  ) => void;
}

const AdminsTable = ({
  isPending,
  handleVerificationStatusChange,
}: AdminsTableProps) => {
  const { users } = useUsersData();
  return (
    <Table className="**:text-center">
      <TableHeader className="bg-primary-foreground">
        <TableRow>
          <TableHead className="">권역</TableHead>
          <TableHead>가입상태</TableHead>
          <TableHead>이름</TableHead>
          <TableHead>연락처</TableHead>
          <TableHead>메일 주소</TableHead>
          <TableHead>가입일자</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(users as (User & { region: string })[]).map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.region}</TableCell>
            <TableCell>
              <SelectWithLabel
                label=""
                name="verified"
                options={Object.values(VerificationStatus).map((status) => ({
                  label: renderVerificationStatus(status),
                  value: status,
                }))}
                disabled={isPending}
                defaultValue={user.verified as string}
                onChange={(value) => {
                  handleVerificationStatusChange(
                    user.id,
                    value as VerificationStatus
                  );
                }}
                disableLabel
              />
            </TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.phone}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              {user.createdAt
                ? format(new Date(user.createdAt), "yyyy-MM-dd HH:mm")
                : "N/A"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminsTable;

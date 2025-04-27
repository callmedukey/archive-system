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
import { VerificationStatus } from "@/db/schemas";
import renderVerificationStatus from "@/lib/utils/parse/render-verification-status";

import SelectWithLabel from "../select-with-label";
import { useUsersData } from "./users-data-context-provider";
import UsersTableDateSelector from "./users-table-date-selector";

interface UsersTableProps {
  isPending: boolean;
  handleVerificationStatusChange: (
    userId: string,
    status: VerificationStatus
  ) => void;
}

const UsersTable = ({
  isPending,
  handleVerificationStatusChange,
}: UsersTableProps) => {
  const { users } = useUsersData();
  return (
    <Table className="**:text-center">
      <TableHeader className="bg-primary-foreground">
        <TableRow>
          <TableHead className="">섬</TableHead>
          <TableHead>가입상태</TableHead>
          <TableHead>사업 단계</TableHead>
          <TableHead>연락처</TableHead>
          <TableHead>메일 주소</TableHead>
          <TableHead>계약기간</TableHead>
          <TableHead>회사명</TableHead>
          <TableHead>회사 연락처</TableHead>
          <TableHead>가입일자</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.username}</TableCell>
            <TableCell>
              {user.verified !== VerificationStatus.VERIFIED && (
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
              )}
              {user.verified === VerificationStatus.VERIFIED && (
                <span>{renderVerificationStatus(user.verified)}</span>
              )}
            </TableCell>
            <TableCell>{user.level}단계</TableCell>
            <TableCell>{user.phone}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <UsersTableDateSelector
                userId={user.id}
                from={user.contractPeriodStart ?? undefined}
                to={user.contractPeriodEnd ?? undefined}
              />
            </TableCell>
            <TableCell>{user.company}</TableCell>
            <TableCell>{user.companyPhone}</TableCell>
            <TableCell>
              {format(new Date(user.createdAt!), "yyyy-MM-dd HH:mm")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;

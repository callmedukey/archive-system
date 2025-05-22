"use client";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import React, { useState, ChangeEvent, useEffect, useTransition } from "react";
import { toast } from "sonner";

import { deleteUser, updateUser } from "@/app/(after-auth)/actions/update-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { Role, VerificationStatus, User } from "@/db/schemas";
import renderVerificationStatus from "@/lib/utils/parse/render-verification-status";

import SelectWithLabel from "../select-with-label";
import { useUsersData } from "./users-data-context-provider";
import UsersTableDateSelector from "./users-table-date-selector";
import ButtonWithLoading from "../button-with-loading";

interface UsersTableProps {
  isPending: boolean;
  handleVerificationStatusChange: (
    userId: string,
    status: VerificationStatus
  ) => void;
}

type EditableUser = Omit<
  User,
  "level" | "createdAt" | "contractPeriodStart" | "contractPeriodEnd"
> & {
  level: number | string;
  createdAt: string | Date;
  contractPeriodStart?: string | Date;
  contractPeriodEnd?: string | Date;
};

const UsersTable = ({
  isPending,
  handleVerificationStatusChange,
}: UsersTableProps) => {
  const { users } = useUsersData();
  const session = useSession();
  const isAdmin = session.data?.user.role === Role.SUPERADMIN;
  const [isPendingTransition, startTransition] = useTransition();

  const [editingUser, setEditingUser] = useState<Partial<EditableUser> | null>(
    null
  );
  const [isPopoverOpen, setPopoverOpen] = useState(false);

  const handleEditClick = (user: User) => {
    setEditingUser({
      ...user,
      level: user.level === null ? "" : user.level,
      createdAt: user.createdAt
        ? typeof user.createdAt === "string"
          ? user.createdAt
          : new Date(user.createdAt).toISOString()
        : "",
      contractPeriodStart: user.contractPeriodStart
        ? typeof user.contractPeriodStart === "string"
          ? new Date(user.contractPeriodStart)
          : new Date(user.contractPeriodStart)
        : undefined,
      contractPeriodEnd: user.contractPeriodEnd
        ? typeof user.contractPeriodEnd === "string"
          ? new Date(user.contractPeriodEnd)
          : new Date(user.contractPeriodEnd)
        : undefined,
    });
    setPopoverOpen(true);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editingUser) return;
    const { name, value } = e.target;
    setEditingUser({
      ...editingUser,
      [name]: name === "level" ? (value === "" ? "" : Number(value)) : value,
    });
  };

  const handleVerificationChangeInPopover = (value: string | number) => {
    if (!editingUser) return;
    setEditingUser({ ...editingUser, verified: value as VerificationStatus });
  };

  const handleSave = async () => {
    if (!editingUser || !editingUser.id) return;

    try {
      const finalPayload: Partial<User> = {};

      if (editingUser.hasOwnProperty("level")) {
        const levelValue = editingUser.level; // Should be string | number based on EditableUser and input handling
        if (typeof levelValue === "string") {
          if (levelValue === "") {
            finalPayload.level = null;
          } else {
            const num = parseInt(levelValue, 10);
            finalPayload.level = isNaN(num) ? null : num;
          }
        } else if (typeof levelValue === "number") {
          finalPayload.level = levelValue;
        } else if (levelValue === null) {
          finalPayload.level = null;
        }
        // If levelValue is undefined, it won't be added to finalPayload, which is correct.
      }

      if (editingUser.hasOwnProperty("verified")) {
        finalPayload.verified = editingUser.verified as VerificationStatus;
      }
      if (editingUser.hasOwnProperty("phone")) {
        finalPayload.phone = editingUser.phone;
      }
      if (editingUser.hasOwnProperty("email")) {
        finalPayload.email = editingUser.email;
      }
      if (editingUser.hasOwnProperty("company")) {
        finalPayload.company = editingUser.company;
      }
      if (editingUser.hasOwnProperty("companyPhone")) {
        finalPayload.companyPhone = editingUser.companyPhone;
      }

      startTransition(async () => {
        const result = await updateUser(editingUser.id as string, finalPayload);
        if (result.success) {
          toast.success(result.success);
          window.location.reload();
        } else {
          toast.error(result.error);
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("사용자 정보 수정 중 오류가 발생했습니다.");
    }
    setPopoverOpen(false);
    setEditingUser(null);
  };

  const handleDelete = async (userId: string) => {
    if (
      window.confirm(
        "정말 삭제하시겠습니까? 이 작업은 취소할 수 없습니다. 사용자의 모든 데이터가 삭제됩니다."
      )
    ) {
      try {
        const result = await deleteUser(userId);
        if (result.success) {
          toast.success(result.success);
          window.location.reload();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error(error);
        toast.error("사용자 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    if (!isPopoverOpen) {
      setEditingUser(null);
    }
  }, [isPopoverOpen]);

  return (
    <>
      <Table className="**:text-center">
        <TableHeader className="bg-primary-foreground">
          <TableRow>
            <TableHead className="">이름</TableHead>
            <TableHead>가입상태</TableHead>
            <TableHead>사업 단계</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead>메일 주소</TableHead>
            <TableHead>계약기간</TableHead>
            <TableHead>회사명</TableHead>
            <TableHead>회사 연락처</TableHead>
            <TableHead>가입일자</TableHead>
            {isAdmin && <TableHead>관리</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>
                {isAdmin ? (
                  <span>
                    {user.verified
                      ? renderVerificationStatus(user.verified)
                      : "N/A"}
                  </span>
                ) : user.verified !== VerificationStatus.VERIFIED ? (
                  <SelectWithLabel
                    label=""
                    name="verified"
                    options={Object.values(VerificationStatus).map(
                      (status) => ({
                        label: renderVerificationStatus(status),
                        value: status,
                      })
                    )}
                    disabled={isPending}
                    defaultValue={(user.verified ?? "") as string}
                    onChange={(value) => {
                      handleVerificationStatusChange(
                        user.id,
                        value as VerificationStatus
                      );
                    }}
                    disableLabel
                  />
                ) : (
                  <span>
                    {user.verified
                      ? renderVerificationStatus(user.verified)
                      : "N/A"}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {user.level === null ? "N/A" : `${user.level}단계`}
              </TableCell>
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
                {user.createdAt
                  ? format(new Date(user.createdAt!), "yyyy-MM-dd HH:mm")
                  : "N/A"}
              </TableCell>
              {isAdmin && (
                <TableCell className="space-x-2">
                  <Popover
                    open={isPopoverOpen && editingUser?.id === user.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setEditingUser(null);
                      }
                      setPopoverOpen(open);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(user)}
                      >
                        수정
                      </Button>
                    </PopoverTrigger>
                    {editingUser?.id === user.id && (
                      <PopoverContent
                        className="w-96"
                        side="left"
                        align="start"
                      >
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">
                              사용자 정보 수정
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              사용자의 세부 정보를 수정하세요.
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="level">사업 단계 (숫자)</Label>
                            <Input
                              id="level"
                              name="level"
                              type="number"
                              value={editingUser.level || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="verified">가입 상태</Label>
                            <SelectWithLabel
                              label=""
                              name="verified"
                              options={Object.values(VerificationStatus).map(
                                (status) => ({
                                  label: renderVerificationStatus(status),
                                  value: status,
                                })
                              )}
                              value={editingUser.verified || ""}
                              onChange={handleVerificationChangeInPopover}
                              disableLabel
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="phone">연락처</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={editingUser.phone || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="email">메일 주소</Label>
                            <Input
                              id="email"
                              name="email"
                              value={editingUser.email || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="company">회사명</Label>
                            <Input
                              id="company"
                              name="company"
                              value={editingUser.company || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="companyPhone">회사 연락처</Label>
                            <Input
                              id="companyPhone"
                              name="companyPhone"
                              value={editingUser.companyPhone || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="flex justify-end space-x-2 pt-2">
                            <Button
                              variant="ghost"
                              onClick={() => setPopoverOpen(false)}
                            >
                              취소
                            </Button>
                            <ButtonWithLoading
                              onClick={handleSave}
                              disabled={isPendingTransition || !editingUser}
                              isLoading={isPendingTransition}
                            >
                              변경사항 저장
                            </ButtonWithLoading>
                          </div>
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    삭제
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default UsersTable;

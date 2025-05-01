"use client";
import React, { useTransition } from "react";
import { toast } from "sonner";

import { updateVerifiedStatus } from "@/app/(after-auth)/super-admin/actions/auth-update";
import { Role, VerificationStatus } from "@/db/schemas";

import AdminsTable from "./admins-table";
import { useUsersData } from "./users-data-context-provider";
import UsersTable from "./users-table";

const SectionUsersTable = () => {
  const { role } = useUsersData();
  const [isPending, startTransition] = useTransition();

  const handleVerificationStatusChange = (
    userId: string,
    status: VerificationStatus
  ) => {
    startTransition(async () => {
      const { message, error } = await updateVerifiedStatus(userId, status);

      if (error) {
        toast.error(error);
      } else {
        toast.success(message);
      }
    });
  };

  return (
    <section className="mt-6 max-w-full">
      {role === Role.USER && (
        <UsersTable
          isPending={isPending}
          handleVerificationStatusChange={handleVerificationStatusChange}
        />
      )}
      {role === Role.ADMIN && (
        <AdminsTable
          isPending={isPending}
          handleVerificationStatusChange={handleVerificationStatusChange}
        />
      )}
    </section>
  );
};

export default SectionUsersTable;

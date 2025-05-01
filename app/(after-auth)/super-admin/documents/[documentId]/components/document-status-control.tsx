"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleUserRound } from "lucide-react";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { DocumentStatus, Role, User } from "@/db/schemas";
import { DocumentType } from "@/db/schemas/documents";
import formatDate from "@/lib/utils/parse/format-date";
import statusLabels from "@/lib/utils/parse/status-labels";

import { requestEdit } from "../actions/request-edit";

const calculateDaysBetween = (
  date1?: Date | null,
  date2?: Date | null
): number | null => {
  if (!date1 || !date2) return null;
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const radioStatuses = [
  DocumentStatus.SUBMITTED,
  DocumentStatus.EDIT_REQUESTED,
  DocumentStatus.EDIT_COMPLETED,
  DocumentStatus.UNDER_REVIEW,
  DocumentStatus.APPROVED,
];

// Zod schema for the form
const formSchema = z.object({
  status: z.nativeEnum(DocumentStatus),
  editRequestReason: z.string().optional(),
});

interface DocumentStatusControlProps {
  document: DocumentType;
  currentUserRole: Role;
  editRequestAuthor?: User;
}

const DocumentStatusControl = ({
  document,
  currentUserRole,
  editRequestAuthor,
}: DocumentStatusControlProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: document.status ?? DocumentStatus.SUBMITTED,
      editRequestReason: "",
    },
  });
  const [isPending, startTransition] = useTransition();

  const { editRequestDate, approvedDate, editRequestReason } = document;

  const editCompletedDate = document.editCompletedDate;

  const daysForEditCompletion = calculateDaysBetween(
    editRequestDate,
    editCompletedDate
  );
  const daysForReviewCompletion = calculateDaysBetween(
    editCompletedDate,
    approvedDate
  );

  const canAddReason = [Role.ADMIN, Role.SUPERADMIN].includes(currentUserRole);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (
      values.status !== DocumentStatus.EDIT_REQUESTED &&
      document.status === values.status
    ) {
      toast.error("상태가 변경되지 않았습니다.");
      return;
    }

    if (
      values.status === DocumentStatus.EDIT_REQUESTED &&
      (!values.editRequestReason || values.editRequestReason.length === 0)
    ) {
      toast.error("보완 요청 사유를 입력해주세요.");
      return;
    }

    if (!document.id) {
      toast.error("문서 ID가 없습니다.");
      return;
    }

    startTransition(async () => {
      const result = await requestEdit({
        documentId: document.id,
        editRequestReason: values.editRequestReason as string,
        newStatus: values.status,
      });

      if (result.success) {
        toast.success("보완 요청이 등록되었습니다.");
        form.reset();
      } else {
        toast.error("보완 요청 등록에 실패했습니다.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">문서 상태 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Status Radio Group */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>상태 변경</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      {radioStatuses.map((status) => (
                        <FormItem
                          key={status}
                          className="flex items-center space-x-2 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={status} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {statusLabels[status]}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Information */}
            <div className="p-3 border rounded text-sm bg-gray-50">
              보완요청일:{" "}
              {editRequestDate ? formatDate(editRequestDate) : "N/A"} /
              보완완료일:{" "}
              {editCompletedDate ? formatDate(editCompletedDate) : "N/A"}{" "}
              {/* Added null check */}
              {daysForEditCompletion !== null &&
                ` (${daysForEditCompletion}일 소요)`}{" "}
              / 검토완료일: {approvedDate ? formatDate(approvedDate) : "N/A"}{" "}
              {/* Added null check */}
              {daysForReviewCompletion !== null &&
                ` (${daysForReviewCompletion}일 소요)`}
            </div>

            {/* Existing Edit Request Reason Display */}
            {editRequestReason && (
              <div className="p-4 border rounded bg-gray-50 space-y-2">
                <div className="flex items-center text-sm font-medium space-x-2">
                  <CircleUserRound className="w-5 h-5 text-gray-500" />
                  <span>
                    {editRequestAuthor?.role === Role.SUPERADMIN
                      ? "총괄관리자"
                      : "관리자"}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{editRequestReason}</p>
              </div>
            )}

            {/* New Reason Input for Admins/Super Admins */}
            {canAddReason && (
              <FormField
                control={form.control}
                name="editRequestReason"
                render={({ field }) => (
                  <FormItem>
                    {/* Mimicking comment input style */}
                    <div className="p-4 border rounded bg-white">
                      <div className="flex items-center mb-2">
                        <CircleUserRound className="w-5 h-5 text-gray-500 mr-2" />
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="요청 사유 입력"
                          className="resize-none border-0 focus-visible:ring-0 shadow-none p-0"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-end mt-2">
                        <Button type="submit" size="sm" disabled={isPending}>
                          {isPending ? "변경중..." : "변경"}
                        </Button>
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}

            {/* Only show submit button if not adding a reason (or combine logic) */}
            {!canAddReason && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "업데이트중..." : "상태 업데이트"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DocumentStatusControl;

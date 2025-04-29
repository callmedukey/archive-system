"use client";

import React, {
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import InputWithLabelAndError from "@/components/shared/input-with-label-and-error";
import SelectWithLabel from "@/components/shared/select-with-label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActionResponse } from "@/types/action";

import ActivityContentListItem from "./activity-content-list-item";
import ActivityTypeListItem from "./activity-type-list-item";
import {
  createActivityContent,
  createActivityType,
} from "../actions/crud-activity";

interface ActivityDialogProps {
  activities: {
    activityType: {
      id: string;
      name: string;
      textCode: string;
      createdAt: Date | null;
    } | null;
    id: string;
    name: string;
    numericalCode: number;
    activityTypeId: string | null;
    createdAt: Date | null;
  }[];
  activityTypes: {
    id: string;
    name: string;
    textCode: string;
    createdAt: Date | null;
  }[];
}

const initialState = {
  success: false,
  message: "",
  errors: undefined,
};

type Tab = "type" | "content" | "add-type" | "add-content";

const AddActivityDialog = ({
  activities,
  activityTypes,
}: ActivityDialogProps) => {
  const [tab, setTab] = useState<Tab>("type");
  const [t_isPending, startTransition] = useTransition();
  const [state, createActivityTypeAction, isPending] = useActionState<
    ActionResponse<{ name: string; textCode: string }>,
    FormData
  >(createActivityType, initialState);

  const [contentState, createActivityContentAction, contentIsPending] =
    useActionState<
      ActionResponse<{
        name?: string;
        numericalCode?: number;
        activityTypeId?: string;
      }>,
      FormData
    >(createActivityContent, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setTab("type");
    }
    if (state.success === false && state.message !== "") {
      toast.error(state.message);
    }
  }, [state.message, state.success]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-lg">활동 설정</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(50rem,90vh)] overflow-y-auto h-full flex flex-col">
        <DialogHeader className="h-fit">
          <DialogTitle>활동 설정</DialogTitle>
          <DialogDescription className="sr-only">
            활동을 추가하려면 아래 탭을 선택하세요.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={tab}
          defaultValue="type"
          className="w-full h-full relative"
          onValueChange={(value) => setTab(value as Tab)}
        >
          <TabsList className="w-full *:rounded-lg">
            <TabsTrigger value="type">활동 분류</TabsTrigger>
            <TabsTrigger value="add-type">활동 분류 추가</TabsTrigger>
            <TabsTrigger value="content">활동 내용</TabsTrigger>
            <TabsTrigger value="add-content">활동 내용 추가</TabsTrigger>
          </TabsList>
          <TabsContent value="type">
            <ul>
              {activityTypes.map((activityType, index) => (
                <ActivityTypeListItem
                  key={
                    activityType.id + activityType.name + activityType.textCode
                  }
                  activityType={activityType}
                  index={index}
                  isPending={isPending || contentIsPending || t_isPending}
                  startTransition={startTransition}
                />
              ))}
              {!activityTypes.length && (
                <p className="text-center text-sm text-muted-foreground py-6">
                  활동 분류가 없습니다.
                </p>
              )}
            </ul>
          </TabsContent>
          <TabsContent value="add-type" className="flex flex-col py-4 gap-2">
            <form action={createActivityTypeAction} className="space-y-2">
              <InputWithLabelAndError
                type="text"
                label="활동 분류 이름"
                name="name"
                placeholder=""
                defaultValue={String(state.inputs?.name ?? "")}
                error={state.errors?.name?.[0]}
              />
              <InputWithLabelAndError
                type="text"
                label="활동 분류 코드"
                name="textCode"
                placeholder=""
                defaultValue={String(state.inputs?.textCode ?? "")}
                error={state.errors?.textCode?.[0]}
              />
              <SubmitButton
                disabled={isPending || contentIsPending || t_isPending}
              />
            </form>
          </TabsContent>
          <TabsContent value="content">
            <ul>
              {activities.map((activity, index) => (
                <ActivityContentListItem
                  key={`${activity.id}-${activity.name}-${activity.numericalCode}-${activity.activityTypeId}`}
                  activity={activity}
                  activityTypes={activityTypes}
                  index={index}
                  isPending={isPending || contentIsPending || t_isPending}
                  startTransition={startTransition}
                />
              ))}
            </ul>
            {!activities.length && (
              <p className="text-center text-sm text-muted-foreground py-6">
                활동 내용이 없습니다.
              </p>
            )}
          </TabsContent>
          <TabsContent value="add-content">
            <form
              className="space-y-2 py-5"
              action={createActivityContentAction}
            >
              <SelectWithLabel
                label="활동 분류"
                name="activityTypeId"
                options={activityTypes.map((activityType) => ({
                  label: activityType.name,
                  value: activityType.id,
                }))}
              />
              {contentState.errors?.activityTypeId?.[0] && (
                <p className="text-red-500 text-sm">
                  {contentState.errors.activityTypeId[0]}
                </p>
              )}
              <InputWithLabelAndError
                type="text"
                label="활동 내용 이름"
                name="name"
                placeholder=""
                error={contentState.errors?.name?.[0]}
              />
              <InputWithLabelAndError
                type="number"
                label="활동 내용 번호"
                name="numericalCode"
                step={1}
                placeholder=""
                error={contentState.errors?.numericalCode?.[0]}
              />
              <SubmitButton
                disabled={isPending || contentIsPending || t_isPending}
              />
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const SubmitButton = ({ disabled }: { disabled: boolean }) => {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className="ml-auto mr-0 flex"
    >
      {pending ? "추가 중..." : "추가"}
    </Button>
  );
};

export default AddActivityDialog;

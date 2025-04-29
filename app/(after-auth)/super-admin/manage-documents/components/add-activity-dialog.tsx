"use client";

import { Save, Trash2 } from "lucide-react";
import React, {
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import InputWithLabelAndError from "@/components/shared/input-with-label-and-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActionResponse } from "@/types/action";

import {
  createActivityType,
  deleteActivityType,
  updateActivityType,
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
          <DialogTitle>활동 추가</DialogTitle>
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
                <li
                  key={activityType.id}
                  className="flex items-center justify-between gap-2 py-1"
                >
                  <span className="text-sm font-medium w-6 text-center">
                    {index + 1}.
                  </span>
                  <Input
                    defaultValue={activityType.name}
                    className="flex-1 min-w-0"
                  />
                  <Input
                    defaultValue={activityType.textCode}
                    className="w-20"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending || t_isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await updateActivityType({
                          id: activityType.id,
                          name: activityType.name,
                          textCode: activityType.textCode,
                        });
                        if (result.success) {
                          toast.success(result.message);
                        } else {
                          toast.error(result.message);
                        }
                      });
                    }}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending || t_isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await deleteActivityType({
                          id: activityType.id,
                        });
                        if (result.success) {
                          toast.success(result.message);
                        } else {
                          toast.error(result.message);
                        }
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
              {!activityTypes.length && (
                <p className="text-center text-sm text-muted-foreground">
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
              <SubmitButton disabled={isPending || t_isPending} />
            </form>
          </TabsContent>
          <TabsContent value="content">
            {activities.map((activity) => (
              <li key={activity.id}>
                <Input defaultValue={activity.name} className="flex-1" />
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
            {!activities.length && (
              <p className="text-center text-sm text-muted-foreground">
                활동 내용이 없습니다.
              </p>
            )}
          </TabsContent>
          <TabsContent value="add-content">
            <Input placeholder="활동 내용" />
            <Button>추가</Button>
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

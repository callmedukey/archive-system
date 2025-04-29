"use client";

import { Save, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import SelectWithLabel from "@/components/shared/select-with-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityContent, ActivityType } from "@/db/schemas";

import {
  deleteActivityContent,
  updateActivityContent,
} from "../actions/crud-activity";

interface ActivityContentListItemProps {
  activity: ActivityContent & { activityType: ActivityType | null };
  activityTypes: ActivityType[];
  index: number;
  isPending: boolean;
  startTransition: (fn: () => Promise<void>) => void;
}

const ActivityContentListItem = ({
  activity,
  activityTypes,
  index,
  isPending,
  startTransition,
}: ActivityContentListItemProps) => {
  const [name, setName] = useState(activity.name);
  const [numericalCode, setNumericalCode] = useState(activity.numericalCode);
  const [selectedActivityTypeId, setSelectedActivityTypeId] = useState(
    activity.activityTypeId
  );

  const handleUpdate = () => {
    startTransition(async () => {
      const result = await updateActivityContent({
        id: activity.id,
        name,
        numericalCode,
        activityTypeId: selectedActivityTypeId as string,
      });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteActivityContent({ id: activity.id });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <li
      key={activity.id}
      className="flex items-center justify-between gap-2 py-1"
    >
      <span className="text-sm font-medium w-6 text-center">{index + 1}.</span>
      <Input
        value={name}
        className="flex-1 w-full"
        onChange={(e) => setName(e.target.value)}
        placeholder="활동 내용 이름"
      />
      <Input
        value={numericalCode}
        type="number"
        className="w-16"
        onChange={(e) => setNumericalCode(Number(e.target.value))}
        placeholder="번호"
      />
      <div className="w-32">
        <SelectWithLabel
          label="활동 분류"
          disableLabel={true}
          className="w-full"
          name={`activityTypeId-${activity.id}`}
          value={selectedActivityTypeId ?? ""}
          onChange={(value) => setSelectedActivityTypeId(String(value) || null)}
          options={activityTypes.map((type) => ({
            label: type.name,
            value: type.id,
          }))}
          placeholder="분류 선택"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        onClick={handleUpdate}
      >
        <Save className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
};

export default ActivityContentListItem;

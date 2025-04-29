import { Save, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityType } from "@/db/schemas";

import {
  updateActivityType,
  deleteActivityType,
} from "../actions/crud-activity";

interface ActivityTypeListItemProps {
  activityType: ActivityType;
  index: number;
  isPending: boolean;
  startTransition: (fn: () => Promise<void>) => void;
}

const ActivityTypeListItem = ({
  activityType,
  index,
  isPending,
  startTransition,
}: ActivityTypeListItemProps) => {
  const [name, setName] = useState(activityType.name);
  const [textCode, setTextCode] = useState(activityType.textCode);

  return (
    <li
      key={activityType.id}
      className="flex items-center justify-between gap-2 py-1"
    >
      <span className="text-sm font-medium w-6 text-center">{index + 1}.</span>
      <Input
        value={name}
        className="flex-1 min-w-0"
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        value={textCode}
        className="w-20"
        onChange={(e) => setTextCode(e.target.value)}
      />
      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const result = await updateActivityType({
              id: activityType.id,
              name,
              textCode,
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
        disabled={isPending}
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
  );
};

export default ActivityTypeListItem;

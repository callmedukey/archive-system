"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { updateContractDate } from "@/app/(after-auth)/actions/update-contract-date";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import ButtonWithLoading from "../button-with-loading";

interface UsersTableDateSelectorProps {
  from?: Date;
  to?: Date;
  userId: string;
}

export default function UsersTableDateSelector({
  from,
  to,
  userId,
}: UsersTableDateSelectorProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: from ?? undefined,
    to: to ?? undefined,
  });
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    if (!date || !date.from || !date.to) return;

    if (date.from > date.to) {
      toast.error("시작일이 종료일보다 더 이후일 수 없습니다.");
      return;
    }
    startTransition(async () => {
      const res = await updateContractDate(
        userId,
        date.from as Date,
        date.to as Date
      );
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleReset = () => {
    setDate({
      from: undefined,
      to: undefined,
    });
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "yyyy-MM-dd", { locale: ko })} -{" "}
                  {format(date.to, "yyyy-MM-dd", { locale: ko })}
                </>
              ) : (
                format(date.from, "yyyy-MM-dd", { locale: ko })
              )
            ) : (
              <span>날짜 선택</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            disabled={isPending}
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={ko}
            pagedNavigation
            showOutsideDays={false}
            className="rounded-md p-2"
            classNames={{
              months: "gap-8",
              month:
                "relative first-of-type:before:hidden before:absolute max-sm:before:inset-x-2 max-sm:before:h-px max-sm:before:-top-2 sm:before:inset-y-2 sm:before:w-px before:bg-border sm:before:-left-4",
            }}
          />
          <div className="flex justify-between p-2">
            <Button
              size={"sm"}
              type="button"
              onClick={handleReset}
              className="rounded-lg"
              variant={"outline"}
            >
              초기화
            </Button>
            <ButtonWithLoading
              isLoading={isPending}
              disabled={isPending}
              size={"sm"}
              type="button"
              onClick={handleApply}
              className="rounded-lg"
            >
              적용
            </ButtonWithLoading>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

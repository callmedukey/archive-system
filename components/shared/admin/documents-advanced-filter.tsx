"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Define types for your filter options if needed
// Example:
// type FilterOption = { label: string; value: string };

const DocumentsAdvancedFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // State for Dialog visibility
  const [isOpen, setIsOpen] = useState(false);

  // State for filters - Initialize with values from searchParams or defaults
  // Example for one filter, repeat for others
  const [dataType, setDataType] = useState(
    () => searchParams.get("dataType") || "all"
  );
  const [status, setStatus] = useState(
    () => searchParams.get("status") || "all"
  );
  const [step, setStep] = useState(() => searchParams.get("step") || "all");
  const [region, setRegion] = useState(
    () => searchParams.get("region") || "all"
  );
  const [island, setIsland] = useState(
    () => searchParams.get("island") || "all"
  );
  const [date, setDate] = useState<Date | undefined>(() => {
    const dateString = searchParams.get("date");
    return dateString ? new Date(dateString) : undefined;
  });

  // Effect to update state if searchParams change externally (e.g., browser back/forward)
  useEffect(() => {
    setDataType(searchParams.get("dataType") || "all");
    setStatus(searchParams.get("status") || "all");
    setStep(searchParams.get("step") || "all");
    setRegion(searchParams.get("region") || "all");
    setIsland(searchParams.get("island") || "all");
    const dateString = searchParams.get("date");
    setDate(dateString ? new Date(dateString) : undefined);
  }, [searchParams]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Update params based on state
    // Reset page to 1 when applying filters
    params.set("page", "1");

    if (dataType && dataType !== "all") {
      params.set("dataType", dataType);
    } else {
      params.delete("dataType");
    }

    if (status && status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    if (step && step !== "all") {
      params.set("step", step);
    } else {
      params.delete("step");
    }

    if (region && region !== "all") {
      params.set("region", region);
    } else {
      params.delete("region");
    }

    if (island && island !== "all") {
      params.set("island", island);
    } else {
      params.delete("island");
    }

    if (date) {
      // Format date consistently, e.g., YYYY-MM-DD
      params.set("date", format(date, "yyyy-MM-dd"));
    } else {
      params.delete("date");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
      setIsOpen(false); // Close dialog after applying
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-lg">
          <Filter className="w-4 h-4" /> 검색 필터
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>검색 필터</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="data-type" className="">
            자료 분류별 보기
          </Label>
          <Select value={dataType} onValueChange={setDataType}>
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {/* Add other options here */}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status" className="">
            상태별 보기
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {/* Add other options here */}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="step">단계별 보기</Label>
          <Select value={step} onValueChange={setStep}>
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {/* Add other options here */}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="region">권역 선택</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full rounded-lg">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {/* Add other options here */}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="island">섬별 보기</Label>
            <Select value={island} onValueChange={setIsland}>
              <SelectTrigger className="w-full rounded-lg">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {/* Add other options here */}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="">
          <Label htmlFor="date-range">기간별 보기</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-range"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>기간 선택</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleApplyFilters}
            disabled={isPending}
            className="rounded-lg"
          >
            {isPending ? "적용 중..." : "적용"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentsAdvancedFilter;

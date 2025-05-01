"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { DateRange } from "react-day-picker";

import { getIslandsByRegion } from "@/app/(after-auth)/super-admin/actions/dashboard-filters";
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
import { regions, Role } from "@/db/schemas";
import { Island } from "@/db/schemas"; // Corrected import path
import { documentFormats, DocumentStatus } from "@/db/schemas/documents"; // Import the enum
import { cn } from "@/lib/utils";

// Define types for your filter options if needed
// Example:
// type FilterOption = { label: string; value: string };

// Helper function to get Korean labels (you might want to move this to a utils file)
function getStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case DocumentStatus.SUBMITTED:
      return "제출됨";
    case DocumentStatus.EDIT_REQUESTED:
      return "수정 요청됨";
    case DocumentStatus.EDIT_COMPLETED:
      return "수정 완료됨";
    case DocumentStatus.UNDER_REVIEW:
      return "검토 중";
    case DocumentStatus.APPROVED:
      return "승인됨";
    default:
      // Ensure exhaustive check or handle unexpected values
      const exhaustiveCheck: never = status;
      return exhaustiveCheck;
  }
}

interface DocumentsAdvancedFilterProps {
  initialDocumentFormats: (typeof documentFormats.$inferSelect)[];
  initialRegions: (typeof regions.$inferSelect)[];
  role: Role;
}

const DocumentsAdvancedFilter = ({
  initialDocumentFormats,
  initialRegions,
  role,
}: DocumentsAdvancedFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isFetchingIslands, startFetchingIslandsTransition] = useTransition();

  // State for Dialog visibility
  const [isOpen, setIsOpen] = useState(false);

  // State for filters - Initialize with values from searchParams or defaults
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
  const [date, setDate] = useState<DateRange | undefined>({
    from: searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom") as string)
      : undefined,
    to: searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo") as string)
      : undefined,
  });

  // State for fetched islands
  const [fetchedIslands, setFetchedIslands] = useState<Island[]>([]);

  // Effect to update state if searchParams change externally
  useEffect(() => {
    setDataType(searchParams.get("dataType") || "all");
    setStatus(searchParams.get("status") || "all");
    setStep(searchParams.get("step") || "all");
    const currentRegion = searchParams.get("region") || "all";
    setRegion(currentRegion);
    setIsland(searchParams.get("island") || "all");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    setDate({
      from: dateFrom ? new Date(dateFrom) : undefined,
      to: dateTo ? new Date(dateTo) : undefined,
    });

    // Also fetch islands if a region is present in the initial search params
    if (currentRegion && currentRegion !== "all") {
      startFetchingIslandsTransition(async () => {
        const islands = await getIslandsByRegion(null, currentRegion); // Assuming Role is not needed here or default is fine
        setFetchedIslands(islands);
      });
    } else {
      setFetchedIslands([]); // Clear islands if no region or 'all'
    }
  }, [searchParams]);

  // Effect to fetch islands when region changes
  useEffect(() => {
    if (region && region !== "all") {
      setFetchedIslands([]); // Clear previous islands immediately
      setIsland("all"); // Reset island selection
      startFetchingIslandsTransition(async () => {
        try {
          // Fetch islands based on the selected region
          // Pass null for the first arg if it's unused client-side, or adjust server action
          const islands = await getIslandsByRegion(null, region); // Adjust Role if needed
          setFetchedIslands(islands);
          // Optional: check if the current island selection is still valid
          if (!islands.some((isl) => isl.id === island)) {
            setIsland("all");
          }
        } catch (error) {
          console.error("Failed to fetch islands:", error);
          setFetchedIslands([]); // Clear on error
          setIsland("all");
        }
      });
    } else {
      setFetchedIslands([]);
      setIsland("all"); // Reset island if region is 'all'
    }
    // Intentionally not including 'island' in dependencies to avoid loops on reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

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
      params.set("dateFrom", date.from ? format(date.from, "yyyy-MM-dd") : "");
      params.set("dateTo", date.to ? format(date.to, "yyyy-MM-dd") : "");
    } else {
      params.delete("dateFrom");
      params.delete("dateTo");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
      setIsOpen(false); // Close dialog after applying
    });
  };

  const handleReset = () => {
    setDate({
      from: undefined,
      to: undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-lg">
          <Filter className="w-4 h-4" /> 검색 필터
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => {
          // Prevent closing the dialog when interacting with the popover content
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>검색 필터</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="data-type" className="">
            자료 분류별 보기
          </Label>
          <Select value={dataType} onValueChange={setDataType} name="data-type">
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto rounded-lg">
              <SelectItem value="all">전체</SelectItem>
              {initialDocumentFormats.map((format) => (
                <SelectItem key={format.id} value={format.id}>
                  {format.name}
                </SelectItem>
              ))}
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
            <SelectContent className="max-h-[300px] overflow-y-auto rounded-lg">
              <SelectItem value="all">전체</SelectItem>
              {Object.values(DocumentStatus).map((statusValue) => (
                <SelectItem key={statusValue} value={statusValue}>
                  {getStatusLabel(statusValue)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {role !== Role.USER && (
          <div>
            <Label htmlFor="step">단계별 보기</Label>
            <Select value={step} onValueChange={setStep}>
              <SelectTrigger className="w-full rounded-lg">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto rounded-lg">
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="1">1단계</SelectItem>
                <SelectItem value="2">2단계</SelectItem>
                <SelectItem value="3">3단계</SelectItem>
                <SelectItem value="4">4단계</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {role === Role.SUPERADMIN && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="region">권역 선택</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {initialRegions.map((reg) => (
                    <SelectItem key={reg.id} value={reg.id}>
                      {reg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="island">섬별 보기</Label>
              <Select
                value={island}
                onValueChange={setIsland}
                disabled={region === "all" || isFetchingIslands}
              >
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue
                    placeholder={isFetchingIslands ? "불러오는 중..." : "전체"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {fetchedIslands.map((isl) => (
                    <SelectItem key={isl.id} value={isl.id}>
                      {isl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="date-range">기간별 보기</Label>
          <Popover modal={true}>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
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
            <PopoverContent
              className="w-auto p-0"
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
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
              </div>
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

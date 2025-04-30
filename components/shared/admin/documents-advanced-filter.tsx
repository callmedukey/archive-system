"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

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
import { regions } from "@/db/schemas";
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
}

const DocumentsAdvancedFilter = ({
  initialDocumentFormats,
  initialRegions,
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
  const [date, setDate] = useState<Date | undefined>(() => {
    const dateString = searchParams.get("date");
    return dateString ? new Date(dateString) : undefined;
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
    const dateString = searchParams.get("date");
    setDate(dateString ? new Date(dateString) : undefined);

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

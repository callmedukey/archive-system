"use client";
import { Plus } from "lucide-react";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";

import ButtonWithLoading from "@/components/shared/button-with-loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { addRegion } from "../action/add-region";

const RegionCreateDialog = () => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");

  const handleAddRegion = () => {
    startTransition(async () => {
      const response = await addRegion(name);
      if (response.success) {
        setName("");
        toast.success(response.message);
        setOpen(false);
      } else {
        toast.error(response.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ButtonWithLoading
          isLoading={isPending}
          icon={<Plus />}
          disabled={isPending}
          onClick={() => {
            startTransition(() => {});
          }}
        >
          권역 추가
        </ButtonWithLoading>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>권역 추가</DialogTitle>
          <DialogDescription>
            권역을 추가하려면 권역 이름을 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="name">권역 이름</Label>
          <Input
            id="name"
            className="mt-2 rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <ButtonWithLoading
            isLoading={isPending}
            onClick={handleAddRegion}
            className="rounded-lg"
          >
            추가하기
          </ButtonWithLoading>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegionCreateDialog;

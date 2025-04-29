"use client";

import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";

import ButtonWithLoading from "@/components/shared/button-with-loading";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createDocumentFormat,
  updateDocumentFormat,
} from "../actions/crud-document-format";

interface NewDocumentFormatPageProps {
  content?: string;
  name?: string;
  applyActivity?: boolean;
  isUpdate?: boolean;
  id?: string;
}

const NewDocumentFormatPage = (props: NewDocumentFormatPageProps) => {
  const [content, setContent] = useState(props.content || "");
  const [name, setName] = useState(props.name || "");
  const [isPending, startTransition] = useTransition();
  const [applyActivity, setApplyActivity] = useState(
    props.applyActivity || false
  );
  const router = useRouter();
  return (
    <div>
      <h1>{props.isUpdate ? "양식 수정" : "양식 생성"}</h1>
      <section className="mt-6">
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();

            if (!name || !content) {
              toast.error("양식 이름과 내용을 입력해주세요.");
              return;
            }

            startTransition(async () => {
              if (props.isUpdate && props.id) {
                const result = await updateDocumentFormat({
                  id: props.id,
                  name,
                  content,
                  applyActivity,
                });
                if (result.success) {
                  toast.success("양식이 수정되었습니다.");
                  router.push(`/super-admin/manage-documents`);
                } else {
                  toast.error(result.message);
                }
              } else {
                const result = await createDocumentFormat({
                  name,
                  content,
                  applyActivity,
                });
                if (result.success) {
                  toast.success("양식이 생성되었습니다.");
                  router.push(`/super-admin/manage-documents`);
                } else {
                  toast.error(result.message);
                }
              }
            });
          }}
        >
          <Input
            type="text"
            placeholder="양식 이름"
            className="rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
          <Label className="flex items-center gap-2 text-base">
            <Checkbox
              disabled={isPending}
              className="size-5"
              checked={applyActivity}
              onCheckedChange={(checked) => {
                if (!checked) {
                  setApplyActivity(false);
                } else {
                  setApplyActivity(true);
                }
              }}
            />
            활동 부분 추가
          </Label>
          <SimpleEditor
            content={content}
            setContent={setContent}
            applyA4
            disabled={!isPending}
          />
          <div className="flex justify-center items-center gap-6 mb-6">
            <ButtonWithLoading
              className="rounded-lg"
              disabled={isPending}
              isLoading={isPending}
            >
              저장
            </ButtonWithLoading>
          </div>
        </form>
      </section>
    </div>
  );
};

export default NewDocumentFormatPage;

"use client";

import { format as formatDate } from "date-fns";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { deleteFiles } from "@/app/(after-auth)/super-admin/actions/delete-files";
import ButtonWithLoading from "@/components/shared/button-with-loading";
import DownloadButton from "@/components/shared/download-button";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DocumentFormat } from "@/db/schemas";
import { getFileKeyFromUrl } from "@/lib/image-url";
import { UploadButton } from "@/lib/utils/uploadthing";

import { createNewVersionDocument } from "../../../[documentId]/new-version/actions/create-new-version";

interface NewDocumentFormProps {
  format: DocumentFormat;
  regionName: string;
  username: string;
  level: string;
  reportDate: string;
  contractPeriodStart: string;
  contractPeriodEnd: string;
  company: string;
  userId: string;
  existingContent?: string;
  existingImages?: { url: string; key: string }[];
  existingFiles?: { name: string; url: string; key: string }[];
  reporter?: string;
  version?: string;
  documentName?: string;
  reportMonth?: string;
  previousFormatId?: string;
}

const NewDocumentForm = ({
  format,
  regionName,
  username,
  level,
  reportDate,
  contractPeriodStart,
  contractPeriodEnd,
  company,
  userId,
  existingContent,
  existingImages,
  existingFiles,
  reporter,
  version,
  documentName,
  reportMonth,
  previousFormatId,
}: NewDocumentFormProps) => {
  const [isPending, startTransition] = useTransition();
  const { formatId } = useParams();
  const form = useForm({
    defaultValues: {
      islandName: username,
      level: level + "단계",
      contractPeriodStart,
      contractPeriodEnd,
      company,
      regionName,
      reportDate: formatDate(reportDate, "yyyy-MM-dd"),
      reporter: reporter || "",
      reportingCompany: company,
    },
  });
  const router = useRouter();

  const [content, setContent] = useState(
    existingContent || format.content || ""
  );
  const [imageUrls, setImageUrls] = useState<{ url: string; key: string }[]>(
    existingImages || []
  );
  const [fileUrls, setFileUrls] = useState<
    { name: string; url: string; key: string }[]
  >(existingFiles || []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleManualSubmit = () => {
    const data = form.getValues();

    if (!previousFormatId && !formatId) {
      toast.error("보고서 양식을 불러올수 없습니다");
      return;
    }

    if (content.length === 0) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    if (data.reporter.length === 0) {
      toast.error("보고자를 입력해주세요.");
      return;
    }

    if (data.company.length === 0) {
      toast.error("보고기관을 입력해주세요.");
      return;
    }

    if (data.islandName.length === 0) {
      toast.error("대상 섬을 입력해주세요.");
      return;
    }

    if (data.regionName.length === 0) {
      toast.error("권역명을 입력해주세요.");
      return;
    }

    if (data.level.length === 0) {
      toast.error("사업 단계를 입력해주세요.");
      return;
    }

    if (data.reportDate.length === 0) {
      toast.error("보고일자를 입력해주세요.");
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  const confirmSubmit = () => {
    const data = form.getValues();
    startTransition(async () => {
      const { success, message, documentId } = await createNewVersionDocument({
        userId,
        formatId: previousFormatId || (formatId as string),
        name: format.name,
        newFiles: fileUrls.map((file) => ({ url: file.url, key: file.key })),
        newImages: imageUrls.map((image) => ({
          url: image.url,
          key: image.key,
        })),
        level: parseInt(data.level.replace("단계", "")),
        reportDate: new Date(data.reportDate),
        contractPeriodStart: new Date(data.contractPeriodStart),
        contractPeriodEnd: new Date(data.contractPeriodEnd),
        reportingCompany: data.company,
        reporter: data.reporter,
        islandName: data.islandName,
        regionName: data.regionName,
        content: content,
        previousDocumentName: documentName || "",
      });

      setIsConfirmDialogOpen(false);
      if (success) {
        router.push(`/user/documents/${documentId}`);
      } else {
        toast.error(message);
      }
    });
  };

  const handleDelete = async (urlToDelete: string, type: "image" | "file") => {
    const key = getFileKeyFromUrl(urlToDelete);
    if (!key) {
      toast.error("유효하지 않은 파일 키입니다.");
      return;
    }

    const deletePromise = deleteFiles([key], type).then((success) => {
      if (success) {
        if (type === "image") {
          setImageUrls((prev) => prev.filter((img) => img.key !== key));
        } else if (type === "file") {
          setFileUrls((prev) => prev.filter((file) => file.key !== key));
        }
      } else {
        throw new Error("삭제에 실패했습니다.");
      }
    });

    toast.promise(deletePromise, {
      loading: "삭제중입니다...",
      success: "삭제 완료되었습니다",
      error: (err) => err.message,
    });
  };

  const contractPeriod = `${formatDate(
    contractPeriodStart,
    "yyyy-MM-dd"
  )} ~ ${formatDate(contractPeriodEnd, "yyyy-MM-dd")}`;

  return (
    <Form {...form}>
      <form className="max-w-[793px] mx-auto bg-white p-2 mt-6 shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6 pb-2 border-b-2 border-gray-300">
          {format.name === "월간보고서" &&
            version &&
            `${reportMonth}월 ${format.name} ${version}`}
        </h1>

        <div className="grid grid-cols-[auto_2fr_auto_3fr_auto_1fr_auto_2fr] border-collapse border border-gray-400 mb-6 text-sm">
          <FormLabel className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
            권역명
          </FormLabel>
          <FormField
            control={form.control}
            name="regionName"
            render={({ field }) => (
              <FormItem className="border border-gray-400 m-0 p-0 flex items-center">
                <FormControl>
                  <Input
                    {...field}
                    className="border-none rounded-none p-2 h-full focus-visible:ring-0 focus-visible:ring-offset-0 disabled:text-black"
                    disabled
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormLabel className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
            대상 섬
          </FormLabel>
          <FormField
            control={form.control}
            name="islandName"
            render={({ field }) => (
              <FormItem className="border border-gray-400 m-0 p-0 flex items-center">
                <FormControl>
                  <Input
                    {...field}
                    className="border-none rounded-none p-2 h-full focus-visible:ring-0 focus-visible:ring-offset-0 disabled:text-black"
                    disabled
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormLabel className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
            단계
          </FormLabel>
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem className="border border-gray-400 m-0 p-0 flex items-center">
                <FormControl>
                  <Input
                    {...field}
                    className="border-none rounded-none p-2 h-full focus-visible:ring-0 focus-visible:ring-offset-0"
                    disabled
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormLabel className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
            보고일자
          </FormLabel>
          <FormField
            control={form.control}
            name="reportDate"
            render={({ field }) => (
              <FormItem className="border border-gray-400 m-0 p-0 flex items-center">
                <FormControl>
                  <Input
                    {...field}
                    className="border-none rounded-none p-2 h-full focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormLabel className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
            계약기간
          </FormLabel>
          <div className="p-2 border border-gray-400 flex items-center whitespace-nowrap opacity-50">
            {contractPeriod}
          </div>

          <FormLabel className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
            보고기관
          </FormLabel>
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem className="border border-gray-400 col-span-3 m-0 p-0 flex items-center">
                <FormControl>
                  <Input
                    {...field}
                    className="border-none rounded-none p-2 h-full focus-visible:ring-0 focus-visible:ring-offset-0 disabled:text-black"
                    disabled
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormLabel className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
            보고자
          </FormLabel>
          <FormField
            control={form.control}
            name="reporter"
            render={({ field }) => (
              <FormItem className="border border-gray-400 m-0 p-0 flex items-center">
                <FormControl>
                  <Input
                    {...field}
                    className="border-none rounded-none p-2 h-full focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <SimpleEditor
          content={content}
          setContent={setContent}
          applyA4={true}
        />

        {/* Image Display Area */}
        {imageUrls.length > 0 && (
          <ScrollArea className="h-fit mt-6 whitespace-nowrap rounded-md border shadow-md p-4">
            <h2 className="text-lg font-medium">업로드된 이미지</h2>
            <div className="flex gap-4 mt-4">
              {imageUrls.map(({ url, key }) => (
                <div
                  key={key}
                  className="border-2 p-2 rounded-lg shrink-0 flex flex-col items-center gap-2 overflow-clip"
                >
                  <Image
                    src={url}
                    alt="uploaded image"
                    width={200}
                    height={200}
                    unoptimized
                    className="object-contain"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(key, "image")}
                    className="text-xs font-medium w-full"
                    disabled={isPending}
                  >
                    삭제
                  </Button>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        {/* File Display Area */}
        {fileUrls.length > 0 && (
          <ScrollArea className="h-fit mt-6 whitespace-nowrap rounded-md border shadow-md p-4">
            <h2 className="text-lg font-medium">업로드된 파일</h2>
            <div className="flex gap-4 mt-4">
              {fileUrls.map(({ name, url, key }) => (
                <div
                  key={key}
                  className="border-2 p-2 rounded-lg shrink-0 flex items-center gap-2 overflow-clip"
                >
                  <DownloadButton url={url} filename={name} className="w-fit" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(key, "file")}
                    className="text-xs font-medium"
                    disabled={isPending}
                  >
                    삭제
                  </Button>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        {/* Upload Buttons */}
        <div className="flex gap-4 mt-6 justify-center">
          <UploadButton
            className="ut-button:bg-gray-500 ut-button:text-white ut-button:font-medium"
            disabled={isPending || uploadingImage || uploadingFile}
            content={{
              button: uploadingImage ? "업로드중..." : "이미지 업로드",
              allowedContent: "5장까지 업로드 가능합니다. 최대 16MB",
            }}
            endpoint="imageUploader"
            onUploadAborted={() => setUploadingImage(false)}
            onClientUploadComplete={(res) => {
              setImageUrls((prev) => [
                ...prev,
                ...res.map((r) => ({ url: r.ufsUrl, key: r.key })),
              ]);
              setUploadingImage(false);
              toast.success("이미지 업로드 완료");
            }}
            onUploadError={(error: Error) => {
              setUploadingImage(false);
              toast.error(`이미지 업로드 실패: ${error.message}`);
            }}
            onBeforeUploadBegin={(files) => {
              if (imageUrls.length + files.length > 5) {
                toast.error("이미지는 최대 5개까지 업로드할 수 있습니다.");
                return [];
              }
              setUploadingImage(true);
              toast.info(
                <div className="flex items-center gap-2">
                  <Upload className="size-4" />
                  <p>이미지 업로드중입니다...</p>
                </div>
              );
              return files;
            }}
          />
          <UploadButton
            endpoint="fileUploader"
            className="ut-button:bg-gray-500 ut-button:text-white ut-button:font-medium"
            disabled={isPending || uploadingImage || uploadingFile}
            content={{
              button: uploadingFile ? "업로드중..." : "파일 업로드",
              allowedContent: "파일 5개까지 업로드 가능합니다. 최대 256MB",
            }}
            onUploadAborted={() => setUploadingFile(false)}
            onBeforeUploadBegin={(files) => {
              if (fileUrls.length + files.length > 5) {
                toast.error("파일은 최대 5개까지 업로드할 수 있습니다.");
                return [];
              }
              setUploadingFile(true);
              toast.info(
                <div className="flex items-center gap-2">
                  <Upload className="size-4" />
                  <p>파일 업로드중입니다...</p>
                </div>
              );
              return files;
            }}
            onClientUploadComplete={(res) => {
              setFileUrls((prev) => [
                ...prev,
                ...res.map((r) => ({
                  name: r.name,
                  url: r.ufsUrl,
                  key: r.key,
                })),
              ]);
              setUploadingFile(false);
              toast.success("파일 업로드 완료");
            }}
            onUploadError={(error: Error) => {
              setUploadingFile(false);
              toast.error(`파일 업로드 실패: ${error.message}`);
            }}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <ButtonWithLoading
            type="button"
            onClick={handleManualSubmit}
            isLoading={isPending}
            disabled={isPending || uploadingImage || uploadingFile}
          >
            제출
          </ButtonWithLoading>
        </div>
      </form>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>서류 제출 확인</DialogTitle>
            <DialogDescription>
              서류 제출을 진행하시겠습니까? 제출 후에는 관리자의 보완 요청
              시까지 수정이 불가능합니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isPending}
            >
              나가기
            </Button>
            <ButtonWithLoading
              onClick={confirmSubmit}
              isLoading={isPending}
              disabled={isPending || uploadingImage || uploadingFile}
            >
              확인
            </ButtonWithLoading>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
};

export default NewDocumentForm;

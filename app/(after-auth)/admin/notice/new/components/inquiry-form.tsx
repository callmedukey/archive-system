"use client";

import { Upload } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteFiles } from "@/app/(after-auth)/super-admin/actions/delete-files";
import {
  createInquiry,
  editInquiry,
} from "@/app/(after-auth)/user/inquiries/action/create-inquiry";
import ButtonWithLoading from "@/components/shared/button-with-loading";
import DownloadButton from "@/components/shared/download-button";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { NewInquiry } from "@/db/schemas";
import { getFileKeyFromUrl } from "@/lib/image-url";
import { UploadButton } from "@/lib/utils/uploadthing";
import { ActionResponse } from "@/types/action";

interface InquiryFormProps {
  onSuccessRedirectUrl: string;
  title?: string;
  content?: string;
  imageUrls?: { url: string; key: string }[];
  fileUrls?: { name: string; url: string; key: string }[];
  variant: "create" | "edit";
  id?: number;
}

const InquiryForm = ({ onSuccessRedirectUrl, ...props }: InquiryFormProps) => {
  const router = useRouter();
  const [title, setTitle] = useState(props.title || "");
  const [content, setContent] = useState(props.content || "");
  const [imageUrls, setImageUrls] = useState<{ url: string; key: string }[]>(
    props.imageUrls || []
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [fileUrls, setFileUrls] = useState<
    { name: string; url: string; key: string }[]
  >(props.fileUrls || []);

  const handleDelete = async (urlToDelete: string, type: "image" | "file") => {
    const key = getFileKeyFromUrl(urlToDelete);

    const result = deleteFiles([key], type).then((result) => {
      if (result) {
        if (type === "image") {
          setImageUrls(imageUrls.filter((url) => url.key !== key));
        } else if (type === "file") {
          setFileUrls(fileUrls.filter((file) => file.key !== key));
        }
      }
    });
    toast.promise(result, {
      loading: "삭제중입니다...",
      success: "삭제 완료되었습니다",
      error: "삭제에 실패했습니다.",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let result: ActionResponse<NewInquiry>;
    startTransition(async () => {
      if (props.variant === "create") {
        result = await createInquiry({
          title,
          content,
          images: imageUrls,
          files: fileUrls,
        });
      } else if (props.variant === "edit") {
        if (!props.id) {
          toast.error("공지 아이디가 없습니다.");
          return;
        }
        result = await editInquiry({
          id: props.id,
          title,
          content,
          images: imageUrls,
          files: fileUrls,
        });
      }
      if (result.success) {
        toast.success(result.message);
        router.push(onSuccessRedirectUrl);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 max-w-[calc(100vw-16rem)] mx-auto pb-6"
      onSubmit={handleSubmit}
    >
      <Input
        placeholder="제목을 입력해주세요."
        className="w-full shadow-md !py-6"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isPending}
      />
      <SimpleEditor
        content={content}
        setContent={setContent}
        disabled={isPending}
      />
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
                  alt="image"
                  width={200}
                  height={200}
                  unoptimized
                  className="object-contain"
                />
                <Button
                  type="button"
                  variant="outline"
                  typeof="w-full"
                  onClick={() => handleDelete(key, "image")}
                  className="text-xs font-medium"
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
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
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
      <div className="flex gap-4 mt-6 justify-center">
        <UploadButton
          className="ut-button:bg-gray-500 ut-button:text-white ut-button:font-medium"
          disabled={isPending}
          content={{
            button: "이미지 업로드",
            allowedContent: "5장까지 업로드 가능합니다. 최대 16MB",
          }}
          endpoint="imageUploader"
          onUploadAborted={() => setUploadingImage(false)}
          onClientUploadComplete={(res) => {
            setImageUrls([
              ...imageUrls,
              ...res.map((r) => ({ url: r.ufsUrl, key: r.key })),
            ]);
            setUploadingImage(false);
            toast.success("이미지 업로드 완료");
          }}
          onUploadError={(error: Error) => {
            setUploadingImage(false);
            toast.error(`ERROR! ${error.message}`);
          }}
          onBeforeUploadBegin={(files) => {
            setUploadingImage(true);
            if (imageUrls.length + files.length > 5) {
              toast.error("이미지 업로드 개수 제한 초과");
              return [];
            }
            toast(
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
          disabled={isPending}
          content={{
            button: "파일 업로드",
            allowedContent: "파일 5개까지 업로드 가능합니다. 최대 256MB",
          }}
          onUploadAborted={() => setUploadingFile(false)}
          onBeforeUploadBegin={(files) => {
            setUploadingFile(true);
            if (fileUrls.length + files.length > 5) {
              toast.error("파일 업로드 개수 제한 초과");
              return [];
            }
            toast(
              <div className="flex items-center gap-2">
                <Upload className="size-4" />
                <p>파일 업로드중입니다...</p>
              </div>
            );
            return files;
          }}
          onClientUploadComplete={(res) => {
            setFileUrls([
              ...fileUrls,
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
            toast.error(`ERROR! ${error.message}`);
          }}
        />
      </div>
      <div className="flex justify-center items-center">
        <ButtonWithLoading
          type="submit"
          className="mt-6 font-medium text-lg rounded-lg px-8"
          size="lg"
          isLoading={isPending}
          disabled={isPending || uploadingImage || uploadingFile}
        >
          공지 등록
        </ButtonWithLoading>
      </div>
    </motion.form>
  );
};

export default InquiryForm;

"use client";

import { Download, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DownloadButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  url: string;
  filename: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  className,
  url,
  filename,
  children,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    const loadingToastId = toast.loading("다운로드 준비 중...");

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`파일 다운로드 실패: ${response.statusText}`);
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(objectUrl);
      toast.success("다운로드 시작됨", { id: loadingToastId });
    } catch (error) {
      console.error("Download error:", error);
      toast.error(
        error instanceof Error ? error.message : "알 수 없는 오류 발생",
        { id: loadingToastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("h-10 px-4 py-2", className)}
      onClick={handleDownload}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : children ? (
        children
      ) : (
        <>
          <Download className="mr-2 size-4" />
          {filename}
        </>
      )}
    </Button>
  );
};

export default DownloadButton;

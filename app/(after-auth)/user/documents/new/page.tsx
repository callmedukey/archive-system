import Link from "next/link";
import React from "react";

import DocumentFormatWrapper from "@/components/shared/document-format-wrapper";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">양식 선택</h1>
        <DocumentFormatWrapper>
          {(documentFormats) => (
            <div className="space-y-4">
              {documentFormats.map((format) => (
                <div
                  key={format.id}
                  className="p-4 border rounded-lg shadow hover:shadow-md transition cursor-pointer"
                >
                  <Link href={`/user/documents/new/${format.id}`}>
                    <h2 className="text-lg font-semibold">{format.name}</h2>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </DocumentFormatWrapper>
      </div>
    </div>
  );
};

export default page;

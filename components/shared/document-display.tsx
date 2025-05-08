"use client";

import React from "react";

import { ActivityContent, ActivityType, DocumentFormat } from "@/db/schemas";

interface DocumentDisplayProps {
  format: DocumentFormat;
  existingContent?: string;
  reporter?: string;
  version?: string;
  documentName?: string;
  reportMonth?: string;
  activityTypes?: ActivityType[];
  activityContents?: ActivityContent[];
  existingActivityLocation?: string;
  existingInnerActivityParticipantsNumber?: number;
  existingOuterActivityParticipantsNumber?: number;
}

const DocumentDisplay = ({
  format,
  existingContent,
  reporter,
  version,
  documentName,
  reportMonth,
  existingActivityLocation,
  existingInnerActivityParticipantsNumber,
  existingOuterActivityParticipantsNumber,
}: DocumentDisplayProps) => {
  const contentToDisplay = existingContent || format.content || "";

  return (
    <div className="max-w-[793px] mx-auto bg-white p-2 mt-6 shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6 pb-2 border-b-2 border-gray-300">
        {format.name === "월간보고서" && version
          ? `${reportMonth}월 ${format.name} ${version}`
          : documentName || format.name}
      </h1>

      <div className="grid grid-cols-[auto_2fr_auto_3fr_auto_1fr_auto_2fr] border-collapse border border-gray-400 mb-2 text-sm">
        <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
          권역명
        </div>
        <div className="p-2 border border-gray-400 flex items-center"></div>
        <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
          대상 섬
        </div>
        <div className="p-2 border border-gray-400 flex items-center"></div>
        <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
          단계
        </div>
        <div className="p-2 border border-gray-400 flex items-center"></div>
        <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
          보고일자
        </div>
        <div className="p-2 border border-gray-400 flex items-center"></div>

        <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
          계약기간
        </div>
        <div className="p-2 border border-gray-400 flex items-center whitespace-nowrap"></div>
        <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
          보고기관
        </div>
        <div className="p-2 border border-gray-400 col-span-3 flex items-center"></div>
        <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
          보고자
        </div>
        <div className="p-2 border border-gray-400 flex items-center">
          {reporter || ""}
        </div>
      </div>

      {format.applyActivity && (
        <>
          <h2 className="text-xl font-semibold text-center pb-2 border-b border-gray-300">
            사업추진현황
          </h2>
          <div className="grid grid-cols-[auto_1fr_auto_1fr] border-collapse border border-gray-400 mb-6 text-sm">
            <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
              활동 분류
            </div>
            <div className="p-2 border border-gray-400 flex items-center"></div>
            <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
              활동 내용
            </div>
            <div className="p-2 border border-gray-400 flex items-center"></div>

            <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
              활동 기간
            </div>
            <div className="p-2 border border-gray-400 flex items-center"></div>
            <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
              활동 장소
            </div>
            <div className="p-2 border border-gray-400 flex items-center">
              {existingActivityLocation || null}
            </div>

            <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
              섬지역 참여인원
            </div>
            <div className="p-2 border border-gray-400 flex items-center">
              {existingInnerActivityParticipantsNumber ?? null}
            </div>
            <div className="font-semibold bg-gray-100 p-2 border border-gray-400 text-center flex items-center justify-center">
              외부 참여인원
            </div>
            <div className="p-2 border border-gray-400 flex items-center">
              {existingOuterActivityParticipantsNumber ?? null}
            </div>
          </div>
        </>
      )}

      <div
        className=""
        dangerouslySetInnerHTML={{ __html: contentToDisplay }}
      />
    </div>
  );
};

export default DocumentDisplay;

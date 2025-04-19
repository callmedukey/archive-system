import React from "react";

import InquiryForm from "@/app/(after-auth)/super-admin/notice/new/components/inquiry-form";

const page = () => {
  return (
    <div>
      <h1>문의하기</h1>
      <InquiryForm variant="create" onSuccessRedirectUrl="/user/inquiries" />
    </div>
  );
};

export default page;

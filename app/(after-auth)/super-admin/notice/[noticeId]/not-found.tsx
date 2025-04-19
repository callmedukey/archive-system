import * as motion from "motion/react-client";
import React from "react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        존재하지 않는 공지사항입니다.
      </motion.h1>
    </div>
  );
};

export default NotFound;

import React from "react";
const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      {/* Vòng xoay Spinner dùng Tailwind CSS */}
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600 font-medium">
        Đang kiểm tra quyền truy cập...
      </p>
    </div>
  );
};

export default LoadingSpinner;

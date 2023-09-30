"use client";

import { uploadToS3 } from "@/lib/s3";
import { Inbox } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";

const FileUpload = () => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("File is too large\nMax size is 10MB");
        return;
      }

      try {
        const data = await uploadToS3(file);
        console.log(data);

      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 border-gray-300 bg-gray-50 py-8 flex flex-col justify-center items center rounded-xl p-4 text-center cursor-pointer",
        })}
      >
        <input {...getInputProps()} />
        <>
          <Inbox className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-slate-400 font-semibold">
            Drag and drop a PDF here
          </p>
        </>
      </div>
    </div>
  );
};

export default FileUpload;

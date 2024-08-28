import React, { useState, useRef } from "react";
import axios from "axios";
import TypingAnimation from "../../components/Header/components/TypingAnimation.tsx";
import Layout from "../Layout/Layout.tsx";

const UploadFile: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const file = event.target.files[0];
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(
        `${baseUrl}/v1/api/uploadFile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `JWT ${localStorage.getItem("access")}`, // Assuming JWT is used for auth
          },
        }
      );
      console.log("File uploaded successfully", response.data);
    } catch (error) {
      console.error("Error uploading file", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-2xl rounded-lg border bg-white p-6 shadow-md">
          <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12">
            <div className="text-center">
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 15a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4v8z"
                />
              </svg>
              <p className="mt-1 text-sm text-gray-500">Import a PDF</p>
            </div>
            <div className="mt-4">
              <input
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={handleButtonClick}
                className="w-full cursor-pointer rounded-md bg-black px-4 py-2 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <TypingAnimation />
                    Loading...
                  </div>
                ) : (
                  "Upload File"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadFile;

import React, { useState } from "react";
import { Link } from "react-router-dom";

interface File {
  id: number;
  guid: string;
  file_name: string;
  date_of_upload: string;
  size: number;
  page_count: number;
  file_type: string;
  uploaded_by_email: string;
  source_url: string | null;
  analyzed: boolean | null;
  approved: boolean | null;
  uploaded_by: number;
}

interface FileRowProps {
  file: File;
  onUpdate: (guid: string, newFileName: string) => void;
  onDownload: (guid: string, fileName: string) => void;
  downloading: boolean;
}

const FileRow: React.FC<FileRowProps> = ({
  file,
  onUpdate,
  onDownload,
  downloading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fileName, setFileName] = useState(file.file_name);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      await fetch(`${baseUrl}/v1/api/editmetadata/${file.guid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({ file_name: fileName }),
      });
      onUpdate(file.guid, fileName);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating file name:", error);
      alert("Error updating file name");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFileName(file.file_name);
    setIsEditing(false);
  };

  return (
    <li className="border-b p-4">
      <div className="flex items-center justify-between">
        <div className="w-[800px]">
          {isEditing ? (
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="border p-1 w-full"
              disabled={loading}
            />
          ) : (
            <Link
              to={`/drugsummary?guid=${file.guid}`}
              className="text-blue-500 hover:underline"
            >
              <p>
                <strong>File Name:</strong> {file.file_name}
              </p>
            </Link>
          )}
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 disabled:bg-gray-400"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => onDownload(file.guid, file.file_name)}
                disabled={downloading}
                className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
              >
                {downloading ? "Downloading..." : "Download"}
              </button>
            </>
          )}
        </div>
      </div>
      <p>
        <strong>Date of Upload:</strong>{" "}
        {new Date(file.date_of_upload).toLocaleString()}
      </p>
      <p>
        <strong>Size:</strong> {file.size} bytes
      </p>
      <p>
        <strong>Page Count:</strong> {file.page_count}
      </p>
      <p>
        <strong>File Type:</strong> {file.file_type}
      </p>
      <p>
        <strong>Uploaded By:</strong> {file.uploaded_by_email}
      </p>
    </li>
  );
};

export default FileRow;

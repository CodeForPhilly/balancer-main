import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Layout from "../Layout/Layout";

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
      await axios.patch(
        `${baseUrl}/v1/api/editmetadata/${file.guid}`,
        { file_name: fileName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${localStorage.getItem("access")}`,
          },
        }
      );
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
        {/* File name container with fixed width */}
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

const ListOfFiles: React.FC<{ showTable?: boolean }> = ({
  showTable = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${baseUrl}/v1/api/uploadFile`, {
          headers: {
            Authorization: `JWT ${localStorage.getItem("access")}`,
          },
        });
        if (Array.isArray(response.data)) {
          setFiles(response.data);
        }
      } catch (error) {
        console.error("Error fetching files", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const updateFileName = (guid: string, newFileName: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.guid === guid ? { ...file, file_name: newFileName } : file
      )
    );
  };

  const handleDownload = async (guid: string, fileName: string) => {
    try {
      setDownloading(guid);
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${baseUrl}/v1/api/uploadFile/${guid}`, {
        headers: {
          Authorization: `JWT ${localStorage.getItem("access")}`,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download the file. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  // Use the showTable prop to conditionally render different layouts
  if (showTable) {
    return (
      <div className="container mx-auto md:w-[50%]">
        <h6 className="mb-4">File List (Table View)</h6>
        <ul>
          {files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              onUpdate={updateFileName}
              onDownload={handleDownload}
              downloading={downloading === file.guid}
            />
          ))}
        </ul>
      </div>
    );
  } else {
    return (
      <Layout>
        <div className="font_body mt-48 flex w-full flex-col items-center justify-center rounded-md border bg-white p-4 px-8 ring-1 hover:ring-slate-300 md:max-w-6xl">
          <div className="mt-8 text-sm text-gray-600">
            <ul>
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onUpdate={updateFileName}
                  onDownload={handleDownload}
                  downloading={downloading === file.guid}
                />
              ))}
            </ul>
          </div>
        </div>
      </Layout>
    );
  }
};

export default ListOfFiles;

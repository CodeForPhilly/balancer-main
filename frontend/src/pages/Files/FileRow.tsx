import React, { useState } from "react";
import { Link } from "react-router-dom";

interface File {
  id: number;
  guid: string;
  file_name: string;
  title: string | null;
  publication: string | null;
  publication_date: string | null;
  date_of_upload: string | null;
  size: number;
  page_count: number;
  file_type: string;
  uploaded_by_email: string;
  source_url: string | null;
  analyzed: boolean | null;
  approved: boolean | null;
  uploaded_by: string;
}

interface FileRowProps {
  file: File;
  onUpdate: (guid: string, updatedFile: Partial<File>) => void;
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
  const [title, setTitle] = useState(file.title ?? '');
  const [publication, setPublication] = useState(file.publication ?? '');
  const [publicationDate, setPublicationDate] = useState(file.publication_date ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
      await fetch(`${baseUrl}/v1/api/editmetadata/${file.guid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.getItem("access")}`,
        },

        body: JSON.stringify({
          file_name: fileName,
          title: title,
          publication: publication,
          publication_date:  publicationDate && publicationDate !== ''
              ? publicationDate.replace(/\//g, '-')
              : null,
        }),
      });

      onUpdate(file.guid, {
        file_name: fileName,
        title: title,
        publication: publication,
        publication_date: publicationDate,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating file:", error);
      alert("Error updating file metadata");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFileName(file.file_name);
    setTitle(file.title ?? '');
    setPublication(file.publication ?? '');
    setPublicationDate(file.publication_date ?? '');
    setIsEditing(false);
  };

  const formatUTCDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric"
    });
    const formattedDate = formatter.format(new Date(dateStr));
    return formattedDate;
  }

  return (
    <li className="border-b p-4">
      {isEditing ? (
        <div className="flex space-x-2 justify-end">
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
        </div>
      ) : (
        <div className="flex space-x-2 justify-end">
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
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="md:w-[800px] w-full">
          <strong>File Name:</strong>{" "}
          {isEditing ? (
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="border p-1 w-full"
              disabled={loading}
              placeholder="File Name"
            />
          ) : (
            <Link
              to={`/drugsummary?guid=${file.guid}`}
              className="text-blue-500 hover:underline"
            >
              {fileName}
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="w-full">
          <p>
            <strong>Title:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                value={title || ''}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-1 w-full"
                disabled={loading}
                placeholder="Title"
              />
            ) : (
              file.title || 'N/A' // Fallback for null title
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="w-full">
          <p>
            <strong>Publication:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                value={publication || ''}
                onChange={(e) => setPublication(e.target.value)}
                className="border p-1 w-full"
                disabled={loading}
                placeholder="Publication"
              />
            ) : (
              file.publication || 'N/A' // Fallback for null publication
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="w-full">
          <p>
            <strong>Publication Date:</strong>{" "}
            {isEditing ?
              <input
                type="date"
                value={publicationDate || ''}
                onChange={(e) => setPublicationDate(e.target.value)}
                className="border p-1 w-full"
                disabled={loading}
                placeholder="Publication Date"
              />
            : formatUTCDate(file.publication_date)}
          </p>
        </div>
      </div>

      <p>
        <strong>Date of Upload:</strong>{" "}
        {file.date_of_upload
          ? new Intl.DateTimeFormat("en-US", {
            dateStyle: "short",
            timeStyle: "medium"
          }).format(new Date(file.date_of_upload))
          : "N/A"}
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

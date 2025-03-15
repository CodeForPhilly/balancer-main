import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import { Link } from "react-router-dom";
import Table from "../../components/Table/Table.tsx";

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

function ListOfFiles({ showTable = false }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${baseUrl}/v1/api/uploadFile`, {
          headers: {
            Authorization: `JWT ${localStorage.getItem("access")}`, // Assuming JWT is used for auth
          },
        });
        console.log("Response data:", response.data);
        if (Array.isArray(response.data)) {
          setFiles(response.data);
        } else {
          //   setError("Unexpected response format");
        }
      } catch (error) {
        console.error("Error fetching files", error);
        // setError("Error fetching files");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleDownload = async (guid: string, fileName: string) => {
    try {
      setDownloading(guid);
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${baseUrl}/v1/api/uploadFile/${guid}`, {
        headers: {
          Authorization: `JWT ${localStorage.getItem("access")}`,
        },
        responseType: "blob", // Important for handling binary data
      });

      // Create a blob URL and trigger download
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (showTable) {
    const columns = [
      { Header: "Date of Upload", accessor: "date_of_upload" },
      { Header: "File Name", accessor: "file_name" },
      { Header: "", accessor: "file_open" },
      { Header: "", accessor: "file_download" },
    ];

    const data = files.map((file) => ({
      date_of_upload: new Date(file.date_of_upload)
        .toLocaleString("en-US")
        .split(",")[0],
      file_name: file.file_name.replace(/\.[^/.]+$/, ""),
      page_count: file.page_count,
      file_open: (
        <Link
          to={`/drugsummary?guid=${file.guid}`}
          className="text-blue-500 hover:underline"
        >
          <b>View</b>
        </Link>
      ),
      file_download: (
        <button
          onClick={() => handleDownload(file.guid, file.file_name)}
          disabled={downloading === file.guid}
          className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 disabled:bg-gray-400"
        >
          {downloading === file.guid ? "..." : "Download"}
        </button>
      ),
    }));

    console.log(columns, data);

    return (
      <div className="container mx-auto md:w-[50%]">
        <h6 className="mb-4"></h6>
        <Table columns={columns} data={data} />
      </div>
    );
  }

  return (
    <Layout>
      <div className="font_body mt-48 flex w-full flex-col items-center justify-center rounded-md border bg-white p-4 px-8 ring-1 hover:ring-slate-300 md:max-w-6xl">
        <div className="mt-8 text-sm text-gray-600">
          <ul>
            {files.map((file) => (
              <li key={file.id} className="border-b p-4">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/drugsummary?guid=${file.guid}`}
                    className="text-blue-500 hover:underline"
                  >
                    <p>
                      <strong>File Name:</strong> {file.file_name}
                    </p>
                  </Link>
                  <button
                    onClick={() => handleDownload(file.guid, file.file_name)}
                    disabled={downloading === file.guid}
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {downloading === file.guid
                      ? "Downloading..."
                      : "Download PDF"}
                  </button>
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
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}

export default ListOfFiles;

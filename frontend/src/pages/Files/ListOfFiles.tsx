import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import FileRow from "./FileRow";
import Table from "../../components/Table/Table";

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

const ListOfFiles: React.FC<{ showTable?: boolean }> = ({
  showTable = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

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

  const updateFileName = (guid: string, updatedFile: Partial<File>) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.guid === guid ? { ...file, ...updatedFile } : file
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

  const handleOpen = async (guid: string) => {
    try {
      setOpening(guid);
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${baseUrl}/v1/api/uploadFile/${guid}`, {
        headers: {
          Authorization: `JWT ${localStorage.getItem("access")}`,
        },
        responseType: "arraybuffer",
      });

      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
      console.error("Error opening file:", error);
      alert("Failed to open the file. Please try again.");
    } finally {
      setOpening(null);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  if (showTable) {
    const columns = [
      { Header: 'Name', accessor: 'file_name' },
      { Header: 'Publication', accessor: 'publication' },
      { Header: 'Date Published', accessor: 'publication_date' },
      { Header: '', accessor: 'file_open' },
    ];
    const data = files.map((file) => (
      {
        file_name: file?.title || file.file_name.replace(/\.[^/.]+$/, ""),
        publication: file?.publication || '',
        publication_date: file.publication_date
          ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          }).format(new Date(file.publication_date))
          : "",
        file_open:
        <a
          key={file.guid}
          href="#"
          onClick={(e) => {
            if (opening) e.preventDefault(); // Prevent action if opening is in progress
            else handleOpen(file.guid);
          }}
          className={`text-blue-500 font-bold hover:underline ${opening ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          View
        </a>
      }
    ));
    return (
      <div className="mx-auto md:w-[50%]">
        <h6 className="mb-4"></h6>
        <Table columns={columns} data={data} />
      </div>
    );
  } else {
    return (
      <Layout>
        <div className="font_body mt-48 flex flex-col items-center justify-center rounded-md border bg-white p-4 px-8 ring-1 hover:ring-slate-300 md:max-w-6xl">
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

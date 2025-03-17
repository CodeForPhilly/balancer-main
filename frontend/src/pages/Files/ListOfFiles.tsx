import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import FileRow from "./FileRow";
import Table from "../../components/Table/Table";
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

  // Update the file name and use Partial<File> to match the onUpdate signature
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

  if (isLoading) return <div>Loading...</div>;

  // Use the showTable prop to conditionally render different layouts if desired
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
        publication_date: file?.publication_date || '',
        file_open:
          <Link
            to={`/drugsummary?guid=${file.guid}`}
            className="text-blue-500 hover:underline"
          >
            <b>View</b>
          </Link>
      }
    ));
    return (
      <div className ="container mx-auto md:w-[50%]">
        <h6 className="mb-4"></h6>
        <Table columns={columns} data={data} />
      </div>
    )
  }
  else {
    return (
      <Layout>
        <div className="font_body mt-48 flex flex-col items-center justify-center rounded-md border bg-white p-4 px-8 ring-1 hover:ring-slate-300 md:max-w-6xl">
          <div className="mt-8 text-sm text-gray-600">
            <ul>
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onUpdate={updateFileName} // This will now work correctly
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

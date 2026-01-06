import React, {useState, useEffect} from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import {ChevronLeft, ChevronRight, File, Loader2} from "lucide-react";
import axios from "axios";

interface File {
    id: number;
    guid: string;
    file_name: string;
    title: string | null;
}

const Sidebar: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get(`/api/v1/api/uploadFile`);
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

    const handleFileClick = (guid: string) => {
        const params = new URLSearchParams(location.search);
        const currentGuid = params.get("guid");

        if (guid !== currentGuid) {
            navigate(`/drugsummary?guid=${guid}&page=1`);
        } else {
            navigate(
                `/drugsummary?guid=${guid}${params.has("page") ? `&page=${params.get("page")}` : ""}`
            );
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setSidebarCollapsed(true)
            } else {
                setSidebarCollapsed(false)
            }
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div
            className={`z-10 h-screen ${
                sidebarCollapsed ? "w-16" : "w-60"
            } flex flex-col border-r  border-blue-200 bg-white transition-all duration-300 ease-in-out`}
        >
            <div className="flex h-16 w-full items-center justify-between px-4">
                {!sidebarCollapsed && (
                    <Link to={`/AdminPortal`}>
                        <h1 className="bg-gradient-to-r from-blue-500 via-blue-700 to-blue-300 bg-clip-text font-quicksand text-3xl font-bold text-transparent">
                            Balancer
                        </h1>
                    </Link>
                )}
                <button
                    onClick={toggleSidebar}
                    className="ml-auto rounded-full p-1 text-gray-500 hover:bg-gray-100"
                >
                    {sidebarCollapsed ? (
                        <ChevronRight size={20}/>
                    ) : (
                        <ChevronLeft size={20}/>
                    )}
                </button>
            </div>

            {/* File List Section */}
            <div className="mt-4 flex-1 overflow-y-auto ">
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500"/>
                    </div>
                ) : (
                    <ul className="space-y-1 px-2">
                        {files.map((file) => (
                            <li key={file.guid}>
                                <button
                                    onClick={() => handleFileClick(file.guid)}
                                    className={`flex w-full items-center rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-blue-100 ${
                                        sidebarCollapsed ? "justify-center" : ""
                                    }`}
                                >
                                    <File className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0"/>
                                    {!sidebarCollapsed && (
                                        <span className="truncate">
                      {file.title || file.file_name.replace(/\.[^/.]+$/, "")}
                    </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Sidebar;

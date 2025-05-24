import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentLoadSuccess {
  numPages: number;
}

const PDFViewer = () => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const [targetPageAfterLoad, setTargetPageAfterLoad] = useState<number | null>(
    null
  );

  const manualScrollInProgress = useRef(false);
  const PAGE_INIT_DELAY = 800;

  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const initializationRef = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const guid = params.get("guid");
  const pageParam = params.get("page");

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const pdfUrl = useMemo(
    () => (guid ? `${baseURL}/v1/api/uploadFile/${guid}` : null),
    [guid, baseURL]
  );

  useEffect(() => {
    pageRefs.current = {};
    setIsDocumentLoaded(false);
    initializationRef.current = false;

    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page > 0) setTargetPageAfterLoad(page);
    } else {
      setTargetPageAfterLoad(1);
    }
  }, [guid, pageParam]);

  const scrollToPage = useCallback(
    (page: number) => {
      if (page < 1 || !numPages || page > numPages) return;
      const targetRef = pageRefs.current[page];
      if (!targetRef) return;

      manualScrollInProgress.current = true;
      targetRef.scrollIntoView({ behavior: "smooth", block: "start" });

      const observer = new IntersectionObserver(
        (entries, obs) => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            manualScrollInProgress.current = false;
            obs.disconnect();
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(targetRef);

      const newParams = new URLSearchParams(location.search);
      newParams.set("page", String(page));
      navigate(`${location.pathname}?${newParams.toString()}`, {
        replace: true,
      });
      setPageNumber(page);
    },
    [numPages, navigate, location.pathname, location.search]
  );

  const goToPage = useCallback(
    (page: number) => {
      if (typeof page !== "number" || isNaN(page)) return;
      if (page < 1) page = 1;
      else if (numPages && page > numPages) page = numPages;

      setPageNumber(page);
      scrollToPage(page);
    },
    [numPages, scrollToPage]
  );

  useEffect(() => {
    const handlePageNavigation = (event: Event) => {
      const customEvent = event as CustomEvent<{ pageNumber: number }>;
      const { pageNumber } = customEvent.detail || {};
      if (!pageNumber || isNaN(pageNumber)) return;
      goToPage(pageNumber);
    };

    window.addEventListener("navigateToPdfPage", handlePageNavigation);
    return () =>
      window.removeEventListener("navigateToPdfPage", handlePageNavigation);
  }, [goToPage]);

  useEffect(() => {
    if (
      isDocumentLoaded &&
      numPages &&
      targetPageAfterLoad &&
      Object.keys(pageRefs.current).length > 0
    ) {
      const validPage = Math.min(Math.max(1, targetPageAfterLoad), numPages);
      setPageNumber(validPage);

      const timeoutId = setTimeout(() => {
        scrollToPage(validPage);
        setTargetPageAfterLoad(null);
      }, PAGE_INIT_DELAY);

      return () => clearTimeout(timeoutId);
    }
  }, [isDocumentLoaded, numPages, targetPageAfterLoad, scrollToPage]);

  useEffect(() => {
    const calculateSize = () => {
      if (containerRef.current && headerRef.current && contentRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        const contentPadding = 32;
        const availableHeight =
          containerRef.current.clientHeight - headerHeight - contentPadding;
        const availableWidth = contentRef.current.clientWidth - contentPadding;

        setContainerSize({ width: availableWidth, height: availableHeight });
      }
    };
    calculateSize();
    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, []);

  const pdfOptions = useMemo(
    () => ({
      cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`,
    }),
    []
  );

  const file = useMemo(() => (pdfData ? { data: pdfData } : null), [pdfData]);

  const isPDF = useCallback((data: Uint8Array): boolean => {
    if (data.length < 5) return false;
    const header = String.fromCharCode(...data.slice(0, 5));
    return header.startsWith("%PDF-");
  }, []);

  const fetchPdf = useCallback(async () => {
    if (!pdfUrl) return;
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access");
      if (!token) throw new Error("No access token found. Please log in.");
      const response = await axios.get(pdfUrl, {
        headers: { Authorization: `JWT ${token}` },
        responseType: "arraybuffer",
      });
      const pdfBytes = new Uint8Array(response.data.slice(0));
      if (!isPDF(pdfBytes)) throw new Error("Invalid PDF format.");
      setPdfData(pdfBytes);
    } catch (err: any) {
      const msg = axios.isAxiosError(err)
        ? err.response?.status === 401
          ? "Session expired."
          : err.response?.status === 404
            ? "PDF not found."
            : "Server error."
        : err.message;
      setError(msg);
      setPdfData(null);
    } finally {
      setLoading(false);
    }
  }, [pdfUrl, isPDF]);

  useEffect(() => {
    if (pdfUrl) fetchPdf();
  }, [pdfUrl, fetchPdf]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: DocumentLoadSuccess) => {
      setNumPages(numPages);
      setError(null);
      setIsDocumentLoaded(true);
    },
    []
  );

  if (!guid)
    return <div className="p-4 text-gray-600">No document specified.</div>;

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col bg-white border-r border-gray-30"
    >
      <div
        ref={headerRef}
        className="flex justify-between items-center p-2 bg-gray-50 border-b"
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={() => goToPage(Math.max(pageNumber - 1, 1))}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-white border rounded"
          >
            ←
          </button>
          <span className="text-sm">
            Page {pageNumber} of {numPages || "-"}
          </span>
          <button
            onClick={() =>
              goToPage(Math.min(pageNumber + 1, numPages || pageNumber))
            }
            disabled={!numPages || pageNumber >= numPages}
            className="px-3 py-1 bg-white border rounded"
          >
            →
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}
            className="px-3 py-1 bg-white border rounded"
          >
            −
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.1, 2.0))}
            className="px-3 py-1 bg-white border rounded"
          >
            +
          </button>
        </div>
      </div>
      <div
        ref={contentRef}
        className="flex-grow overflow-auto p-4 w-full flex items-center justify-center"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        ) : error ? (
          <div className="text-red-500 text-center p-4">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchPdf}
              className="mt-2 px-4 py-2 bg-white border rounded"
            >
              Retry
            </button>
          </div>
        ) : (
          file && (
            <div
              className="pdf-document-container flex flex-col items-center"
              style={{ maxHeight: containerSize.height }}
            >
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(err) => setError(err.message)}
                options={pdfOptions}
              >
                <div className="flex flex-col items-center w-full">
                  {Array.from({ length: numPages || 0 }, (_, index) => {
                    const pageNum = index + 1;
                    return (
                      <div
                        key={pageNum}
                        ref={(el) => {
                          if (el) pageRefs.current[pageNum] = el;
                        }}
                        className="mb-4 w-full"
                      >
                        <Page
                          pageNumber={pageNum}
                          scale={scale}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          className="shadow-lg"
                          height={containerSize.height || undefined}
                          width={(containerSize.width || 0) - 50}
                        />
                        <div className="text-center text-gray-500 text-sm mt-1">
                          Page {pageNum} of {numPages}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Document>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PDFViewer;

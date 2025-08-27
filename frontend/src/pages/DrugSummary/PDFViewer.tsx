import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useTransition,
  useDeferredValue,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import ZoomMenu from "./ZoomMenu";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentLoadSuccess {
  numPages: number;
}

const PDFViewer = () => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [uiScalePct, setUiScalePct] = useState(100);
  const deferredScale = useDeferredValue(scale);
  const [isPending, startTransition] = useTransition();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const [targetPageAfterLoad, setTargetPageAfterLoad] = useState<number | null>(
    null
  );

  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const prevGuidRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const isAutoScrollingRef = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const guid = params.get("guid");
  const pageParam = params.get("page");
  const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;

  const pdfUrl = useMemo(() => {
    return guid && baseURL ? `${baseURL}/v1/api/uploadFile/${guid}` : null;
  }, [guid, baseURL]);

  useEffect(() => setUiScalePct(Math.round(scale * 100)), [scale]);

  useEffect(() => {
    const nextPage = pageParam ? parseInt(pageParam, 10) : 1;
    const guidChanged = guid !== prevGuidRef.current;

    if (guidChanged) {
      setIsDocumentLoaded(false);
      setNumPages(null);
      setPdfData(null);
      setTargetPageAfterLoad(null);
      const validPage = !isNaN(nextPage) && nextPage > 0 ? nextPage : 1;
      setPageNumber(validPage);
      setTargetPageAfterLoad(validPage);
      prevGuidRef.current = guid;
      return;
    }

    const desired = !isNaN(nextPage) && nextPage > 0 ? nextPage : 1;
    if (pageNumber !== desired) {
      if (isDocumentLoaded && numPages) {
        const clampedPage = Math.max(1, Math.min(desired, numPages));
        setPageNumber(clampedPage);
        scrollToPage(clampedPage);
      } else {
        setPageNumber(desired);
        setTargetPageAfterLoad(desired);
      }
    }

    prevGuidRef.current = guid;
  }, [guid, pageParam, pageNumber, isDocumentLoaded, numPages]);

  const updateCurrentPageFromScroll = useCallback(() => {
    if (!numPages || !contentRef.current) return;

    if (isAutoScrollingRef.current) return;

    const container = contentRef.current;
    const containerRectTop = container.getBoundingClientRect().top;
    const containerCenter = containerRectTop + container.clientHeight / 2;

    let bestPage = 1;
    let bestDist = Infinity;

    for (let i = 1; i <= numPages; i++) {
      const el = pageRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const pageCenter = r.top + r.height / 2;
      const dist = Math.abs(pageCenter - containerCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestPage = i;
      }
    }

    if (bestPage !== pageNumber) {
      console.log(
        `Scroll detected: updating page from ${pageNumber} to ${bestPage}`
      );
      setPageNumber(bestPage);
      const newParams = new URLSearchParams(location.search);
      newParams.set("page", String(bestPage));
      navigate(`${location.pathname}?${newParams.toString()}`, {
        replace: true,
      });
    }
  }, [numPages, pageNumber, location.pathname, location.search, navigate]);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateCurrentPageFromScroll();
        ticking = false;
      });
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [updateCurrentPageFromScroll]);

  const scrollToPage = useCallback(
    (page: number) => {
      if (!numPages || page < 1 || page > numPages) return;

      const targetRef = pageRefs.current[page];
      if (!targetRef) {
        setTimeout(() => scrollToPage(page), 100);
        return;
      }

      isAutoScrollingRef.current = true;
      targetRef.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });

      const newParams = new URLSearchParams(location.search);
      if (newParams.get("page") !== String(page)) {
        newParams.set("page", String(page));
        navigate(`${location.pathname}?${newParams.toString()}`, {
          replace: true,
        });
      }

      setTimeout(() => {
        isAutoScrollingRef.current = false;
        updateCurrentPageFromScroll();
      }, 500);
    },
    [
      numPages,
      location.pathname,
      location.search,
      navigate,
      updateCurrentPageFromScroll,
    ]
  );

  const goToPage = useCallback(
    (page: number) => {
      if (typeof page !== "number" || isNaN(page)) return;

      const clamped = Math.max(1, numPages ? Math.min(page, numPages) : page);

      if (!isDocumentLoaded || !numPages) {
        setTargetPageAfterLoad(clamped);
        setPageNumber(clamped);
        return;
      }

      if (clamped === pageNumber) return;

      setPageNumber(clamped);
      scrollToPage(clamped);
    },
    [isDocumentLoaded, numPages, pageNumber, scrollToPage]
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
    if (isDocumentLoaded && numPages && targetPageAfterLoad !== null) {
      const validPage = Math.max(1, Math.min(targetPageAfterLoad, numPages));

      console.log(`Navigating to page ${validPage} after document load`);
      const timeoutId = setTimeout(() => {
        scrollToPage(validPage);

        setTimeout(() => {
          setTargetPageAfterLoad(null);
        }, 600);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isDocumentLoaded, numPages, targetPageAfterLoad, scrollToPage]);

  useEffect(() => {
    const calc = () => {
      if (!containerRef.current || !headerRef.current || !contentRef.current)
        return;
      const headerHeight = headerRef.current.offsetHeight;
      const contentPadding = 32;
      const availableHeight =
        containerRef.current.clientHeight - headerHeight - contentPadding;
      const availableWidth = contentRef.current.clientWidth - contentPadding;
      setContainerSize({
        width: Math.max(0, availableWidth),
        height: Math.max(0, availableHeight),
      });
    };

    const id = requestAnimationFrame(calc);

    let ro: ResizeObserver | null = null;
    if ("ResizeObserver" in window && contentRef.current) {
      ro = new ResizeObserver(() => calc());
      ro.observe(contentRef.current);
    } else {
      const onResize = () => requestAnimationFrame(calc);
      window.addEventListener("resize", onResize);
      return () => {
        cancelAnimationFrame(id);
        window.removeEventListener("resize", onResize);
      };
    }

    return () => {
      cancelAnimationFrame(id);
      if (ro && contentRef.current) ro.disconnect();
    };
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
    if (!pdfUrl || isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
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
      isFetchingRef.current = false;
    }
  }, [pdfUrl, isPDF]);

  useEffect(() => {
    if (pdfUrl) fetchPdf();
  }, [pdfUrl, fetchPdf]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: DocumentLoadSuccess) => {
      console.log(`Document loaded with ${numPages} pages`);
      setNumPages(numPages);
      setError(null);
      setIsDocumentLoaded(true);
    },
    []
  );

  if (!guid)
    return <div className="p-4 text-gray-600">No document specified.</div>;

  const baseWidth = Math.max(0, (containerSize.width || 0) - 50);
  const readyToRender = !!file && containerSize.width > 0;

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col bg-white border-r border-blue-200"
    >
      <div
        ref={headerRef}
        className="flex justify-between items-center p-3 bg-white border-b border-gray-200 relative"
      >
        <div className="relative">
          <ZoomMenu
            valuePct={uiScalePct}
            onDeferPct={(pct) => setUiScalePct(pct)}
            onSelectPct={(pct) => {
              setUiScalePct(pct);
              startTransition(() => setScale(pct / 100));
            }}
            onPageFit={() => {
              const pct = 100;
              setUiScalePct(pct);
              startTransition(() => setScale(pct / 100));
            }}
          />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-3">
          <button
            onClick={() => goToPage(Math.max(pageNumber - 1, 1))}
            disabled={pageNumber <= 1}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-gray-600"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">{pageNumber}</span>
            <span>of {numPages || "-"}</span>
          </div>

          <button
            onClick={() => goToPage(pageNumber + 1)}
            disabled={!numPages || pageNumber >= (numPages ?? 1)}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-gray-600"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="w-16 relative">
          {isPending && (
            <div className="absolute right-0 top-0 text-xs text-gray-500 select-none">
              Rendering…
            </div>
          )}
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
        ) : readyToRender ? (
          <div
            className="pdf-document-container flex flex-col items-center"
            style={{ maxHeight: containerSize.height }}
          >
            <Document
              key={guid ?? "doc"}
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
                        pageRefs.current[pageNum] = el;
                      }}
                      className="mb-4 w-full"
                      data-page={pageNum}
                    >
                      <Page
                        key={pageNum}
                        pageNumber={pageNum}
                        width={baseWidth}
                        scale={deferredScale}
                        renderTextLayer={true}
                        renderAnnotationLayer={false}
                        className="shadow-lg"
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
        ) : (
          <div className="h-8" />
        )}
      </div>
    </div>
  );
};

export default PDFViewer;

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker
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

  // Increased delay to ensure page refs are properly set up
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

  // Reset state when document changes
  useEffect(() => {
    console.log("Document changed, resetting state");
    pageRefs.current = {};
    setIsDocumentLoaded(false);
    initializationRef.current = false;

    // Store the target page number if provided in URL
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (!isNaN(page) && page > 0) {
        console.log(`Setting target page after load to: ${page} (from URL)`);
        setTargetPageAfterLoad(page);
      }
    } else {
      console.log("No page param, defaulting to page 1");
      setTargetPageAfterLoad(1);
    }
  }, [guid, pageParam]);

  // Function to scroll to a specific page with enhanced error handling
  const scrollToPage = useCallback(
    (page: number) => {
      console.log(`Attempting to scroll to page ${page}`);

      if (page < 1 || !numPages || page > numPages) {
        console.warn(
          `Cannot scroll to page ${page}: Out of bounds (1-${numPages || "?"})`
        );
        return;
      }

      // Check if page refs are available
      console.log(`Available page refs:`, Object.keys(pageRefs.current).length);

      const targetRef = pageRefs.current[page];
      console.log(
        `Target ref for page ${page}:`,
        targetRef ? "Found" : "Not found"
      );

      if (targetRef) {
        console.log(`Scrolling to page ${page}`);

        // Try-catch to handle any scrolling errors
        try {
          targetRef.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Update URL to reflect the current page
          const newParams = new URLSearchParams(location.search);
          newParams.set("page", String(page));
          navigate(`${location.pathname}?${newParams.toString()}`, {
            replace: true,
          });

          console.log(`Successfully scrolled to page ${page}`);
        } catch (e) {
          console.error("Error during scroll:", e);
        }
      } else {
        console.warn(
          `No ref found for page ${page}, retrying in ${PAGE_INIT_DELAY}ms`
        );

        // Retry after a delay if the ref isn't found
        setTimeout(() => {
          const retryRef = pageRefs.current[page];
          if (retryRef) {
            console.log(`Retry: Found ref for page ${page}, scrolling now`);
            try {
              retryRef.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });

              // Update URL to reflect the current page
              const newParams = new URLSearchParams(location.search);
              newParams.set("page", String(page));
              navigate(`${location.pathname}?${newParams.toString()}`, {
                replace: true,
              });
            } catch (e) {
              console.error("Error during retry scroll:", e);
            }
          } else {
            console.error(`Retry failed: Still no ref for page ${page}`);
          }
        }, PAGE_INIT_DELAY);
      }
    },
    [numPages, navigate, location.pathname, location.search, PAGE_INIT_DELAY]
  );

  // Update page number when navigating with buttons - enhanced with validation
  const goToPage = useCallback(
    (page: number) => {
      console.log(`goToPage called with page ${page}`);

      if (typeof page !== "number" || isNaN(page)) {
        console.error(`Invalid page number: ${page}`);
        return;
      }

      if (page < 1) {
        console.warn(`Page number too low (${page}), setting to 1`);
        page = 1;
      } else if (numPages && page > numPages) {
        console.warn(`Page number too high (${page}), capping at ${numPages}`);
        page = numPages;
      }

      console.log(`Setting page number to ${page}`);
      setPageNumber(page);
      scrollToPage(page);
    },
    [numPages, scrollToPage]
  );

  // Listen for custom page navigation events with enhanced error handling
  useEffect(() => {
    const handlePageNavigation = (event: Event) => {
      console.log("Received event:", event.type);

      try {
        const customEvent = event as CustomEvent<{ pageNumber: number }>;
        console.log("Event detail:", customEvent.detail);

        if (!customEvent.detail) {
          console.error("Event has no detail property");
          return;
        }

        const { pageNumber } = customEvent.detail;
        console.log("Extracted pageNumber:", pageNumber);

        if (typeof pageNumber !== "number") {
          console.error(`Invalid pageNumber type: ${typeof pageNumber}`);
          // Try to convert to number if possible
          const parsedPage = parseInt(String(pageNumber), 10);
          if (!isNaN(parsedPage)) {
            console.log(`Converted pageNumber to number: ${parsedPage}`);
            goToPage(parsedPage);
            return;
          }
          return;
        }

        if (isNaN(pageNumber)) {
          console.error("pageNumber is NaN");
          return;
        }

        console.log("Received navigateToPdfPage event:", pageNumber);

        // Validate page number is in range before navigating
        // Allow navigation even if numPages is not yet set, will be checked in goToPage
        goToPage(pageNumber);
      } catch (error) {
        console.error("Error handling navigation event:", error);
      }
    };

    console.log("Setting up navigateToPdfPage event listener");
    window.addEventListener("navigateToPdfPage", handlePageNavigation);

    return () => {
      console.log("Removing navigateToPdfPage event listener");
      window.removeEventListener("navigateToPdfPage", handlePageNavigation);
    };
  }, [goToPage]);

  // Navigate to the correct page once document is loaded and pages are rendered
  useEffect(() => {
    if (
      isDocumentLoaded &&
      numPages &&
      targetPageAfterLoad &&
      Object.keys(pageRefs.current).length > 0
    ) {
      console.log(
        "Document loaded, navigating to target page:",
        targetPageAfterLoad
      );

      // Validate the target page is within bounds
      const validPage = Math.min(Math.max(1, targetPageAfterLoad), numPages);
      console.log(`Validated page number: ${validPage}`);

      // Set the page number
      setPageNumber(validPage);

      // Scroll after a delay to ensure refs are populated
      console.log(
        `Scheduling scroll to page ${validPage} in ${PAGE_INIT_DELAY}ms`
      );
      const timeoutId = setTimeout(() => {
        console.log(`Executing scheduled scroll to page ${validPage}`);
        scrollToPage(validPage);
        setTargetPageAfterLoad(null); // Clear the target to prevent loops
      }, PAGE_INIT_DELAY); // Increased delay for better reliability

      return () => {
        console.log(`Clearing scheduled scroll to page ${validPage}`);
        clearTimeout(timeoutId);
      };
    }
  }, [
    isDocumentLoaded,
    numPages,
    targetPageAfterLoad,
    scrollToPage,
    PAGE_INIT_DELAY,
  ]);

  // Calculate container size to make PDF responsive
  useEffect(() => {
    const calculateSize = () => {
      if (containerRef.current && headerRef.current && contentRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        const contentPadding = 32;

        // Get the available height and width for the PDF
        const availableHeight =
          containerRef.current.clientHeight - headerHeight - contentPadding;
        const availableWidth = contentRef.current.clientWidth - contentPadding;

        setContainerSize({
          width: availableWidth,
          height: availableHeight,
        });
      }
    };

    calculateSize();

    // Recalculate on resize
    window.addEventListener("resize", calculateSize);
    return () => {
      window.removeEventListener("resize", calculateSize);
    };
  }, []);

  // Set up Intersection Observer to update page number based on visible pages, but only after initial navigation
  useEffect(() => {
    if (
      !numPages ||
      Object.keys(pageRefs.current).length === 0 ||
      !isDocumentLoaded ||
      targetPageAfterLoad
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Don't update during initial page load
        if (!initializationRef.current) {
          if (entries.some((entry) => entry.isIntersecting)) {
            initializationRef.current = true;
            return;
          }
        }

        // Find the entry with the highest intersection ratio
        let highestVisiblePage: number | null = null;
        let highestRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
            highestRatio = entry.intersectionRatio;
            // Find the page number from the pageRefs object
            for (const [pageNum, ref] of Object.entries(pageRefs.current)) {
              if (ref === entry.target) {
                highestVisiblePage = parseInt(pageNum, 10);
                break;
              }
            }
          }
        });

        // Update the page number if we found a visible page
        if (highestVisiblePage !== null && highestVisiblePage !== pageNumber) {
          setPageNumber(highestVisiblePage);

          // Update URL without triggering a navigation
          const newParams = new URLSearchParams(location.search);
          newParams.set("page", String(highestVisiblePage));
          navigate(`${location.pathname}?${newParams.toString()}`, {
            replace: true,
          });
        }
      },
      { threshold: [0.1, 0.5, 0.8] }
    );

    // Observe all page refs
    Object.values(pageRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [
    numPages,
    pageNumber,
    navigate,
    location.pathname,
    location.search,
    isDocumentLoaded,
    targetPageAfterLoad,
  ]);

  // Memoize PDF options
  const pdfOptions = useMemo(
    () => ({
      cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`,
    }),
    []
  );

  // Memoize file object
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
      if (!token) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await axios({
        method: "GET",
        url: pdfUrl,
        headers: {
          Authorization: `JWT ${token}`,
        },
        responseType: "arraybuffer",
      });

      // Create a copy of the array buffer to prevent detachment
      const arrayBuffer = response.data.slice(0);
      const pdfBytes = new Uint8Array(arrayBuffer);

      if (!isPDF(pdfBytes)) {
        throw new Error(
          "Invalid PDF format. The server response does not appear to be a PDF file."
        );
      }

      setPdfData(pdfBytes);
      setLoading(false);
    } catch (err: any) {
      let errorMessage = "An error occurred while fetching the PDF.";

      if (axios.isAxiosError(err)) {
        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = "Session expired. Please log in again.";
              break;
            case 403:
              errorMessage = "You don't have permission to view this document.";
              break;
            case 404:
              errorMessage = "PDF file not found.";
              break;
            case 406:
              errorMessage = "Server cannot generate the requested format.";
              break;
            default:
              errorMessage = `Server error: ${err.response.statusText || "Unknown error"}`;
          }
        } else if (err.request) {
          errorMessage =
            "Unable to reach the server. Please check your connection.";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      console.error("PDF fetch error:", err);
      setError(errorMessage);
      setPdfData(null);
      setLoading(false);
    }
  }, [pdfUrl, isPDF]);

  useEffect(() => {
    if (pdfUrl) {
      fetchPdf();
    }
  }, [pdfUrl, fetchPdf]);

  // Enhanced document load success handler with logging
  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: DocumentLoadSuccess) => {
      console.log("PDF document loaded successfully, pages:", numPages);
      setNumPages(numPages);
      setError(null);

      // Mark document as loaded to trigger navigation
      console.log("Setting document as loaded");
      setIsDocumentLoaded(true);

      // Log the current state of page refs
      console.log(
        "Page refs at load success:",
        Object.keys(pageRefs.current).length
      );
    },
    []
  );

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error("Document load error:", err);
    setError(err.message);
  }, []);

  // Function to ensure all pages have refs
  const ensurePageRefs = useCallback(() => {
    if (!numPages) return;

    console.log("Ensuring all pages have refs");
    let missingPages = false;

    for (let i = 1; i <= numPages; i++) {
      if (!pageRefs.current[i]) {
        missingPages = true;
        console.warn(`Missing ref for page ${i}`);
      }
    }

    if (missingPages) {
      console.log("Some pages missing refs, will retry setting refs");
    } else {
      console.log("All page refs are properly set");
    }
  }, [numPages]);

  // Call ensurePageRefs after document loads
  useEffect(() => {
    if (isDocumentLoaded && numPages) {
      const timeoutId = setTimeout(() => {
        ensurePageRefs();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [isDocumentLoaded, numPages, ensurePageRefs]);

  if (!guid) {
    return <div className="p-4 text-gray-600">No document specified.</div>;
  }

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
            className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
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
            className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            →
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}
            className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
          >
            −
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.1, 2.0))}
            className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={contentRef}
        className="flex-grow overflow-auto p-4 w-full flex items-center justify-center"
        style={{
          transform: "none",
        }}
      >
        {loading && (
          <div className="flex items-center justify-center h-full w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-red-500 text-center p-4">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchPdf}
                className="mt-2 px-4 py-2 bg-white border rounded hover:bg-gray-50"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {file && !loading && !error && (
          <div
            className="pdf-document-container flex flex-col items-center"
            style={{ maxHeight: containerSize.height }}
          >
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              error={null}
              options={pdfOptions}
              className="flex justify-center"
            >
              <div className="flex flex-col items-center w-full">
                {numPages &&
                  Array.from({ length: numPages }, (_, index) => {
                    const pageNum = index + 1;
                    return (
                      <div
                        key={pageNum}
                        ref={(el) => {
                          if (el) {
                            pageRefs.current[pageNum] = el;
                            console.log(`Ref set for page ${pageNum}`);
                          }
                        }}
                        className="mb-4 w-full"
                        data-page-number={pageNum}
                      >
                        <Page
                          pageNumber={pageNum}
                          scale={scale}
                          loading={null}
                          error={null}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          className="shadow-lg"
                          height={
                            containerSize.height > 0
                              ? containerSize.height
                              : undefined
                          }
                          width={
                            containerSize.width > 0
                              ? containerSize.width - 50
                              : undefined
                          }
                          onRenderSuccess={() => {
                            console.log(
                              `Page ${pageNum} rendered successfully`
                            );
                          }}
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
        )}
      </div>
    </div>
  );
};

export default PDFViewer;

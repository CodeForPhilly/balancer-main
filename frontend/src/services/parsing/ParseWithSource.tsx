import { Link, useLocation } from "react-router-dom";
import { EmbeddingInfo } from "./chat";

interface ParseStringWithLinksProps {
  text: string;
  chunkData: EmbeddingInfo[];
}

const ParseStringWithLinks: React.FC<ParseStringWithLinksProps> = ({
  text,
  chunkData,
}) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentGuid = params.get("guid");
  
  const parseText = (text: string) => {
    // Regular expression to find ***[GUID, Page X, Chunk Y]***
    const regex = /\*\*\*\[([^\]]+)\]\*\*\*/g;

    // Create a map of chunk information for easy lookup
    const chunkMap = new Map<
      string,
      { name: string; page_number: number; chunk_number: number; text: string }
    >();

    // Debug: Log chunk data size
    console.log(`Chunk data size: ${chunkData.length}`);

    chunkData.forEach(({ file_id, name, page_number, chunk_number, text }) => {
      const key = `${file_id}-${page_number}-${chunk_number}`;
      chunkMap.set(key, { name, page_number, chunk_number, text });

      // Debug: Log each chunk mapping
      console.log(
        `Set chunkMap[${key}] = { name: ${name}, page_number: ${page_number}, chunk_number: ${chunk_number} }`
      );
    });

    // Use replace method to process the text and insert links
    const processedText = text.split(regex).map((part, index) => {
      // If the index is odd, it means this part is between *** ***
      if (index % 2 === 1) {
        // Extract GUID, page number, and chunk number from the matched part
        const guidMatch = part.match(/([a-f0-9\-]{36})/);
        const pageNumberMatch = part.match(/Page\s*(?:Number:)?\s*(\d+)/i);
        const chunkNumberMatch = part.match(/Chunk\s*(\d+)/i);

        // Debug: Log matched parts
        console.log(`Matched Part: ${part}`);
        console.log(`GUID Match: ${guidMatch ? guidMatch[1] : "null"}`);
        console.log(
          `Page Number Match: ${pageNumberMatch ? pageNumberMatch[1] : "null"}`
        );
        console.log(
          `Chunk Number Match: ${chunkNumberMatch ? chunkNumberMatch[1] : "null"}`
        );

        if (guidMatch && pageNumberMatch && chunkNumberMatch) {
          const guid = guidMatch[1];
          const pageNumber = parseInt(pageNumberMatch[1], 10);
          const chunkNumber = chunkNumberMatch[1];

          const chunkKey = `${guid}-${pageNumber}-${chunkNumber}`;

          // Debug: Log lookup attempt
          console.log(`Looking up chunkKey: ${chunkKey}`);

          const chunkData = chunkMap.get(chunkKey);

          if (chunkData) {
            // Debug: Log successful lookup
            console.log(`Found chunk data for ${chunkKey}`);

            const { name, text: chunkText } = chunkData;
            const tooltipContent = `Document Name: ${name}, Page: ${pageNumber}, Chunk: ${chunkNumber}, Text: ${chunkText}`;

            const isSamePdf = currentGuid === guid;
            
            if (isSamePdf) {
              return (
                <a
                  key={index}
                  className="cursor-pointer rounded-xl bg-gray-100 px-1.5 py-0.5 text-[13px] font-medium text-gray-400 hover:bg-gray-200"
                  onClick={() => {
                    const event = new CustomEvent("navigateToPdfPage", {
                      detail: { pageNumber: pageNumber }
                    });
                    window.dispatchEvent(event);
                  }}
                  title={tooltipContent}
                >
                  {`${pageNumber}`}
                </a>
              );
            } else {
              // If different PDF, navigate to the new PDF with the correct page
              return (
                <Link
                  key={index}
                  className="cursor-pointer rounded-xl bg-gray-100 px-1.5 py-0.5 text-[13px] font-medium text-gray-400 hover:bg-gray-200"
                  to={`${location.pathname}?guid=${guid}&page=${pageNumber}`}
                  title={tooltipContent}
                >
                  {`${pageNumber}`}
                </Link>
              );
            }
          } else {
            // Debug: Log failed lookup
            console.log(`No chunk data found for ${chunkKey}`);

            // Fallback: Still create a link but with a warning in the tooltip
            return (
              <Link
                key={index}
                className="cursor-pointer rounded-xl bg-gray-100 px-1.5 py-0.5 text-[13px] font-medium text-gray-700 hover:bg-gray-200"
                to={`${location.pathname}?guid=${guid}&page=${pageNumber}`}
                title={`Warning: No matching chunk data found for Page: ${pageNumber}, Chunk: ${chunkNumber}`}
              >
                {`${pageNumber}?`}
              </Link>
            );
          }
        }
      }

      return (
        <span
          key={index}
          dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, "<br />") }}
        />
      );
    });

    return <>{processedText}</>;
  };

  return <div>{parseText(text)}</div>;
};

export default ParseStringWithLinks;
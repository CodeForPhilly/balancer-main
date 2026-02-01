import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { EmbeddingInfo } from "../../pages/DrugSummary/type";

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

  const parsedContent = useMemo(() => {
    const parseText = (text: string) => {
      const regex = /\*\*\*\[([^\]]+)\]\*\*\*/g;

      const processedText = text.split(regex).map((part, index) => {
        if (index % 2 === 1) {
          const guidMatch = part.match(/([a-f0-9\-]{36})/);
          const pageNumberMatch = part.match(/Page\s*(?:Number:)?\s*(\d+)/i);
          const chunkNumberMatch = part.match(/Chunk\s*(\d+)/i);

          if (guidMatch && pageNumberMatch && chunkNumberMatch) {
            const guid = guidMatch[1];
            const pageNumber = parseInt(pageNumberMatch[1], 10);
            const chunkNumber = parseInt(chunkNumberMatch[1], 10);
            const isSamePdf = currentGuid === guid;

            const matchedChunk = chunkData.find(
              (chunk) =>
                chunk.file_id === guid &&
                chunk.page_number === pageNumber &&
                chunk.chunk_number === chunkNumber
            );

            const tooltipContent = matchedChunk
              ? `Text: ${matchedChunk.text}`
              : `Page ${pageNumber}, Chunk ${chunkNumber}`;

            if (isSamePdf) {
              return (
                <a
                  key={`link-${guid}-${pageNumber}-${chunkNumber}-${index}`}
                  className="cursor-pointer rounded-xl bg-gray-100 px-1.5 py-0.5 text-[13px] font-medium text-gray-400 hover:bg-gray-200"
                  onClick={() => {
                    const event = new CustomEvent("navigateToPdfPage", {
                      detail: { pageNumber },
                    });
                    window.dispatchEvent(event);
                  }}
                  title={tooltipContent}
                >
                  {`${pageNumber}`}
                </a>
              );
            } else {
              return (
                <Link
                  key={`extlink-${guid}-${pageNumber}-${chunkNumber}-${index}`}
                  className="cursor-pointer rounded-xl bg-gray-100 px-1.5 py-0.5 text-[13px] font-medium text-gray-400 hover:bg-gray-200"
                  to={`${location.pathname}?guid=${guid}&page=${pageNumber}`}
                  title={tooltipContent}
                >
                  {`${pageNumber}`}
                </Link>
              );
            }
          }
        }

        return (
          <span
            key={`text-${index}-${part.slice(0, 10)}`}
            dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, "<br />") }}
          />
        );
      });

      return <>{processedText}</>;
    };

    return parseText(text);
  }, [text, chunkData, currentGuid, location.pathname]);

  return <div>{parsedContent}</div>;
};

export default React.memo(ParseStringWithLinks);

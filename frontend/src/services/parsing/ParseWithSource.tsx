import { Link } from "react-router-dom";
import { EmbeddingInfo } from "./chat";

interface ParseStringWithLinksProps {
  text: string;
  chunkData: EmbeddingInfo[];
}
const ParseStringWithLinks: React.FC<ParseStringWithLinksProps> = ({
  text,
  chunkData,
}) => {
  const parseText = (text: string) => {
    // Regular expression to find ***[GUID, Page X, Chunk Y]***
    const regex = /\*\*\*\[([^\]]+)\]\*\*\*/g;

    // Create a map of chunk information for easy lookup
    const chunkMap = new Map<
      string,
      { name: string; page_number: number; chunk_number: number; text: string }
    >();
    chunkData.forEach(({ file_id, name, page_number, chunk_number, text }) => {
      const key = `${file_id}-${page_number}-${chunk_number}`;
      chunkMap.set(key, { name, page_number, chunk_number, text });
      // console.log(
      //   `Set chunkMap[${key}] = { name: ${name}, page_number: ${page_number}, chunk_number: ${chunk_number}, text: ${text} }`
      // );
    });

    // console.log("chunkMap:", chunkMap);

    // Use replace method to process the text and insert links
    const processedText = text.split(regex).map((part, index) => {
      // If the index is odd, it means this part is between *** ***
      if (index % 2 === 1) {
        // Extract GUID, page number, and chunk number from the matched part
        const guidMatch = part.match(/([a-f0-9\-]{36})/);
        const pageNumberMatch = part.match(/Page\s*(?:Number:)?\s*(\d+)/i);
        const chunkNumberMatch = part.match(/Chunk\s*(\d+)/i);

        // console.log("Matched Part:", part);
        // console.log("GUID Match:", guidMatch);
        // console.log("Page Number Match:", pageNumberMatch);
        // console.log("Chunk Number Match:", chunkNumberMatch);

        if (guidMatch && pageNumberMatch && chunkNumberMatch) {
          const guid = guidMatch[1];
          const pageNumber = pageNumberMatch[1];
          const chunkNumber = chunkNumberMatch[1];

          const chunkKey = `${guid}-${pageNumber}-${chunkNumber}`;
          const chunkData = chunkMap.get(chunkKey);

          if (chunkData) {
            const { name, text: chunkText } = chunkData;
            const tooltipContent = `Document Name: ${name}, Page: ${pageNumber}, Chunk: ${chunkNumber}, Text: ${chunkText}`;
            // console.log("chunkKey:", chunkKey);
            // console.log("tooltipContent:", tooltipContent);

            return (
              <Link
                key={index}
                className="cursor-pointer rounded-xl bg-gray-100 px-1.5 py-0.5 text-[13px] font-medium text-gray-400 hover:bg-gray-200"
                to={`/PromptChatManager?fileguid=${guid}&page=${pageNumber}`}
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
          key={index}
          dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, "<br />") }}
        />
      );
    });

    // console.log("processedText:", processedText);
    return <>{processedText}</>;
  };
  // console.log("processedText:", <div>{parseText(text)}</div>);
  return <div>{parseText(text)}</div>;
};

export default ParseStringWithLinks;

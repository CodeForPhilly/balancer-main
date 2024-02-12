import Layout from "../Layout/Layout";
import { useEffect, useState } from "react";

interface HelpProps {
    title: string;
    paragraph: string;
}

function HelpCard(data: HelpProps){
  const [paragraph, setParagraph] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!data.paragraph ) {
        setParagraph("Error: No paragraph provided.");
    }
    if (!data.title ) {
        setTitle("Error: No title provided.");
    }
        setTitle(data.title);
        setParagraph(data.paragraph);
  }, [paragraph, data, title]);

  return (
    <div className="h-48 flex w-full max-w-6xl flex-col items-center justify-center px-4 py-8 shadow-md md:mt-28 bg-neutral-50 rounded-xl border-2 border-blue-100 p-4">
      <div className="p-4 h-48">
          <h1 className="text-center text-blue-600">{title}</h1>
          <p
            className="text-log sm:text-x; mx-auto
          mt-5 hidden max-w-[100%] text-center font-satoshi text-gray-600 md:block"
          >
            {paragraph}
          </p>
      </div>
    </div>
  );
}

export default HelpCard;

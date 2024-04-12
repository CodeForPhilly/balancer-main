import { useEffect, useState } from "react";
import MagnifyingGlassChart from "./MagnifyingGlassChart";
import UserDoctor from "./UserDoctor";
import FeedbackIcon from "./FeedbackIcon";

interface HelpProps {
  icon: string;
  title: string;
  paragraph: string;
}

function HelpCard(data: HelpProps) {
  const [paragraph, setParagraph] = useState("");
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState<JSX.Element | null>(null);

  useEffect(() => {
    if (!data.paragraph) {
      setParagraph("Error: No paragraph provided.");
    }
    if (!data.title) {
      setTitle("Error: No title provided.");
    }
    setTitle(data.title);
    setParagraph(data.paragraph);
    // if (data.icon == "UserDoctor") {
    //   setIcon(<UserDoctor />);
    // } else if (data.icon == "FeedbackIcon") {
    //   setIcon(<FeedbackIcon />);
    // } else if (data.icon == "MagnifyingGlassChart") {
    //   setIcon(<MagnifyingGlassChart />);
    switch (data.icon) {
      case "UserDoctor":
        setIcon(<UserDoctor />);
        break;
      case "FeedbackIcon":
        setIcon(<FeedbackIcon />);
        break;
      case "MagnifyingGlassChart":
        setIcon(<MagnifyingGlassChart />);
        break;
      default:
        setIcon(null);
    }
    // }, [paragraph, data, title]);
  }, [data.icon, data.title, data.paragraph]);

  return (
    // <div className="flex h-72 w-full max-w-6xl flex-col items-center justify-center rounded-xl border-2 border-blue-100 bg-neutral-50 px-4 shadow-md md:mt-28">
    <div className="flex h-72 w-full min-w-[280px] max-w-6xl flex-col items-center justify-center rounded-xl border-2 border-blue-100 bg-neutral-50 px-4 shadow-md md:mt-28">
      <div className="flex h-full flex-col items-center">
        {icon && <div className="mt-6 h-24 w-24">{icon}</div>}
        <div className="mt-6 flex flex-col">
          <h1 className="py-2 text-center text-black">{title}</h1>
          <p className="text-center font-satoshi text-sm text-gray-600">
            {paragraph}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HelpCard;

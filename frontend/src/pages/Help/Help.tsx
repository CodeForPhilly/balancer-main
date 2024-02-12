import Layout from "../Layout/Layout";
import { useEffect, useState } from "react";
import HelpCard from "./HelpCard";

interface HelpData {
  icon: string[];
  title: string[];
  paragraph: string[];
}

const HelpCardData: HelpData = {
  icon: [
    "UserDoctor",
    "FeedbackIcon",
    "MagnifyingGlassChart",
  ],
  title: ["How To Use this Site", "Submit Feedback", "How We Get Our Data"],
  paragraph: [
      "Visit this page to learn how to use the Balancer App!",
    "Give the Balancer team feedback on your experience.",
    "Learn where the Balancer team gets our data!",
  ],
};

function Help() {
  const [data, setData] = useState<HelpData>({
    icon: [""],
    title: [""],
    paragraph: [""],
  });

  useEffect(() => {
    if (!data) {
      setData({
        icon: [""],
        title: ["error setting data"],
        paragraph: ["error setting data"],
      });
    } else setData(HelpCardData);
  }, [data]);

  return (
    <Layout>
      <div className="mt-20 flex w-full max-w-6xl flex-col items-center justify-center px-4 md:mt-28">
        <div className="flex justify-center ">
          <h1 className="mt-20 text-3xl text-blue-600 font-satoshi">Help & Support Page</h1>
        </div>
        <div>
        <h3 className="text-gray-600 font-satoshi">Let us help you in your Balancer experience!</h3>
        </div>
        <div className="flex flex-row gap-4">
          <HelpCard icon={data.icon[0]} title={data.title[0]} paragraph={data.paragraph[0]} />
          <HelpCard icon={data.icon[1]} title={data.title[1]} paragraph={data.paragraph[1]} />
          <HelpCard icon={data.icon[2]} title={data.title[2]} paragraph={data.paragraph[2]} />
        </div>
      </div>
    </Layout>
  );
}

export default Help;

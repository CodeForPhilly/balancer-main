import Layout from "../Layout/Layout";
import { useEffect, useState } from "react";
import HelpCard from "./HelpCard";
import { Link } from "react-router-dom";

interface HelpData {
  link: string[];
  icon: string[];
  title: string[];
  paragraph: string[];
}

const HelpCardData: HelpData = {
  link: ["/how-to", "/feedback", "/data-sources"],
  icon: ["UserDoctor", "FeedbackIcon", "MagnifyingGlassChart"],
  title: ["How To Use this Site", "Submit Feedback", "How We Get Our Data"],
  paragraph: [
    "Visit this page to learn how to use the Balancer App!",
    "Give the Balancer team feedback on your experience.",
    "Learn where the Balancer team gets our data!",
  ],
};

function Help() {
  const [data, setData] = useState<HelpData>({
    link: [""],
    icon: [""],
    title: [""],
    paragraph: [""],
  });

  useEffect(() => {
    if (!data) {
      setData({
        link: [""],
        icon: [""],
        title: ["error setting data"],
        paragraph: ["error setting data"],
      });
    } else setData(HelpCardData);
  }, [data]);

  return (
    <Layout>
      <div className="mt-20 flex w-full max-w-6xl flex-col items-center justify-center px-4">
        <div className="flex justify-center text-center">
          <h2 className="mt-20 font-satoshi text-3xl text-blue-600">
            Help & Support Page
          </h2>
        </div>
        <div className="flex py-2 text-center">
          <h3 className="font-satoshi text-gray-600">
            Let us help you in your Balancer experience!
          </h3>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          {data.icon.map((icon, index) => (
            <Link
              to={data.link[index]}
              key={index}
              className="flex max-w-full flex-grow basis-1/3"
            >
              <HelpCard
                key={index}
                icon={icon}
                title={data.title[index]}
                paragraph={data.paragraph[index]}
              />
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Help;

import Layout from "../Layout/Layout";
import { useEffect, useState } from "react";
import HelpCard from "./HelpCard";

interface HelpData {
    title: string[];
    paragraph: string[];
}

const HelpCardData: HelpData = {
    title: [
        "How To Use the Page",
        "Feedback",
        "How We Get Our Data"
    ],
    paragraph: [
        "This is the help page for the Balancer app. "
        + "You can use this page to learn how to use " +
        "the Balancer app.",
        "This is the feedback page where you can " + 
        "give the Balancer team feedback on your" +
        " app experience.",
        "This is where you can learn how the" +
        "Balancer team gets our data!"
    ]
}

function Help() {
    const [data, setData] = useState<HelpData>({
        title: [
            ""
        ],
        paragraph: [
            ""
        ]
    }
);

useEffect(() => {
    if (!data) {
        setData({ title: ["error setting data"], paragraph: ["error setting data"] });
    }
    else setData(HelpCardData);
}, [data]);
    
  return (
    <Layout>
      <div className="mt-20 px-4 flex w-full max-w-6xl flex-col items-center justify-center md:mt-28">
      <div className="flex justify-center ">
        <h1 className="text-blue-600 mt-20 text-3xl">Help</h1>
    </div>
    <div className="flex flex-row gap-4">
       <HelpCard title={data.title[0]} paragraph={data.paragraph[0]} />
       <HelpCard title={data.title[1]} paragraph={data.paragraph[1]} />
       <HelpCard title={data.title[2]} paragraph={data.paragraph[2]} />
       </div>
      </div>
    </Layout>
  );
}

export default Help;

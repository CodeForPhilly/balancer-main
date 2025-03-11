import Layout from "../Layout/Layout";
import LineChart from "./Icons/LineChart";
import ListOfFiles from "../Files/ListOfFiles.tsx";

interface DataProps {
  title: string;
  paragraph: string[];
}

const data: DataProps = {
  title: "How Do We Get Our Data?",
  paragraph: [
    "Balancer is a free and open-source tool that utilizes data from " +
    "publicly available peer-reviewed medical research, as well as " +
    "through extensive interviews with physicians and medical professionals " +
    "who treat patients with bipolar disorder.",
    "See below for our data sources:"
  ],

};

function HowTo() {
  return (
    <Layout>
      <div className="mt-20 flex w-full max-w-6xl flex-col items-center justify-center px-8">
        <div className="mt-10 h-44 w-44">
        <LineChart />
        </div>
        <h3 className="flex items-center justify-center py-4 text-xl">
          {data.title}
        </h3>
        <div className="flex flex-col min-w-68 rounded-xl border-2 border-blue-100 bg-neutral-50 px-4 py-4 shadow-md">
          <div className="flex flex-col px-2 py-2">
            <p className="font-satoshi text-sm text-gray-700">
              {data.paragraph[0]}
            </p>
          </div>
          <div className="flex flex-col px-2 py-2">
            <p className="font-satoshi text-sm text-gray-700">
              {data.paragraph[1]}
            </p>
          </div>
          <div className="flex flex-col px-6 py-2 font-satoshi text-sm text-gray-700">
            <ListOfFiles fileNameOnly={true} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default HowTo;

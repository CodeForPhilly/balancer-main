import { Link } from "react-router-dom";
import Layout from "../Layout/Layout";
import HelpCard from "./HelpCard";
import { helpData } from "./helpData";

function Help() {
  return (
    <Layout>
      <div className="mt-20 flex w-full max-w-6xl flex-col items-center justify-center px-4">
        <div className="flex justify-center text-center">
          <h1 className="mt-20 font-satoshi text-3xl text-blue-600">
            Help & Support
          </h1>
        </div>
        <div className="flex py-2 text-center">
          <h3 className="font-satoshi text-gray-600">
            Get help and support for improving your Balancer experience.
          </h3>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          {helpData.map((helpDataEntry, index) => {
            const card = (
              <HelpCard
                key={index}
                title={helpDataEntry.title}
                paragraph={helpDataEntry.paragraph}
                Icon={helpDataEntry.Icon}
              />
            );

            return helpDataEntry.link ? (
              <Link
                to={helpDataEntry.link}
                key={index}
                className="flex max-w-full flex-grow basis-1/3"
              >
                {card}
              </Link>
            ) : (
              <div key={index} className="flex max-w-full flex-grow basis-1/3">
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

export default Help;

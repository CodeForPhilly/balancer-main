import { Link } from "react-router-dom";
import Layout from "../Layout/Layout";
import Welcome from "../../components/Welcome/Welcome";
import HelpCard from "./HelpCard";
import { helpData } from "./helpData";

function Help() {
  return (
    <Layout>
      <div className="mt-20 flex w-full max-w-6xl flex-col items-center justify-center px-4">
        <Welcome
          subHeader="Help & Support"
          descriptionText="Get help and support for improving your Balancer experience."
        />
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

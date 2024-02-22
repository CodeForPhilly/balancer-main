//import Welcome from "../../components/Welcome/Welcome.tsx";
import Layout from "../Layout/Layout";
import image from "./OIP.jpeg";

function About() {
  return (
    <Layout>
      <div className="summary_box font_body mt-48 flex w-full max-w-6xl flex-col items-center justify-center">
        {/* Top section */}
        <div className="flex flex-row">
          <div className="top-section mr-10 mt-10 flex w-full max-w-6xl flex-col justify-center">
            <div className="mt-5 text-3xl font-bold">
              A tool that makes it easier to research medications for bipolar
              disorder.
            </div>
            <div className="mt-5 text-lg text-gray-500">
              It can take two to 10 years—and three to 30 medications—for people
              with bipolar disorder to find the right medication combination.
              Balancer is designed to help physicians shorten this journey for
              their patients.
            </div>
          </div>
          <img
            src={image}
            alt="about image"
            className="mt-10 rounded-2xl"
          ></img>
        </div>

        {/* Middle section */}
        <div className="mission-section flex w-full max-w-6xl flex-row justify-center md:mt-28">
          <div>
            <div className="text-3xl font-bold">
              Get accurate, helpful information on bipolar medications fast
            </div>
            <div className="mt-5 text-lg text-gray-500">
              Powered by innovative AI technology, Balancer is a tool that aids
              in providing personalized medication recommendations for patients
              with bipolar disorder in any state, including mania, depression,
              hypomania and mixed. Our platform utilizes machine learning to
              give you the latest, most up-to-date information on medications
              and active clinical trials to treat bipolar disorder.{" "}
            </div>
            <div className="mt-5 text-lg text-gray-500">
              Balancer automates medication decision support by offering
              tailored medication recommendations and comprehensive risk-benefit
              assessments based on a patient's diagnosis, symptom severity,
              treatment goals and individual characteristics.{" "}
            </div>
            <div className="mt-20 text-3xl font-bold">Our mission</div>
            <div className="flex w-full flex-col justify-between">
              <div className="mt-8 text-lg text-gray-500">
                Bipolar disorder affects approximately 5.7 million adult
                Americans
                <a
                  href="https://www.dbsalliance.org/education/bipolar-disorder/bipolar-disorder-statistics/"
                  className="underline"
                  target="_blank"
                >
                  {" "}
                  every year
                </a>
                . Delays in the correct diagnosis and proper treatment of
                bipolar disorder may result in social, occupational, and
                economic burdens, as well as
                <a
                  href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2796048/"
                  className="underline"
                  target="_blank"
                >
                  {" "}
                  an increase in completed suicides
                </a>
                .
              </div>
              <div className="mt-5 text-lg text-gray-500">
                The team behind Balancer believes that building a searchable,
                interactive and user-friendly research tool for bipolar
                medications has the potential to improve the health and
                well-being of people with bipolar disorder.
              </div>
            </div>
          </div>
        </div>

        {/* Support Us section */}
        <div className="team-section flex w-full max-w-6xl flex-col items-center justify-center md:mt-28">
          <div className="text-3xl font-bold">Support Us</div>
          <div className="mt-5 flex flex-col items-center justify-center pl-56 pr-56 text-center text-lg text-gray-500">
            <div className="text-xl font-bold">
              Balancer is a not-for-profit, civic-minded, open-source project
              sponsored by
              <a
                href="https://codeforphilly.org/"
                className="underline"
                target="_blank"
              >
                {" "}
                Code for Philly
              </a>
              .
            </div>
            <div className="mt-5">
              We are currently seeking donations to fund the next phase of
              development. Your contribution will go towards website domains and
              hosting, helpdesk software and marketing efforts.
            </div>
          </div>

          <div className="mb-20 mt-5 flex flex-row flex-wrap">
            <a
              href="https://opencollective.com/code-for-philly/projects/balancer"
              target="_blank"
            >
              <button className="btnBlue mr-5 transition-transform focus:outline-none focus:ring focus:ring-blue-200">
                Donate Here
              </button>
            </a>
            <a href="mailto:balancerteam@codeforphilly.org">
              <button className="btnBlue transition-transform focus:outline-none focus:ring focus:ring-blue-200">
                Contact Us
              </button>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default About;

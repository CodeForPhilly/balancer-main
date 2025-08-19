//import Welcome from "../../components/Welcome/Welcome.tsx";
import Layout from "../Layout/Layout";
// import image from "./OIP.jpeg";
import image from "./OIP2.png";

function About() {
  return (
    <Layout>
      <div className="font_body mt-48  flex w-full flex-col items-center justify-center  rounded-md border bg-white p-4 px-8 ring-1 hover:ring-slate-300 md:max-w-6xl">
        {/* Making it easier to research bipolar medications */}
        <div className="flex w-full flex-col justify-center mb-20 md:mb-0">
          <div className="flex flex-row">
            <div className="flex flex-col justify-center md:w-full mr-10">
              <div className="mt-5 text-3xl font-bold">
                Making it easier to research bipolar medications
              </div>
              <div className="mt-5 text-lg text-gray-600">
                It can take two to 10 years—and three to 30 medications—for people with bipolar disorder to find the right medication combination. <span className="body_logo">Balancer</span> is designed to help prescribers speed up that process by making research faster and more accessible.
              </div>
            </div>
            <img src={image} alt="about image" className="hidden md:mt-10 md:block md:h-64 md:rounded-2xl"></img>
          </div>
        </div>
        {/* How Balancer works */}
        <div className="flex w-full flex-col justify-center md:mt-20 md:max-w-6xl mb-20 md:mb-0">
          <div className="mb-5 text-3xl font-bold">
            How <span>Balancer</span> works
          </div>
          <ul className="list-disc pl-5">
            <li className="mb-5">
              <span className="text-md font-bold">Medication Suggestions (rules-based):</span>
              <p className="text-gray-600 mt-2">When you enter patient characteristics, Balancer suggests first-line, second-line, and third-line options. The recommendations follow a consistent framework developed from interviews with psychiatrists, psychiatry residents, nurse practitioners, and other prescribers. This part is not powered by AI.</p>
            </li>
            <li className="mb-5">
              <span className="text-md font-bold">Explanations & Research (AI-assisted):</span>
              <p className="text-gray-600 mt-2">For each suggestion, you can click to see supporting journal articles. Here, Balancer uses AI to search our database of medical research and highlight relevant sources for further reading.</p>
            </li>
          </ul>
          <p className="text-gray-600 text-lg">Together, these features help prescribers get reliable starting points quickly—without replacing professional judgment.</p>
        </div>
        {/* Important disclaimer */}
        <div className="flex w-full flex-col justify-center md:mt-20 md:max-w-6xl mb-20 md:mb-0">
          <div className="text-3xl font-bold mb-5">
            Important disclaimer
          </div>
          <p className="text-gray-600">Balancer is a free, open-source research tool built by volunteers at Code for Philly. It is for licensed U.S. prescribers and researchers only.</p>
          <ul className="list-disc pl-5 mt-2">
            <li><p className="mt-2 text-gray-600">Balancer does <em>not</em> provide medical advice.</p></li>
            <li><p className="mt-2 text-gray-600">It does <em>not</em> determine treatment or replace clinical judgment.</p></li>
            <li><p className="mt-2 text-gray-600">Clinical decisions should always be based on the prescriber's expertise, knowledge of the patient, and official medical guidelines.</p></li>
          </ul>
        </div>
        {/* Our mission */}
        <div className="flex w-full flex-col justify-center md:mt-20 md:max-w-6xl mb-20 md:mb-0">
          <div className="text-3xl font-bold mb-5">
            Our mission
          </div>
          <p className="text-gray-600">Bipolar disorder affects approximately 5.7 million adult Americans <u>every year</u>. Delays in the correct diagnosis and proper treatment of bipolar disorder may result in social, occupational, and economic burdens, as well as an <u>increase in completed suicides</u>.</p>
          <p className="mt-2 text-gray-600">The team behind Balancer believes that building a searchable, interactive and user-friendly research tool for bipolar medications has the potential to improve the health and well-being of people with bipolar disorder.</p>
        </div>
        {/* Support Us section */}
        <div className="flex w-full flex-col items-center justify-center md:mt-28 md:max-w-6xl">
          <div className="text-3xl font-bold">Support Us</div>
          <div className="mt-5 flex flex-col items-center justify-center text-center text-lg text-gray-600 md:pl-48 md:pr-48">
            <div className="text-xl">
              <span className="body_logo">Balancer</span> is a not-for-profit, civic-minded, open-source project
              sponsored by{" "}
              <a
                href="https://codeforphilly.org/"
                className="underline hover:text-blue-600 hover:no-underline"
                target="_blank"
              >
                Code for Philly
              </a>
              .
            </div>
          </div>
          <div className="mb-20 mt-5 flex flex-row flex-wrap justify-center gap-4">
            <a href="https://www.flipcause.com/secure/cause_pdetails/MjMyMTIw" target="_blank">
              <button className="btnBlue transition-transform focus:outline-none focus:ring focus:ring-blue-200">
                Donate
              </button>
            </a>

            <a href="mailto:balancerteam@codeforphilly.org" target="_blank" >
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

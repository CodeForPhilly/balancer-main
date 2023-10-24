import Welcome from "../../components/Welcome/Welcome.tsx";
import Layout from "../Layout/Layout";

function About() {
  return (
    <Layout>
      <div className="flex w-full max-w-6xl flex-col items-center justify-center md:mt-28">
        <div className="text-5xl mt-20">Balancer</div>

        {/* Top section */}
        <div className="mt-10 top-section flex w-full max-w-6xl flex-col justify-center">
          <div className="text-3xl mt-5">A tool that makes it easier to research medications for bipolar disorder.</div>
          <div className="text-lg mt-5 text-gray-500">It can take two to 10 years—and three to 30 medications—for people with bipolar disorder to find the right medication combination. Balancer is designed to help physicians shorten this journey for their patients.</div>
          <div className="text-3xl mt-5">Get accurate, helpful information on bipolar medications fast</div>
          <div className="text-lg mt-5 text-gray-500">Powered by innovative AI technology, Balancer is a tool that aids in providing personalized medication recommendations for patients with bipolar disorder in any state, including mania, depression, hypomania and mixed. Our platform utilizes machine learning to give you the latest, most up-to-date information on medications and active clinical trials to treat bipolar disorder. </div>
          <div className="text-lg mt-5 text-gray-500">Balancer automates medication decision support by offering tailored medication recommendations and comprehensive risk-benefit assessments based on a patient's diagnosis, symptom severity, treatment goals and individual characteristics.  </div>
        </div>

        {/* Mission section */}
        <div className="mt-10 mission-section flex w-full max-w-6xl flex-col items-center justify-center md:mt-28">
          <div className="text-3xl">Our mission</div>
          <div className="flex flex-col justify-between w-full">
            <div className="text-lg mt-5 text-gray-500">
              Bipolar disorder affects approximately 5.7 million adult Americans
              <a href="https://www.dbsalliance.org/education/bipolar-disorder/bipolar-disorder-statistics/" className="underline" target="_blank"> every year</a>.
              Delays in the correct diagnosis and proper treatment of bipolar disorder may result in social, occupational, and economic burdens, as well as
              <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2796048/" className="underline" target="_blank"> an increase in completed suicides</a>.
            </div>
            <div className="text-lg mt-5 text-gray-500">
              The team behind Balancer believes that building a searchable, interactive and user-friendly research tool for bipolar medications has the potential to improve the health and well-being of people with bipolar disorder.
            </div>
          </div>
        </div>

        {/* Support Us section */}
        <div className="mt-10 team-section flex w-full max-w-6xl flex-col items-center justify-center md:mt-28">
          <div className="text-3xl">Support Us</div>
          <div className="text-lg mt-5 text-gray-500">
            Balancer is led by a passionate team of volunteer developers, coders, UX designers, data scientists and researchers. Our vision is to create digital tools that support physicians in choosing the most suitable medication for patients with bipolar disorder. We also aim to support patients in their journey to medication stability, enabling them to be more informed and therefore more involved in medication decision-making.
          </div>
          <div className="text-lg mt-5 text-gray-500">
            Balancer is a not-for-profit, civic-minded, open-source project sponsored by
            <a href="https://codeforphilly.org/" className="underline" target="_blank"> Code for Philly</a>
            . We are currently seeking donations to fund the next phase of development. Your contribution will go towards website domains and hosting, helpdesk software and marketing efforts.
          </div>

          <div className="flex flex-row flex-wrap mt-5 mb-20">
            <a href="https://opencollective.com/code-for-philly/projects/balancer" target="_blank">
              <button
                className="btnBlue transition-transform focus:outline-none focus:ring focus:ring-blue-200 mr-5"
              >
                Donate Here
              </button>
            </a>
            <a href="mailto:balancerteam@codeforphilly.org">
              <button
                className="btnBlue transition-transform focus:outline-none focus:ring focus:ring-blue-200"
              >
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

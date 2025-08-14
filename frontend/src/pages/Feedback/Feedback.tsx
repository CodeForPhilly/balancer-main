import FeedbackForm from "./FeedbackForm.tsx";
import Layout from "../Layout/Layout";

function Feedback() {
  return (
    <Layout>
      <div className="mt-20 flex w-full max-w-6xl flex-col items-center justify-center md:mt-28">
        <div className="mt-10">
          <h2 className="px-2 text-center font-quicksand text-2xl font-medium text-gray-800 md:mt-7 md:p-0 md:px-0 md:text-5xl">Feedback</h2>
          <p className="mx-auto mt-5 mb-10
          max-w-[100%] text-center font-satoshi text-log text-gray-800 sm:text-x; md:block">
            Leave feedback for the Balancer Team in the form below or send us a message directly at {" "}
            <a href="mailto:balancerteam@codeforphilly.org" className="underline hover:border-blue-600 hover:text-blue-600 hover:no-underline">
              balancerteam@codeforphilly.org
            </a>
            .
          </p>
          <FeedbackForm />
        </div>
      </div>
    </Layout>
  );
}

export default Feedback;

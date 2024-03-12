import FeedbackForm from "./FeedbackForm.tsx";
import Layout from "../Layout/Layout";

function Feedback() {
  return (
    <Layout>
      <div className="mt-20 flex w-full max-w-6xl flex-col items-center justify-center md:mt-28">
        <div className="mt-10">
          <h1 className="head_text"></h1>
          <h2 className="desc">Feedback</h2>
          <p className="mx-auto mt-5 hidden
          max-w-[100%] text-center font-satoshi text-log text-gray-400 sm:text-x; md:block">
            Leave feedback for the Balancer Team.
          </p>
          <FeedbackForm />
        </div>
      </div>
    </Layout>
  );
}

export default Feedback;

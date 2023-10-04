import FeedbackForm from "./FeedbackForm.tsx";
import Welcome from "../../components/Welcome/Welcome.tsx";
import Layout from "../Layout/Layout";

function Feedback() {
  return (
    <Layout>
      <div className="mt-20 flex w-full max-w-6xl flex-col items-center justify-center md:mt-28">
        <Welcome
          subHeader="Feedback"
          descriptionText="Leave feedback for the Balancer Team."
        />
        <FeedbackForm />
      </div>
    </Layout>
  );
}

export default Feedback;

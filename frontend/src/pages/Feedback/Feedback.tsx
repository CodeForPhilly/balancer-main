import FeedbackForm from "./FeedbackForm.tsx";
import Welcome from "../../components/Welcome/Welcome.tsx";
import Layout from "../Layout/Layout";

function Feedback() {
  return (
    <Layout>
      <Welcome
        subHeader="Feedback"
        descriptionText="Leave feedback for the Balancer Team."
      />
      <FeedbackForm />
    </Layout>
  );
}

export default Feedback;

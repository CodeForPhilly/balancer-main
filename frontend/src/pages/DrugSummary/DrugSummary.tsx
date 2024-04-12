import DrugSummaryForm from "./DrugSummaryForm.tsx";
import Layout from "../Layout/Layout";

function DrugLookup() {
  return (
    <Layout>
      {/* <div className="py-20"></div> */}
      {/* <Welcome
        subHeader="Drug Summary"
        descriptionText="Get a condensed summary for a clinical drug trial and/or study."
      /> */}
      <DrugSummaryForm />
    </Layout>
  );
}

export default DrugLookup;

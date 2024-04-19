import Layout from "../Layout/Layout";
import Welcome from "../../components/Welcome/Welcome";

function ListMeds () {
  return (
    <Layout>
      <div className="mt-24 mx-auto w-full max-w-6xl border border-red-600">
        <Welcome subHeader="Medications" descriptionText="Check out the benefits and risks of medications."/>
      </div>
    </Layout>
  )
}

export default ListMeds
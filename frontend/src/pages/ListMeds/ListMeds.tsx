import Layout from "../Layout/Layout";
import Welcome from "../../components/Welcome/Welcome";
import ErrorMessage from "../../components/ErrorMessage";
import { useMedications } from "./useMedications";

function ListMeds() {
  const { medications, errors } = useMedications();

  const medsList = medications.map((med) => {
    const benefitsList = med.benefits.split(", ").map((benefit, index) => {
      return (
        <li className="text-sm" key={index}>
          {benefit}
        </li>
      );
    });

    const risksList = med.risks.split(", ").map((risk, index) => {
      return (
        <li className="text-sm" key={index}>
          {risk}
        </li>
      );
    });

    return (
      <details>
        <summary className="w-fit font-semibold leading-6 text-gray-900 hover:cursor-pointer">
          {med.name}
        </summary>
        <div className="mb-5 ml-6 flex">
          <div className="flex-1">
            <h3 className="mb-4 mt-4 text-sm font-medium text-indigo-600">
              Benefits:
            </h3>
            <ul className="list-disc space-y-3 px-4">{benefitsList}</ul>
          </div>
          <div className="flex-1">
            <h3 className="mb-4 mt-4 text-sm font-medium text-indigo-600">
              Risks:
            </h3>
            <ul className="list-disc space-y-3 px-4">{risksList}</ul>
          </div>
        </div>
      </details>
    );
  });

  if (errors.length > 0) {
    return (
      <Layout>
        <div className="mt-32">
          <ErrorMessage errors={errors} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto mt-24 w-full max-w-6xl">
        <Welcome
          subHeader="Medications"
          descriptionText="Check out the benefits and risks of medications."
        />
        {medications.length > 0 ? (
          <div className="font_body mx-auto mt-0 mt-4 w-[90%] rounded-md border bg-white p-2 px-3 ring-1 hover:ring-slate-300 md:mt-0 md:mt-4 md:w-[75%] md:p-4 md:px-8">
            <div className="mb-6 space-y-4">{medsList}</div>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-center"></div>
        )}
      </div>
    </Layout>
  );
}

export default ListMeds;

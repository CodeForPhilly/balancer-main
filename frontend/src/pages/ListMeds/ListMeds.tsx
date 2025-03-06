import Layout from "../Layout/Layout";
import Welcome from "../../components/Welcome/Welcome";
import ErrorMessage from "../../components/ErrorMessage";
// import { MedData } from "./MedTypes";
import { useState, useEffect } from "react";
import { api } from "../../api/apiClient";

function ListMeds() {
  interface MedData {
    name: string;
    benefits: string;
    risks: string;
  }
  const [medications, setMedications] = useState<MedData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchMedications = async () => {
    try {
      const url = `${baseUrl}/v1/api/get_full_list_med`;

      const { data } = await api.get(url);

      data.sort((a: MedData, b: MedData) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        return 0;
      });

      setMedications(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErrors((prev) => [...prev, e.message]);
      } else {
        setErrors((prev) => [...prev, "An unknown error occurred"]);
      }
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

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

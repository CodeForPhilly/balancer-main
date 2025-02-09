import Layout from "../Layout/Layout";
import Welcome from "../../components/Welcome/Welcome";
import ErrorMessage from "../../components/ErrorMessage";
import { useState, useEffect } from "react";
import { api } from "../../api/apiClient";

interface Medication {
  id: number;
  name: string;
  benefits: string;
  risks: string;
}

interface MedRule {
  id: number;
  rule_type: string;
  history_type: string;
  reason: string;
  label: string;
  medication: Medication;
}

interface MedRulesResponse {
  status: string;
  count: number;
  results: MedRule[];
}

function ListMeds() {
  const [medRules, setMedRules] = useState<MedRule[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchMedRules = async () => {
    try {
      const url = `${baseUrl}/v1/api/medRules`;
      const { data } = await api.get<MedRulesResponse>(url);
      setMedRules(data.results);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErrors((prev) => [...prev, e.message]);
      } else {
        setErrors((prev) => [...prev, "An unknown error occurred"]);
      }
    }
  };

  useEffect(() => {
    fetchMedRules();
  }, []);

  const rulesList = medRules.map((rule) => {
    const benefitsList = rule.medication.benefits
      .split(", ")
      .map((benefit, index) => (
        <li className="text-sm" key={index}>
          {benefit}
        </li>
      ));

    const risksList = rule.medication.risks.split(", ").map((risk, index) => (
      <li className="text-sm" key={index}>
        {risk}
      </li>
    ));

    return (
      <details key={rule.id}>
        <summary className="w-fit font-semibold leading-6 text-gray-900 hover:cursor-pointer">
          {rule.medication.name} - {rule.label}
        </summary>
        <div className="mb-5 ml-6">
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-indigo-600">
              Rule Type:
            </h3>
            <p className="text-sm">{rule.rule_type}</p>
          </div>
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-indigo-600">
              Reason:
            </h3>
            <p className="text-sm">{rule.reason}</p>
          </div>
          <div className="flex">
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
          subHeader="Medication Rules"
          descriptionText="Check out the medication rules and their associated benefits and risks."
        />
        {medRules.length > 0 ? (
          <div className="font_body mx-auto mt-0 mt-4 w-[90%] rounded-md border bg-white p-2 px-3 ring-1 hover:ring-slate-300 md:mt-0 md:mt-4 md:w-[75%] md:p-4 md:px-8">
            <div className="mb-6 space-y-4">{rulesList}</div>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ListMeds;

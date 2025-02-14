import React, { useState, useEffect } from "react";
import Layout from "../Layout/Layout";
import Welcome from "../../components/Welcome/Welcome";
import ErrorMessage from "../../components/ErrorMessage";
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
  medications: Medication[];
  sources: any[];
  explanation: string | null;
}

interface MedRulesResponse {
  status: string;
  count: number;
  results: MedRule[];
}

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-600">
          Something went wrong. Please try refreshing the page.
        </div>
      );
    }
    return this.props.children;
  }
}

function RulesManager() {
  const [medRules, setMedRules] = useState<MedRule[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchMedRules = async () => {
      try {
        const url = `${baseUrl}/v1/api/medRules`;
        const { data } = await api.get<MedRulesResponse>(url);

        // Validate response structure
        if (!data || !Array.isArray(data.results)) {
          throw new Error("Invalid response format");
        }

        setMedRules(data.results);
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error ? e.message : "An unknown error occurred";
        setErrors((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedRules();
  }, [baseUrl]);

  const renderMedicationDetails = (medication: Medication | undefined) => {
    if (!medication) {
      return null;
    }

    return (
      <div key={medication.id} className="mb-6 border-t pt-4">
        <h4 className="mb-2 text-sm font-medium">{medication.name}</h4>
        <div className="flex flex-col md:flex-row">
          <div className="flex-1">
            <h5 className="mb-4 mt-4 text-sm font-medium text-indigo-600">
              Benefits:
            </h5>
            {medication.benefits ? (
              <ul className="list-disc space-y-3 px-4">
                {medication.benefits.split(", ").map((benefit, index) => (
                  <li
                    key={`${medication.id}-benefit-${index}`}
                    className="text-sm"
                  >
                    {benefit}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No benefits listed</p>
            )}
          </div>
          <div className="flex-1">
            <h5 className="mb-4 mt-4 text-sm font-medium text-indigo-600">
              Risks:
            </h5>
            {medication.risks ? (
              <ul className="list-disc space-y-3 px-4">
                {medication.risks.split(", ").map((risk, index) => (
                  <li
                    key={`${medication.id}-risk-${index}`}
                    className="text-sm"
                  >
                    {risk}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No risks listed</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRule = (rule: MedRule) => {
    if (!rule) return null;

    return (
      <details key={rule.id} className="mb-4">
        <summary className="w-fit cursor-pointer rounded-md bg-gray-50 p-3 font-semibold leading-6 text-gray-900 hover:bg-gray-100">
          {rule.label || "Unnamed Rule"}
        </summary>
        <div className="mt-4 space-y-4 px-4">
          <div>
            <h3 className="text-sm font-medium text-indigo-600">Rule Type:</h3>
            <p className="mt-1 text-sm">{rule.rule_type}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-indigo-600">Reason:</h3>
            <p className="mt-1 text-sm">{rule.reason}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-indigo-600">
              Medications:
            </h3>
            <div className="mt-2">
              {Array.isArray(rule.medications) &&
              rule.medications.length > 0 ? (
                rule.medications.map((med) => renderMedicationDetails(med))
              ) : (
                <p className="text-sm text-gray-500">
                  No medications associated with this rule
                </p>
              )}
            </div>
          </div>
        </div>
      </details>
    );
  };

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
    <ErrorBoundary>
      <Layout>
        <div className="mx-auto mt-24 w-full max-w-6xl">
          <Welcome
            subHeader="Medication Rules"
            descriptionText="Check out the medication rules and their associated benefits and risks."
          />
          <div className="mx-auto mt-8 w-full max-w-4xl rounded-lg border bg-white p-6 shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : medRules.length > 0 ? (
              <div className="space-y-4">
                {medRules.map((rule) => renderRule(rule))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-4">
                <span className="text-sm text-gray-500">
                  No medication rules found
                </span>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ErrorBoundary>
  );
}

export default RulesManager;

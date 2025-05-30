import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { handleRuleExtraction } from "../../api/apiClient";

interface Rule {
  rule: string;
  type: string;
  reason: string;
  medications: string[];
  source: string;
  chunk_number: number;
  chunk_text: string;
}

interface RuleExtractionData {
  rules: Rule[];
  texts: string;
  cited_texts: string;
}

const Insights: React.FC = () => {
  const [data, setData] = useState<RuleExtractionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const guid = params.get("guid") || "";

  useEffect(() => {
    fetchData();
  }, [guid]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await handleRuleExtraction(guid);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch rule extraction"
      );
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    return type === "EXCLUDE"
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";
  };

  if (loading) {
    return (
      <div className="h-full w-full font-quicksand flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading extracted rules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full font-quicksand">
        <h2 className="text-lg font-semibold mb-4 text-red-600">
          Error Loading Rules
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full font-quicksand overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Extracted Rules</h2>
        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {data ? (
        <div className="space-y-6">
          {/* Parsed Rules Section */}
          <div>
            <h3 className="text-md font-semibold mb-3 text-gray-800">
              Medication Rules ({data.rules.length})
            </h3>
            <div className="space-y-3">
              {data.rules.map((rule, index) => (
                <div
                  key={index}
                  className="border bg-blue-50 bg-opacity-50 border-sky-400 text-sm font-quicksand shadow-md rounded-lg p-2 relative"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {rule.rule}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(rule.type)}`}
                    >
                      {rule.type}
                    </span>
                  </div>

                  {rule.reason && (
                    <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                      {rule.reason}
                    </p>
                  )}

                  {rule.medications.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Medications:{" "}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.medications.map((med, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                          >
                            {med}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 🔍 View Source Text Section */}
                  {rule.chunk_text && (
                    <details className="mt-3 text-xs border border-gray-300 rounded p-2 bg-white text-gray-800">
                      <summary className="cursor-pointer text-blue-600 font-medium">
                        View Source
                        {/* View Source Chunk ({rule.source}) */}
                      </summary>
                      <div className="mt-2 whitespace-pre-wrap">
                        {rule.chunk_text}
                      </div>
                    </details>
                  )}

                  {/* <div className="mt-2">
                    <button
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("navigateToPdfPage", {
                            detail: { pageNumber: rule.chunk_number },
                          })
                        )
                      }
                      className="text-blue-500 underline text-xs hover:text-blue-700"
                    >
                      Jump to Page {rule.chunk_number}
                    </button>
                  </div> */}
                </div>
              ))}
            </div>
          </div>

          {/* JSON View */}
          {/* <details className="border border-gray-200 rounded-lg">
            <summary className="bg-gray-50 px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors font-medium">
              Raw JSON Response
            </summary>
            <div className="p-4 border-t border-gray-200">
              <pre className="bg-gray-900 text-green-400 rounded p-3 text-xs overflow-x-auto max-h-60 overflow-y-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </details> */}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No rule extraction data available.</p>
          <p className="text-sm mt-1">Click refresh to load data.</p>
        </div>
      )}
    </div>
  );
};

export default Insights;

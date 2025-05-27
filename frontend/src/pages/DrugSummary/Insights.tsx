import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { handleRuleExtraction } from "../../api/apiClient";

interface Rule {
  rule: string;
  type: string;
  reason: string;
  medications: string[];
}

interface RuleExtractionData {
  texts: string;
  cited_texts: string;
}

const Insights: React.FC = () => {
  const [extractedData, setExtractedData] = useState<RuleExtractionData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedRules, setParsedRules] = useState<Rule[]>([]);

  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const guid = params.get("guid") || "";

  useEffect(() => {
    fetchRuleExtraction();
  }, []);

  const fetchRuleExtraction = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await handleRuleExtraction(guid);
      setExtractedData(result);

      if (result.texts) {
        parseRulesFromText(result.texts);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch rule extraction"
      );
    } finally {
      setLoading(false);
    }
  };

  const parseRulesFromText = (text: string) => {
    const rules: Rule[] = [];

    let ruleMatches = text.match(/Rule \d+:[\s\S]*?(?=Rule \d+:|$)/g);

    if (!ruleMatches || ruleMatches.length === 0) {
      ruleMatches = text.match(/\d+\.\s*Rule:[\s\S]*?(?=\d+\.\s*Rule:|$)/g);
    }

    if (!ruleMatches || ruleMatches.length === 0) {
      ruleMatches = text.match(/\d+\.[\s\S]*?(?=\d+\.|$)/g);
    }

    if (ruleMatches && ruleMatches.length > 0) {
      ruleMatches.forEach((ruleText) => {
        let ruleMatch, typeMatch, reasonMatch, medicationsMatch;

        ruleMatch = ruleText.match(/(?:The )?rule(?:\s+is)?:?\s*([^.\n]+)/i);
        typeMatch = ruleText.match(
          /(?:The )?type(?:\s+of\s+rule)?(?:\s+is)?:?\s*"?([^".\n]+)"?/i
        );
        reasonMatch = ruleText.match(
          /(?:The )?reason(?:\s+is)?:?\s*([\s\S]*?)(?=(?:The )?medications?|$)/i
        );
        medicationsMatch = ruleText.match(
          /(?:The )?medications?(?:\s+for\s+this\s+rule)?(?:\s+are?)?:?\s*([^.\n]+)/i
        );

        if (!ruleMatch) {
          ruleMatch =
            ruleText.match(/Rule:\s*([^.\n]+)/i) ||
            ruleText.match(/^\d+\.\s*([^:\n]+)/);
        }

        if (!typeMatch) {
          typeMatch =
            ruleText.match(/Type:\s*"?([^".\n]+)"?/i) ||
            ruleText.match(/(EXCLUDE|INCLUDE)/i);
        }

        if (!reasonMatch) {
          reasonMatch = ruleText.match(
            /Reason:\s*([\s\S]*?)(?=Medications?|$)/i
          );
        }

        if (!medicationsMatch) {
          medicationsMatch = ruleText.match(/Medications?:\s*([^.\n]+)/i);
        }

        let ruleName = "";
        if (ruleMatch) {
          ruleName = ruleMatch[1].trim();
        } else {
          const contextMatch = ruleText.match(
            /(pregnancy|metabolic|cardiac|renal|thyroid|drug interaction|extrapyramidal)/i
          );
          if (contextMatch) {
            ruleName = contextMatch[1];
          }
        }

        let ruleType = "";
        if (typeMatch) {
          ruleType = typeMatch[1].trim().toUpperCase();
        }

        let reason = "";
        if (reasonMatch) {
          reason = reasonMatch[1].trim().replace(/\s+/g, " ");
        }

        let medications: string[] = [];
        if (medicationsMatch) {
          medications = medicationsMatch[1]
            .split(/[,;]/)
            .map((med) => med.trim())
            .filter((med) => med.length > 0);
        }

        if (ruleName || ruleType) {
          rules.push({
            rule: ruleName || "Unknown Rule",
            type: ruleType || "UNKNOWN",
            reason: reason,
            medications: medications,
          });
        }
      });
    }

    console.log("Parsed rules:", rules);
    setParsedRules(rules);
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
            onClick={fetchRuleExtraction}
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
          onClick={fetchRuleExtraction}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {extractedData ? (
        <div className="space-y-6">
          {/* Parsed Rules Section */}
          <div>
            <h3 className="text-md font-semibold mb-3 text-gray-800">
              Medication Rules ({parsedRules.length})
            </h3>
            <div className="space-y-3">
              {parsedRules.map((rule, index) => (
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
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {rule.reason}
                    </p>
                  )}

                  {rule.medications.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Medications:{" "}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.medications.map((med, medIndex) => (
                          <span
                            key={medIndex}
                            className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                          >
                            {med}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Raw Data Section - Collapsible */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="bg-gray-50 px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors font-medium">
              Raw Extracted Text
            </summary>
            <div className="p-4 border-t border-gray-200">
              <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {extractedData.texts}
              </div>
            </div>
          </details>

          {/* Cited Texts Section - Collapsible */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="bg-gray-50 px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors font-medium">
              Cited References
            </summary>
            <div className="p-4 border-t border-gray-200">
              <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {extractedData.cited_texts}
              </div>
            </div>
          </details>

          {/* JSON View - Collapsible */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="bg-gray-50 px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors font-medium">
              Raw JSON Response
            </summary>
            <div className="p-4 border-t border-gray-200">
              <pre className="bg-gray-900 text-green-400 rounded p-3 text-xs overflow-x-auto max-h-60 overflow-y-auto">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            </div>
          </details>
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

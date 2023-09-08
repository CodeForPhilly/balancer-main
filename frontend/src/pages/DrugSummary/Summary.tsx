import { useEffect, useState } from "react";

import HourglassSpinner from "../../components/HourglassSpinner/HourglassSpinner";

interface SummaryProps {
  errorMessage: string;
  isLoading: boolean;
  summary: string;
}

function Summary({ errorMessage, isLoading, summary }: SummaryProps) {
  const [minLoading, setMinLoading] = useState(false);

  useEffect(() => {
    if (isLoading && !errorMessage) {
      // only show loader after 200ms to avoid flash of loader before error message
      setTimeout(() => {
        setMinLoading(true);
      }, 200);
    } else {
      setMinLoading(false);
    }
  }, [isLoading, errorMessage]);

  if (errorMessage) {
    return <p className="text-center">{errorMessage}</p>;
  }

  if (minLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <HourglassSpinner />
      </div>
    );
  }

  if (!isLoading && summary) {
    return (
      <section className="w-6/12">
        <h2 style={{ fontSize: "2rem" }} className="my-6 text-center font-bold">
          Summary
        </h2>
        <p>{summary}</p>
      </section>
    );
  }
}

export default Summary;

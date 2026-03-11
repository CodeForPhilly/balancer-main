import { useState, useEffect } from "react";
import { fetchVersion } from "../../api/apiClient";

type VersionProps = {
  /** Text before the version number (e.g. "Version " or " Version ") */
  prefix?: string;
  /** Rendered when version is loading or failed (e.g. " —") */
  fallback?: React.ReactNode;
  /** Optional class name for the wrapper element */
  className?: string;
  /** Wrapper element (span for inline, p for block) */
  as?: "span" | "p";
};

function Version({
  prefix = "Version ",
  fallback = null,
  className,
  as: Wrapper = "span",
}: VersionProps) {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    fetchVersion()
      .then((data) => setVersion(data.version))
      .catch(() => setVersion(null));
  }, []);

  const content = version != null ? prefix + version : fallback;
  if (content === null || content === undefined) {
    return null;
  }

  return <Wrapper className={className}>{content}</Wrapper>;
}

export default Version;

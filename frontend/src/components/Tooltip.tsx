import React, { useId, useState } from "react";

interface TooltipProps {
  text: string; // You can adjust the type based on your actual use case
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  return (
    <span
      role="button"
      tabIndex={0}
      className="tooltip-container"
      aria-label="More information"
      aria-describedby={isVisible ? tooltipId : undefined}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setIsVisible(false);
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIsVisible(true);
        }
      }}
    >
      {children}
      {isVisible && (
        <span id={tooltipId} role="tooltip" className="tooltip">
          {text}
        </span>
      )}
    </span>
  );
};

export default Tooltip;

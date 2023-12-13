import React, { useState } from "react";

interface TooltipProps {
  text: string; // You can adjust the type based on your actual use case
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisiable, setIsVisiable] = useState(false);
  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setIsVisiable(true)}
      onMouseLeave={() => setIsVisiable(false)}
    >
      {children}
      {isVisiable && <div className="tooltip">{text}</div>}
    </div>
  );
};

export default Tooltip;

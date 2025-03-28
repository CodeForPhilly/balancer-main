import "./TypingAnimation.css";

const TypingAnimation = () => {
  return (
    <div className="flex flex-row gap-2">
      <div className="w-2 h-2 rounded-full bg-blue-300 animate-bounce [animation-delay:.7s]"></div>
      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:.3s]"></div>
      <div className="w-2 h-2 rounded-full bg-blue-700 animate-bounce [animation-delay:.7s]"></div>
    </div>
  );
};

export default TypingAnimation;

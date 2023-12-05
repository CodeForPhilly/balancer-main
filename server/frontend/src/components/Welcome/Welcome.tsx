interface WelcomeProps {
  subHeader?: string;
  descriptionText?: string;
}

function Welcome({
  subHeader = "Designed to assist prescribers",
  descriptionText,
}: WelcomeProps) {
  return (
    <div className="mt-10">
      <h1 className="head_text"></h1>
      {subHeader && <h2 className="desc">{subHeader}</h2>}
      {descriptionText && <p className="desc1">{descriptionText}</p>}
    </div>
  );
}

export default Welcome;

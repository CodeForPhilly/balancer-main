import { HelpElement } from "./helpData";

function HelpCard({
  title = "Error: No title provided",
  paragraph = "Error: No paragraph provided",
  Icon,
}: HelpElement) {
  return (
    // <div className="flex h-72 w-full max-w-6xl flex-col items-center justify-center rounded-xl border-2 border-blue-100 bg-neutral-50 px-4 shadow-md md:mt-28">
    <div className="flex h-72 w-full min-w-[280px] max-w-6xl flex-col items-center justify-center rounded-xl border-2 border-blue-100 bg-neutral-50 px-4 shadow-md md:mt-28">
      <div className="flex h-full flex-col items-center">
        {Icon && (
          <div className="mt-6 h-24 w-24">
            <Icon />
          </div>
        )}
        <div className="mt-6 flex flex-col">
          <h1 className="py-2 text-center text-black">{title}</h1>
          <p className="text-center font-satoshi text-sm text-gray-600">
            {paragraph}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HelpCard;

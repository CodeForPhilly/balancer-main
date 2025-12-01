import React, {
  useState,
  useRef,
  ChangeEvent,
  KeyboardEvent,
  FocusEvent,
} from "react";

import { FaRegTimesCircle } from "react-icons/fa";

type ChipsInputProps = {
  suggestions: string[];
  value: string[];
  onChange: (chips: string[]) => void;
  placeholder?: string;
  label?: string;
};

const ChipsInput: React.FC<ChipsInputProps> = ({
  suggestions,
  value,
  onChange,
  placeholder = "Type to add...",
  label = "Select Items",
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (e.target === inputRef.current) {
      setInputFocused(true);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (item) =>
      item.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(item)
  );

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const nextFocusTarget = e.relatedTarget as HTMLElement | null;

    // If the next focused element is still within our container, don't blur
    if (nextFocusTarget && e.currentTarget.contains(nextFocusTarget)) {
      return;
    }

    // Delay so blur doesn't happen before select click
    setTimeout(() => setInputFocused(false), 150);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);
  };

  const handleSuggestionClick = (selected: string) => {
    onChange([...value, selected]);
    setInputValue("");
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      onChange(value.slice(0, -1));
      setInputValue("");
    } else if (
      (e.key === " " ||
        e.key === "Tab" ||
        e.key === "Enter" ||
        e.key === ",") &&
      inputValue.trim() !== ""
    ) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const handleRemoveChip = (chip: string) => {
    onChange(value.filter((c) => c !== chip));
    setInputValue("");
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <div
        className="flex flex-wrap items-center gap-1 border rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-blue-400 bg-white"
        onFocus={handleFocus}
        onClick={() => inputRef.current?.focus()}
        onBlur={handleBlur}
        tabIndex={-1}
      >
        {value.map((chip, index) => (
          <div
            key={index}
            className="flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
          >
            {chip}
            <button
              type="button"
              onClick={() => handleRemoveChip(chip)}
              className="ml-1 text-blue-600 hover:text-red-600"
            >
              <FaRegTimesCircle />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[100px] p-1 outline-none text-sm"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyUp}
          placeholder={placeholder}
          aria-label={label}
        />
      </div>

      {inputFocused && filteredSuggestions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border rounded shadow-lg z-10">
          {filteredSuggestions.map((item, idx) => (
            <li
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(item)
              }}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChipsInput;
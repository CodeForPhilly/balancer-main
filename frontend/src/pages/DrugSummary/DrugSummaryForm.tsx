import React from "react";
import "../../components/Header/chat.css";
// React Hooks
import { useState, useEffect, useRef } from "react";
// import paperclip from "../../assets/paperclip.svg";
import { handleSendDrugSummary, handleClickDrugSummary } from "../../api/apiClient.ts";
import { ChatMessageItem, SearchResult } from "./type";
// Reuse components
import ParseStringWithLinks from "../../services/parsing/ParseWithSource.tsx";
import { useLocation } from "react-router-dom";
import PDFViewer from "./PDFViewer";

// JavaScript function that returns JSX:  "React functional component"
const DrugSummaryForm = () => {
  
  // State is updated whenever the input changes
  const [inputValue, setInputValue] = useState("");
  const [inputHeight, setInputHeight] = useState(50); // Initial height in pixels
  const [chatLog, setChatLog] = useState<ChatMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  // Access and manipulate DOM (Document Object Model) elements
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollToBottomRef = useRef<HTMLDivElement | null>(null);
  const maxInputHeight = 150; // Maximum height in pixels

  // Run code at specific points in the component's lifecycle
  useEffect(() => {
    if (chatContainerRef.current) {
      const chatContainer = chatContainerRef.current;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatLog]);

  useEffect(() => {
    if (scrollToBottomRef.current) {
      scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog]);

  // Forms and user interaction: Form submission 
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams(location.search);
    const guid = params.get("guid") || ``;

    const newMessage = {
      message: inputValue,
      type: "user",
    };

    setChatLog((prevChatLog) => [...prevChatLog, newMessage]);
    setInputValue("");
    setInputHeight(50); // Reset input height
    setIsLoading(true);

    try {
      // Integrate component with the backend
      const response = await handleSendDrugSummary(inputValue, guid);
      console.log("API Response:", response);

      if (
        response &&
        typeof response === "object" &&
        "llm_response" in response
      ) {
        const message: SearchResult = response;
        console.log("Message object:", message);

        setChatLog((prevChatLog) => [
          ...prevChatLog,
          {
            type: "bot",
            message: message,
          },
        ]);
      } else {
        console.error("Invalid response format:", response);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        {
          type: "bot",
          message: {
            question: inputValue,
            llm_response:
              "I'm sorry, I encountered an error while processing your message. Please try again later.",
            embeddings_info: [],
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleClick = async () => {

    const params = new URLSearchParams(location.search);
    const guid = params.get("guid") || ``;

    setIsLoading(true);

    try {

      const response = await handleClickDrugSummary(guid);

      console.log("API Response:", response);

      setChatLog((prevChatLog) => [...prevChatLog, {type: "bot", message: response['texts']}]);
      setChatLog((prevChatLog) => [...prevChatLog, {type: "bot", message: response['cited_texts']}]);

    } catch (error) {

      console.error("Error:", error);

    } finally {
      // Ensure isLoading is set to false whether the API call success or fails
      setIsLoading(false);
    }
  

  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default Enter behavior
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault(); // Prevent form submission on Shift + Enter
      setInputHeight((prevHeight) => {
        const newHeight = Math.min(prevHeight + 20, maxInputHeight); // Increase by 20px, up to max height
        return newHeight;
      });
    }
  };
  // JavaScript function that returns JSX:  "React functional component"

  return (
    <>
      <div className="mx-auto  min-h-screen w-full  flex-grow flex overflow-y-auto border">
        <div className=" mb-4">
          <PDFViewer />
        </div>
        <div>
          <div className=" w-[808px] ">
            <div
              ref={chatContainerRef}
              id="chat_container"
              className="relative bottom-0  top-0 mt-10 flex h-[calc(100vh-210px)] flex-col overflow-y-auto border-t p-2"
            >
              {/* Conditionally render components */}
              {chatLog.length === 0 ? (
                <>
                  <div className="flex  flex-col gap-4 p-3">
                    {/* Apply Tailwind CSS classes  */}
                    <div className="max-h-[100%] rounded-lg border-2 bg-stone-50 p-2 text-sky-950">
                      You can ask about the content on this page.
                    </div>
                    <div className="max-h-[100%]  rounded-lg border-2 bg-stone-50 p-2 text-sky-950">
                      Or questions in general.
                    </div>
                  </div>
                </>
              ) : (
                chatLog.map((message, index) => (
                  <div key={index} className="flex flex-col gap-4">
                    <div
                      className={`${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      } p-2`}
                    >
                      <div
                        className={`${
                          message.type === "user"
                            ? "border-2  font-quicksand text-neutral-600"
                            : "border-2 bg-stone-50 font-quicksand text-sky-950"
                        } rounded-lg p-2`}
                      >
                        {typeof message.message === "string" ? (
                          message.message
                        ) : (
                          // Components can be reused
                          <ParseStringWithLinks
                            text={message.message.llm_response}
                            chunkData={message.message.embeddings_info}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="ml-8 flex h-3 items-center justify-start">
            {isLoading && (
              <div key={chatLog.length} className="flex justify-between">
                <div className="items-center justify-center p-1">
                  <span className="thinking">Let me think</span>
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="fixed bottom-0 flex  w-[808px]  bg-white p-5"
          >
            <div className="relative flex w-full items-center">
              <textarea
                className="w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 resize-none"
                placeholder="Talk to me..."
                value={inputValue}
                style={{ height: `${inputHeight}px` }}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              ></textarea>
              {/* <button
                type="button"
                className="absolute left-0 ml-2"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                <img src={paperclip} alt="Upload" className="h-6" />
              </button> */}
            </div>
            <div className="ml-5 flex items-center justify-between">
              <button
                type="submit"
                className=" h-12 rounded-xl border bg-blue-500 px-3 py-1.5 font-satoshi  text-white hover:bg-blue-400"
              >
                Send
              </button>
            </div>
          </form>
          <div className="ml-5 flex items-center justify-between">
              <button
                onClick={handleClick}
                className=" h-12 rounded-xl border bg-blue-500 px-3 py-1.5 font-satoshi  text-white hover:bg-blue-400"
              >
                Extract Medication Rules
              </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default DrugSummaryForm;

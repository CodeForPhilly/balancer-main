import React from "react";
import "../../components/Header/chat.css";
import { useState, useEffect, useRef } from "react";
import { handleSendDrugSummary } from "../../api/apiClient.ts";
import { ChatMessageItem, SearchResult } from "./type";
import ParseStringWithLinks from "../../services/parsing/ParseWithSource.tsx";
import { useLocation } from "react-router-dom";
import PDFViewer from "./PDFViewer";

const DrugSummaryForm = () => {
  const [inputValue, setInputValue] = useState("");
  const [inputHeight, setInputHeight] = useState(50);
  const [chatLog, setChatLog] = useState<ChatMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPDF, setHasPDF] = useState(false); // New state to track PDF availability
  const location = useLocation();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollToBottomRef = useRef<HTMLDivElement | null>(null);
  const maxInputHeight = 150;

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

  // Check if PDF is available on component mount based on guid parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const guid = params.get("guid");
    // If guid exists and is not empty, we should have a PDF
    setHasPDF(!!guid);
  }, [location.search]);

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
    setInputHeight(50);
    setIsLoading(true);

    try {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setInputHeight((prevHeight) => {
        const newHeight = Math.min(prevHeight + 20, maxInputHeight);
        return newHeight;
      });
    }
  };

  return (
    <div className="flex h-full w-full justify-center">
      {/* PDF Viewer - Only show if hasPDF is true */}
      {hasPDF && (
        <div className="w-1/2 h-full">
          <PDFViewer />
        </div>
      )}

      {/* Chat Section - Full width if no PDF, otherwise 50% */}
      <div className={`${hasPDF ? "w-1/2" : "w-1/2"} h-full flex flex-col`}>
        {/* Chat Messages Container */}
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto">
          {chatLog.length === 0 ? (
            <div className="flex flex-col gap-4 p-3 font-quicksand">
              <div className="max-w-[310px] rounded-lg border-2 bg-stone-50 p-2 text-sky-950">
                You can ask about the content on this page.
              </div>
              <div className="max-w-[190px] rounded-lg border-2 bg-stone-50 p-2 text-sky-950">
                Or questions in general.
              </div>
            </div>
          ) : (
            chatLog.map((message, index) => (
              <div key={index} className="flex flex-col gap-4">
                <div
                  className={`${
                    message.type === "user" ? "justify-end" : "justify-start"
                  } p-2`}
                >
                  <div
                    className={`${
                      message.type === "user"
                        ? "border-2 font-quicksand text-neutral-600"
                        : "border-2 bg-stone-50 font-quicksand text-sky-950"
                    } rounded-lg p-2`}
                  >
                    {typeof message.message === "string" ? (
                      message.message
                    ) : (
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
          <div ref={scrollToBottomRef} />

          {/* Loading Indicator */}
          {isLoading && (
            <div className="ml-8 flex justify-start">
              <div className="items-center justify-center p-1">
                <span className="thinking">Let me think</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form - Fixed at bottom */}
        <form onSubmit={handleSubmit} className="p-3 font-quicksand mt-auto ">
          <div className="flex items-center justify-center relative">
            <textarea
              className="w-full rounded-full border border-gray-300 py-3 pl-10 pr-10"
              placeholder="Talk to me..."
              value={inputValue}
              style={{ height: `${inputHeight}px` }}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            ></textarea>
            <button
              type="submit"
              className="absolute right-5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 hover:bg-blue-400"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DrugSummaryForm;

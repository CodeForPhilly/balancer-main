import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "../../components/Header/chat.css";
import { handleSendDrugSummaryStream } from "../../api/apiClient.ts";
import { ChatMessageItem } from "./type";
import ParseStringWithLinks from "../../services/parsing/ParseWithSource.tsx";
import PDFViewer from "./PDFViewer";
import { useGlobalContext } from "../../../src/contexts/GlobalContext.tsx";
import Insights from "./Insights";

const DrugSummaryForm = () => {
  const { showMetaPanel } = useGlobalContext();
  const [inputValue, setInputValue] = useState("");
  const [inputHeight, setInputHeight] = useState(50);
  const [chatLog, setChatLog] = useState<ChatMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasPDF, setHasPDF] = useState(false);
  const [streamingMessageIndex, setStreamingMessageIndex] = useState<
    number | null
  >(null);
  const showChat = true;
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollToBottomRef = useRef<HTMLDivElement | null>(null);
  const maxInputHeight = 150;
  const chatLogRef = useRef<ChatMessageItem[]>([]);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const guid = params.get("guid") || "";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatLog]);

  useEffect(() => {
    if (scrollToBottomRef.current) {
      scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog]);

  useEffect(() => {
    chatLogRef.current = chatLog;
  }, [chatLog]);

  useEffect(() => setHasPDF(!!guid), [guid]);

  useEffect(() => {
    if (!isStreaming && !isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming, isLoading]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim() || isLoading || isStreaming) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setInputHeight(50);
    setIsLoading(true);
    setIsStreaming(true);

    const newUserMessage = { message: userMessage, type: "user" as const };
    const newBotMessage = {
      type: "bot" as const,
      message: { question: userMessage, llm_response: "", embeddings_info: [] },
    };

    setChatLog((prev) => {
      const updated = [...prev, newUserMessage, newBotMessage];
      setStreamingMessageIndex(updated.length - 1);
      return updated;
    });

    try {
      await handleSendDrugSummaryStream(userMessage, guid, {
        onContent: async (content) => {
          const updated = [...chatLogRef.current];
          const index = updated.length - 1;
          const msg = updated[index];
          if (msg?.type === "bot" && typeof msg.message === "object") {
            msg.message.llm_response += content;
          }

          setChatLog(updated);
          chatLogRef.current = updated;
        },

        onComplete: (data) => {
          if (data.embeddings_info?.length) {
            setChatLog((prev) => {
              const updated = [...prev];
              const index = updated.length - 1;
              const msg = updated[index];
              if (msg?.type === "bot" && typeof msg.message === "object") {
                msg.message.embeddings_info = data.embeddings_info;
              }
              return updated;
            });
          }
          setIsStreaming(false);
          setIsLoading(false);
          setStreamingMessageIndex(null);
        },

        onError: () => {
          setChatLog((prev) => {
            const updated = [...prev];
            const index = updated.length - 1;
            const msg = updated[index];
            if (msg?.type === "bot" && typeof msg.message === "object") {
              msg.message.llm_response =
                "I'm sorry, I encountered an error while processing your message. Please try again later.";
            }
            return updated;
          });
          setIsStreaming(false);
          setIsLoading(false);
          setStreamingMessageIndex(null);
        },

        onMetadata: (metadata) => console.log("Stream metadata:", metadata),
      });
    } catch (error) {
      console.error("Error starting stream:", error);
      setChatLog((prev) => {
        const updated = [...prev];
        const index = updated.length - 1;
        const msg = updated[index];
        if (msg?.type === "bot" && typeof msg.message === "object") {
          msg.message.llm_response =
            "I'm sorry, I encountered an error while processing your message. Please try again later.";
        }
        return updated;
      });
      setIsStreaming(false);
      setIsLoading(false);
      setStreamingMessageIndex(null);
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
      setInputHeight((h) => Math.min(h + 20, maxInputHeight));
    }
  };

  const visiblePanels = [
    hasPDF ? "pdf" : null,
    showChat ? "chat" : null,
    showMetaPanel ? "meta" : null,
  ].filter(Boolean);

  const panelCount = visiblePanels.length;

  const panelWidthClass =
    panelCount === 3 ? "w-1/3" : panelCount === 2 ? "w-1/2" : "w-full";

  return (
    <div className="flex h-full w-full justify-center">
      {hasPDF && (
        <div className={`${panelWidthClass} h-full`}>
          <PDFViewer key={guid} />
        </div>
      )}
      <div className={`${panelWidthClass} h-full flex flex-col p-2`}>
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto">
          {chatLog.length === 0 ? (
            <div className="flex flex-col gap-4 p-3 font-quicksand">
              <div className="max-w-[310px] border bg-blue-50 bg-opacity-50 border-sky-400 text-sm font-quicksand shadow-md rounded-lg p-2 relative">
                You can ask about the content on this page.
              </div>
              <div className="max-w-[190px] border bg-blue-50 bg-opacity-50 border-sky-400 text-sm font-quicksand shadow-md rounded-lg p-2 relative">
                Or questions in general.
              </div>
            </div>
          ) : (
            chatLog.map((message, index) => (
              <div key={index} className="flex flex-col gap-4 p-2">
                {message.type === "user" ? null : (
                  <div className=" flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-bold text-sm font-quicksand text-sky-950">
                        Balancer
                      </span>
                    </div>
                  </div>
                )}
                <div
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`${
                      message.type === "user"
                        ? "border border-black text-sm font-quicksand shadow-md"
                        : "border bg-blue-50 bg-opacity-50 border-sky-400 text-sm font-quicksand shadow-md"
                    } rounded-lg p-2 relative`}
                  >
                    {typeof message.message === "string" ? (
                      message.message
                    ) : (
                      <>
                        <ParseStringWithLinks
                          text={message.message.llm_response}
                          chunkData={message.message.embeddings_info}
                        />

                        {streamingMessageIndex === index &&
                          isStreaming &&
                          message.message.llm_response.length === 0 && (
                            <div className="flex justify-start">
                              <div className="items-center justify-center p-1">
                                <span className="thinking  bg-blue-50 bg-opacity-50 text-sm font-quicksand">
                                  Let me think
                                </span>
                              </div>
                            </div>
                          )}

                        {streamingMessageIndex === index &&
                          isStreaming &&
                          message.message.llm_response.length > 0 && (
                            <div className="absolute bottom-1 right-2 flex space-x-1">
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                              <div
                                className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                              <div
                                className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                                style={{ animationDelay: "0.4s" }}
                              ></div>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-3 font-quicksand mt-8 bg-gray-100 rounded-2xl shadow-inner">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative flex items-center border border-gray-300 rounded-xl bg-white shadow-sm px-4 py-3">
              <textarea
                ref={textareaRef}
                placeholder="Ask the document a question..."
                className="w-full resize-none bg-transparent outline-none text-sm font-quicksand placeholder-gray-500"
                rows={1}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                style={{ height: `${inputHeight}px`, maxHeight: "150px" }}
              />
            </div>

            <div className="text-xs text-gray-500 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span>Balancer 1.0</span>
                <span>•</span>
                <span>
                  {inputValue.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
      {showMetaPanel && (
        <div
          className={`${panelWidthClass} h-full bg-white border-l border-sky-200 p-4 shadow-inner`}
        >
          <Insights />
        </div>
      )}
    </div>
  );
};

export default DrugSummaryForm;

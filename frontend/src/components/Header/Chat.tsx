import React from "react";
import { Link } from "react-router-dom";
import "../../components/Header/chat.css";
import { useState, useEffect, useRef } from "react";
import TypingAnimation from "./components/TypingAnimation";
import ErrorMessage from "../ErrorMessage";
import axios from "axios";
import {
  FaPlus,
  FaTimes,
  FaComment,
  FaComments,
  FaPills,
  FaLightbulb,
  FaArrowCircleDown,
  FaExpandAlt,
  FaExpandArrowsAlt,
} from "react-icons/fa";
import { sendAssistantMessage } from "../../api/apiClient";

export interface ChatLogItem {
  is_user: boolean;
  content: string;
  timestamp: string; // EX: 2025-01-16T16:21:14.981090Z
}

// Keep interface for backward compatibility with existing imports
export interface Conversation {
  title: string;
  messages: ChatLogItem[];
  id: string;
}

interface ChatDropDownProps {
  showChat: boolean;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
}

const Chat: React.FC<ChatDropDownProps> = ({ showChat, setShowChat }) => {
  const CHATBOT_NAME = "JJ";
  const [inputValue, setInputValue] = useState("");
  const [currentMessages, setCurrentMessages] = useState<ChatLogItem[]>([]);
  const [currentResponseId, setCurrentResponseId] = useState<
    string | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Session storage functions for conversation management
  const saveConversationToStorage = (messages: ChatLogItem[], responseId?: string) => {
    const conversationData = {
      messages,
      responseId,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem('currentConversation', JSON.stringify(conversationData));
  };

  const loadConversationFromStorage = () => {
    const stored = sessionStorage.getItem('currentConversation');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored conversation:', error);
      }
    }
    return null;
  };

  const suggestionPrompts = [
    "What are the side effects of Latuda?",
    "Why is cariprazine better than valproate for a pregnant patient?",
  ];
  const refreshPrompts = [
    "Risks associated with Lithium.",
    "What medications could cause liver issues?",
  ];
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [bottom, setBottom] = useState(false);

  // Load conversation from sessionStorage on component mount
  useEffect(() => {
    const storedConversation = loadConversationFromStorage();
    if (storedConversation) {
      setCurrentMessages(storedConversation.messages || []);
      setCurrentResponseId(storedConversation.responseId);
    }
  }, []);

  // Save conversation to sessionStorage when component unmounts
  useEffect(() => {
    return () => {
      if (currentMessages.length > 0) {
        saveConversationToStorage(currentMessages, currentResponseId);
      }
    };
  }, [currentMessages, currentResponseId]);

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const bottom =
      target.scrollHeight - Math.round(target.scrollTop) ===
      target.clientHeight;
    setBottom(bottom);
  };

  const [expandChat, setExpandChat] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      const chatContainer = chatContainerRef.current;
      // Use setTimeout to ensure the new message has been rendered
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setBottom(
          chatContainer.scrollHeight - chatContainer.scrollTop ===
            chatContainer.clientHeight,
        );
      }, 0);
    }
  }, [currentMessages]);

  const scrollToBottom = (element: HTMLElement) =>
    element.scroll({ top: element.scrollHeight, behavior: "smooth" });

  const handleScrollDown = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    const element = document.getElementById("inside_chat");

    element
      ? scrollToBottom(element)
      : console.error("Element with id 'inside_chat' not found", element);
  };

  const handleSubmit = async (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>,
    suggestion?: string,
  ) => {
    event.preventDefault();

    const messageContent = (inputValue || suggestion) ?? "";
    if (!messageContent.trim()) return;

    const newMessage = {
      content: messageContent,
      is_user: true,
      timestamp: new Date().toISOString(),
    };

    try {
      setIsLoading(true);
      setError(null);

      // Add user message to current conversation
      const updatedMessages = [...currentMessages, newMessage];
      setCurrentMessages(updatedMessages);
      
      // Save user message immediately to prevent loss
      saveConversationToStorage(updatedMessages, currentResponseId);

      // Call assistant API with previous response ID for continuity
      const data = await sendAssistantMessage(
        messageContent,
        currentResponseId,
      );

      // Create assistant response message
      const assistantMessage = {
        content: data.response_output_text,
        is_user: false,
        timestamp: new Date().toISOString(),
      };

      // Update messages and store new response ID for next message
      const finalMessages = [...updatedMessages, assistantMessage];
      setCurrentMessages(finalMessages);
      setCurrentResponseId(data.final_response_id);
      
      // Save conversation to sessionStorage
      saveConversationToStorage(finalMessages, data.final_response_id);
    } catch (error) {
      console.error("Error handling message:", error);
      let errorMessage = "Error submitting message";
      if (error instanceof Error) {
        errorMessage = error.message;
        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          errorMessage = error.response.data.error;
        }
      }
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
      setInputValue("");
    }
  };

  useEffect(() => {
    if (showChat) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;

        const entry = entries[0];

        const target = entry.target as HTMLElement;

        if (target) {
          const bottom =
            target.scrollHeight - Math.round(target.scrollTop) ===
            target.clientHeight;
          setBottom(bottom);
        }
      });

      const currentContainer = chatContainerRef.current;
      if (currentContainer) {
        resizeObserver.observe(currentContainer);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [showChat]);

  return (
    <>
      {showChat ? (
        <div
          className={`show_chat ring-slate-1000/10 shadow ${expandChat ? "full-screen" : "windowed"}`}
        >
          <div
            id="chat_container"
            className=" mx-auto flex h-full  flex-col overflow-auto rounded "
          >
            <div className="chat_top_nav">
              <div className="truncate mx-2 font-semibold">
                <FaComments className="chatbot_icon" />
                <span className="chatbot_name">Ask {CHATBOT_NAME}</span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setCurrentMessages([]);
                    setCurrentResponseId(undefined);
                    sessionStorage.removeItem('currentConversation');
                  }}
                  className="flex items-center justify-center"
                  title="New Conversation"
                >
                  <FaPlus className="chat_icon" />
                </button>

                <button
                  onClick={() => setExpandChat((prevState) => !prevState)}
                  className="flex items-center justify-center"
                >
                  {expandChat ? (
                    <FaExpandAlt className="chat_icon" />
                  ) : (
                    <FaExpandArrowsAlt className="chat_icon" />
                  )}
                </button>

                <button
                  className="delete flex items-center justify-center"
                  onClick={() => setShowChat(false)}
                >
                  <FaTimes className="chat_icon" />
                </button>
              </div>
            </div>
            <div
              id="inside_chat"
              onScroll={handleScroll}
              className="inside_chat"
              style={{ scrollbarWidth: "thin", scrollBehavior: "smooth" }}
              ref={chatContainerRef}
            >
              <button
                id="scroll_down"
                className="scroll_down animate-bounce"
                onClick={handleScrollDown}
                style={{ visibility: bottom ? "hidden" : "visible" }}
              >
                <FaArrowCircleDown />
              </button>
              <div className="chat_intro">
                {currentMessages.length === 0 ? (
                  <>
                    <div className="chat_bubble chat_bubble_header">
                      <h5>Hi there, I'm {CHATBOT_NAME}!</h5>
                      <p>
                        You can ask me questions about your uploaded documents.
                        I'll search through them to provide accurate, cited
                        answers.
                      </p>
                      <Link to="/data-sources" className="chat_link">
                        Learn more about my sources.
                      </Link>
                    </div>
                    <div className="chat_bubble chat_bubble_header" style={{ 
                      backgroundColor: '#fef3c7', 
                      border: '1px solid #f59e0b', 
                      marginTop: '10px' 
                    }}>
                      <h6 style={{ color: '#92400e', fontWeight: 'bold', marginBottom: '8px' }}>
                        ⚠️ IMPORTANT NOTICE
                      </h6>
                      <p style={{ 
                        fontSize: '0.85em', 
                        color: '#92400e', 
                        lineHeight: '1.4',
                        margin: '0'
                      }}>
                        Balancer is NOT configured for use with Protected Health Information (PHI) as defined under HIPAA. 
                        You must NOT enter any patient-identifiable information including names, addresses, dates of birth, 
                        medical record numbers, or any other identifying information. Your queries may be processed by 
                        third-party AI services that retain data for up to 30 days for abuse monitoring. By using Balancer, 
                        you certify that you understand these restrictions and will not enter any PHI.
                      </p>
                    </div>
                    <div className="chat_suggestion_section">
                      <div className="chat_suggestion_header">
                        <FaPills className="text-rose-400 text-xl align-bottom inline-block mr-2" />
                        <h5 className="inline-block">Explore a medication</h5>
                      </div>
                      <ul className="chat_suggestion_list">
                        {suggestionPrompts.map((suggestion, index) => (
                          <li key={index}>
                            <button
                              type="button"
                              className="chat_suggestion"
                              onClick={(e) => handleSubmit(e, suggestion)}
                            >
                              {suggestion}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="chat_suggestion_section">
                      <div className="chat_suggestion_header">
                        <FaLightbulb className="text-amber-400 text-xl align-bottom inline-block mr-2" />
                        <h5 className="inline-block">Refresh your memory</h5>
                      </div>
                      <ul className="chat_suggestion_list">
                        {refreshPrompts.map((suggestion, index) => (
                          <li key={index}>
                            <button
                              type="button"
                              className="chat_suggestion"
                              onClick={(e) => handleSubmit(e, suggestion)}
                            >
                              {suggestion}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  currentMessages
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(a.timestamp).getTime() -
                        new Date(b.timestamp).getTime(),
                    )
                    .map((message, index) => (
                      <div
                        key={index}
                        className={`flex flex-row space-x-2 ${
                          message.is_user
                            ? "chat_text chat_text_user "
                            : "chat_text chat_text_bot"
                        }`}
                      >
                        <div>
                          <FaComment className="chat_text_icon" />
                        </div>
                        <div className="chat_text_wrap">
                          <pre
                            style={{
                              fontFamily: "inherit",
                              whiteSpace: "pre-wrap",
                              wordWrap: "break-word",
                            }}
                          >
                            {message.content}
                          </pre>
                        </div>
                      </div>
                    ))
                )}
                {isLoading && (
                  <div
                    key={currentMessages.length}
                    className="flex justify-center"
                  >
                    <div className="max-w-sm rounded-lg p-4 text-white">
                      <TypingAnimation />
                    </div>
                  </div>
                )}
                {error && <ErrorMessage errors={[error.message]} />}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="chat_footer">
              <input
                type="text"
                className="input w-full"
                placeholder={`Ask ${CHATBOT_NAME} a question`}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
              />
            </form>
          </div>
        </div>
      ) : (
        <div onClick={() => setShowChat(true)} className="chat_button no-print">
          <FaComments className="relative text-white w-10 h-10 z-10" />
        </div>
      )}
    </>
  );
};

export default Chat;

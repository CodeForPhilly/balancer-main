import React from "react";
import { Link } from "react-router-dom";
import "../../components/Header/chat.css";
import { useState, useEffect, useRef } from "react";
import TypingAnimation from "./components/TypingAnimation";
import ErrorMessage from "../ErrorMessage";
import ConversationList from "./ConversationList";
import { extractContentFromDOM } from "../../services/domExtraction";
import axios from "axios";
import {
  FaPlus,
  FaMinus,
  FaTimes,
  FaComment,
  FaComments,
  FaPills,
  FaLightbulb,
  FaArrowCircleDown,
  FaExpandAlt,
  FaExpandArrowsAlt,
} from "react-icons/fa";
import {
  fetchConversations,
  continueConversation,
  newConversation,
  updateConversationTitle,
  deleteConversation,
} from "../../api/apiClient";

interface ChatLogItem {
  is_user: boolean;
  content: string;
  timestamp: string; // EX: 2025-01-16T16:21:14.981090Z
}

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
  const [chatLog, setChatLog] = useState<ChatLogItem[]>([]); // Specify the type as ChatLogItem[]
  const [isLoading, setIsLoading] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const suggestionPrompts = [
    "What are the side effects of Latuda?",
    "Why is cariprazine better than valproate for a pregnant patient?",
  ];
  const refreshPrompts = [
    "Risks associated with Lithium.",
    "What medications could cause liver issues?",
  ];
  const [pageContent, setPageContent] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const content = extractContentFromDOM();
      setPageContent(content);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const extractedContent = extractContentFromDOM();
    // console.log(extractedContent);
    setPageContent(extractedContent);
  }, []);

  const [bottom, setBottom] = useState(false);

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const bottom =
      target.scrollHeight - Math.round(target.scrollTop) ===
      target.clientHeight;
    setBottom(bottom);
  };

  const [expandChat, setExpandChat] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current && activeConversation) {
      const chatContainer = chatContainerRef.current;
      // Use setTimeout to ensure the new message has been rendered
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setBottom(
          chatContainer.scrollHeight - chatContainer.scrollTop ===
            chatContainer.clientHeight
        );
      }, 0);
    }
  }, [activeConversation?.messages]);

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
      // setLoading(false);
    } catch (error) {
      console.error("Error loading conversations: ", error);
    }
  };

  const scrollToBottom = (element: HTMLElement) =>
    element.scroll({ top: element.scrollHeight, behavior: "smooth" });

  const handleScrollDown = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
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
    suggestion?: string
  ) => {
    event.preventDefault();

    const newMessage = {
      content: (inputValue || suggestion) ?? "",
      is_user: true,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...chatLog, newMessage];

    setChatLog(newMessages);

    // sendMessage(newMessages);
    try {
      let conversation = activeConversation;
      let conversationCreated = false;

      // Create a new conversation if none exists
      if (!conversation) {
        conversation = await newConversation();
        setActiveConversation(conversation);
        setShowConversationList(false);
        conversationCreated = true;
      }

      // Update the conversation with the new user message
      const updatedMessages = [...conversation.messages, newMessage];
      setActiveConversation({
        ...conversation,
        title: "Asking JJ...",
        messages: updatedMessages,
      });

      setIsLoading(true);

      // Continue the conversation and update with the bot's response
      const data = await continueConversation(
        conversation.id,
        newMessage.content,
        pageContent
      );

      // Update the ConversationList component after previous function creates a title
      if (conversationCreated) loadConversations(); // Note: no 'await' so this can occur in the background

      setActiveConversation((prevConversation: any) => {
        if (!prevConversation) return null;

        return {
          ...prevConversation,
          messages: [
            ...prevConversation.messages,
            {
              is_user: false,
              content: data.response,
              timestamp: new Date().toISOString(),
            },
          ],
          title: data.title,
        };
      });
      setError(null);
    } catch (error) {
      console.error("Error(s) handling conversation:", error);
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

  const handleSelectConversation = (id: Conversation["id"]) => {
    const selectedConversation = conversations.find(
      (conversation: any) => conversation.id === id
    );

    if (selectedConversation) {
      setActiveConversation(selectedConversation);
      setShowConversationList(false);
    }
  };

  const handleNewConversation = () => {
    setActiveConversation(null);
    setShowConversationList(false);
  };

  useEffect(() => {
    if (showChat) {
      loadConversations();

      const resizeObserver = new ResizeObserver(() => {
        const target = chatContainerRef.current;
        if (target) {
          const bottom =
            target.scrollHeight - Math.round(target.scrollTop) ===
            target.clientHeight;
          setBottom(bottom);
        }
      });
      if (chatContainerRef.current) {
        resizeObserver.observe(chatContainerRef.current);
      }
      return () => resizeObserver.disconnect(); // clean up
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
              <button
                onClick={() =>
                  setShowConversationList((prevState) => !prevState)
                }
                className="flex items-center justify-center"
              >
                {showConversationList ? (
                  // Icon for "Hide"
                  <FaMinus className="chat_icon" />
                ) : (
                  // Icon for "Show"
                  <FaPlus className="chat_icon" />
                )}
              </button>

              <div
                className="truncate mx-2 font-semibold"
                title={
                  activeConversation !== null && !showConversationList
                    ? activeConversation.title
                    : `Ask ${CHATBOT_NAME}`
                }
              >
                {activeConversation !== null && !showConversationList ? (
                  activeConversation.title
                ) : (
                  <>
                    <FaComments className="chatbot_icon" />
                    <span className="chatbot_name">Ask {CHATBOT_NAME}</span>
                  </>
                )}
                <br />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setExpandChat((prevState) => !prevState)}
                  className="flex items-center justify-center"
                >
                  {expandChat ? (
                    // Icon for "Shrink"
                    <FaExpandAlt className="chat_icon" />
                  ) : (
                    // Icon for "expand"
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
              {showConversationList ? (
                <div className="chat_list">
                  <ConversationList
                    conversations={conversations}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    onSubmitConversationTitle={updateConversationTitle}
                    onDeleteConversation={deleteConversation}
                  />
                </div>
              ) : (
                <div className="chat_intro">
                  {activeConversation === null ||
                  activeConversation.messages.length === 0 ? (
                    <>
                      <div className="chat_bubble chat_bubble_header">
                        <h5>Hi there, I'm {CHATBOT_NAME}!</h5>
                        <p>
                          You can ask me all your bipolar disorder treatment
                          questions.
                        </p>
                        <Link to="/data-sources" className="chat_link">
                          Learn more about my sources.
                        </Link>
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
                    activeConversation.messages
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(a.timestamp).getTime() -
                          new Date(b.timestamp).getTime()
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
                            {message.is_user ? (
                              <FaComment className="chat_text_icon" />
                            ) : (
                              <FaComment className="chat_text_icon" />
                            )}
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
                    <div key={chatLog.length} className="flex justify-center">
                      <div className="max-w-sm rounded-lg p-4 text-white">
                        <TypingAnimation />
                      </div>
                    </div>
                  )}
                  {error && <ErrorMessage errors={[error.message]} />}
                </div>
              )}
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
        <div
          onClick={() => setShowChat(true)}
          className="fixed bottom-9 left-10 h-16 w-16 inline-block cursor-pointer flex items-center justify-center rounded-full bg-blue-500 object-contain hover:cursor-pointer hover:bg-blue-300 md:bottom-20 md:right-20 no-print"
        >
          <FaComments className="text-white h-10 w-10" />
          <div className="absolute bottom-20 mt-2 hidden w-32 rounded bg-gray-700 px-2 py-1 text-sm text-white before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:transform before:border-8 before:border-transparent before:border-b-gray-700 group-hover:block">
            Any questions? Click here to to chat!
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;

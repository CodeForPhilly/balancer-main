import React from "react";
// import { Link } from "react-router-dom";
import "../../components/Header/chat.css";
import { useState, useEffect, useRef } from "react";
import TypingAnimation from "./components/TypingAnimation";
import ErrorMessage from "../ErrorMessage";
import ConversationList from "./ConversationList";
import chatBubble from "../../assets/chatbubble.svg";
import { extractContentFromDOM } from "../../services/domExtraction";
import axios from "axios";
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
  const [inputValue, setInputValue] = useState("");
  const [chatLog, setChatLog] = useState<ChatLogItem[]>([]); // Specify the type as ChatLogItem[]
  const [isLoading, setIsLoading] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const suggestionPrompts = [
    "Tell me about treatment options.",
    "What are the common side effects?",
    "How to manage medication schedule?",
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

  // useEffect(() => {
  //   if (chatContainerRef.current) {
  //     const chatContainer = chatContainerRef.current;
  //     chatContainer.scrollTop = chatContainer.scrollHeight;
  //   }
  // }, [chatLog]);

  useEffect(() => {
    if (chatContainerRef.current && activeConversation) {
      const chatContainer = chatContainerRef.current;
      // Use setTimeout to ensure the new message has been rendered
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newMessage = {
      content: inputValue,
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
        messages: updatedMessages,
      });

      setIsLoading(true);

      // Continue the conversation and update with the bot's response
      const data = await continueConversation(
        conversation.id,
        newMessage.content,
        pageContent,
      );

      // Update the ConversationList component after previous function creates a title
      if (conversationCreated) loadConversations(); // Note: no 'await' so this can occur in the background

      setActiveConversation((prevConversation) => {
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

  // const systemMessage = {
  //   role: "system",
  //   content: "You are a bot please keep conversation going.",
  // };
  // const sendMessage = (message: ChatLogItem[]) => {
  //   const baseUrl = import.meta.env.VITE_API_BASE_URL;
  //   const url = `${baseUrl}/chatgpt/chat`;

  //   const apiMessages = message.map((messageObject) => {
  //     let role = "";
  //     if (messageObject.is_user) {
  //       role = "user";
  //     } else {
  //       role = "assistant";
  //     }
  //     return { role: role, content: messageObject.content };
  //   });

  //   systemMessage.content += `If applicable, please use the following content to ask questions. If not applicable,
  //     please answer to the best of your ability: ${pageContent}`;

  //   const apiRequestBody = {
  //     prompt: [systemMessage, ...apiMessages],
  //   };

  //   setIsLoading(true);

  //   axios
  //     .post(url, apiRequestBody)
  //     .then((response) => {
  //       console.log(response);
  //       setChatLog((prevChatLog) => [
  //         ...prevChatLog,
  //         {
  //           is_user: false,
  //           content: response.data.message.choices[0].message.content,
  //         },
  //       ]);
  //       setIsLoading(false);
  //     })
  //     .catch((error) => {
  //       setIsLoading(false);
  //       console.log(error);
  //     });
  // };

  const handleSelectConversation = (id: Conversation["id"]) => {
    const selectedConversation = conversations.find(
      (conversation) => conversation.id === id,
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
    if (showChat) loadConversations();
  }, [showChat]);

  return (
    <>
      {/* {showChat && (
        <div
          className="fixed inset-0 bg-gray-900 opacity-50 z-5"
          onClick={handleChat}
        ></div>
      )} */}
      <div
        className={`fixed bottom-0 right-0 rounded md:bottom-3 md:right-4 ${
          showChat
            ? "show_chat border-1bg-white ring-slate-1000/10 shadow"
            : "h-12 "
        } `}
      >
        {showChat ? (
          <div
            id="chat_container"
            className=" mx-auto flex h-full  flex-col overflow-auto rounded "
          >
            {/* <div
              className="sticky top-0 mt-0 flex h-8 w-full flex-row items-center justify-between rounded-t-lg border-b bg-white p-1  "
              style={{ borderBottomColor: "#abcdef" }}
            > */}
            <div
              className="sticky top-0 mt-0 flex h-8 w-full flex-row items-center justify-between rounded-t-lg border-b bg-white p-1  "
              style={{ borderBottomColor: "#abcdef" }}
            >
              <button
                onClick={() =>
                  setShowConversationList((prevState) => !prevState)
                }
                className="flex items-center justify-center"
              >
                {showConversationList ? (
                  // Icon for "Hide"
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="h-5 w-5"
                    fill="currentColor"
                  >
                    <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM64 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L96 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
                  </svg>
                ) : (
                  // Icon for "Show"
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="h-5 w-5"
                    fill="currentColor"
                  >
                    <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
                  </svg>
                )}
              </button>

              <div
                className="ml-4 text-black truncate"
                title={
                  activeConversation !== null && !showConversationList
                    ? activeConversation.title
                    : `Question for me?`
                }
              >
                {activeConversation !== null && !showConversationList
                  ? activeConversation.title
                  : `Question for me?`}
                <br />
              </div>

              <div
                className="delete mr-2 flex h-6 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-black hover:bg-red-500"
                onClick={() => setShowChat(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.293 4.293a1 1 0 011.414 1.414L11.414 12l5.293 5.293a1 1 0 01-1.414 1.414L10 13.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 12 3.293 6.707a1 1 0 111.414-1.414L10 10.586l5.293-5.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto" ref={chatContainerRef}>
              {showConversationList ? (
                <ConversationList
                  conversations={conversations}
                  onSelectConversation={handleSelectConversation}
                  onNewConversation={handleNewConversation}
                  onSubmitConversationTitle={updateConversationTitle}
                  onDeleteConversation={deleteConversation}
                />
              ) : (
                <div className="font_body mt-6 flex flex-grow flex-col space-y-2 p-5">
                  {activeConversation === null ||
                  activeConversation.messages.length === 0 ? (
                    <>
                      {/* <div className="text-gray-500">
                    Want to know more about a medication or have a question? Ask
                    Balancer in this chat, and information will be pulled from
                    all over the internet to assist you <br />
                    <br />
                  </div> */}
                      <div className="max-h-[100%] max-w-[310px] rounded-lg border-2 bg-gray-200 p-2 text-black">
                        You can ask about the content on this page.
                      </div>
                      <div className="max-h-[100%] max-w-[190px] rounded-lg border-2 bg-gray-200 p-2 text-black">
                        Or questions in general.
                      </div>
                    </>
                  ) : (
                    activeConversation.messages
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(a.timestamp).getTime() -
                          new Date(b.timestamp).getTime(),
                      )
                      .map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            message.is_user ? "justify-end" : "justify-start"
                          }`}
                        >
                          <pre
                            style={{
                              fontFamily: "inherit",
                              whiteSpace: "pre-wrap",
                              wordWrap: "break-word",
                            }}
                            className={`${
                              message.is_user
                                ? "bg-blue-200 text-black "
                                : "border-2 bg-gray-200 text-black "
                            }rounded-lg max-h-[100%] max-w-[500px] p-2`}
                          >
                            {message.content}
                          </pre>
                        </div>
                      ))
                  )}
                  {isLoading && (
                    <div key={chatLog.length} className="flex justify-between">
                      <div className="max-w-sm rounded-lg p-4 text-white">
                        <TypingAnimation />
                      </div>
                    </div>
                  )}
                  {error && <ErrorMessage errors={[error.message]} />}
                </div>
              )}
            </div>
            <div className="inside_chat rounded-b-lg bg-white p-4 sticky bottom-0 left-0 right-0 z-50 ">
              <div className="flex md:flex-col gap-1 p-2 ">
                {suggestionPrompts.map((suggestion, index) => (
                  <button
                    type="button"
                    key={index}
                    className="rounded-md border p-2 text-sm text-black hover:bg-blue-200"
                    onClick={() => setInputValue(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="mb-1 flex">
                <div className="ml-2 flex-grow">
                  <input
                    type="ani_input"
                    className="input w-full"
                    placeholder="Talk to me..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                <div className="ml-5">
                  <button type="submit" className="btnBlue">
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setShowChat(true)}
            className="group absolute relative bottom-9 right-5 inline-block flex h-16 w-16 cursor-pointer items-center justify-center rounded-full   object-contain hover:cursor-pointer hover:border-blue-600 hover:bg-blue-300 md:bottom-20 md:right-20 "
          >
            <img src={chatBubble} alt="logo" className="h-6 md:h-10 md:w-10 " />
            <div className="absolute bottom-20 mt-2 hidden w-32 rounded bg-gray-700 px-2 py-1 text-sm text-white before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:transform before:border-8 before:border-transparent before:border-b-gray-700 group-hover:block">
              Any questions? Click here to to chat!
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;

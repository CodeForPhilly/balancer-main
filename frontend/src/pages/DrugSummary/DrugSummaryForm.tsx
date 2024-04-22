import React from "react";
// import { Link } from "react-router-dom";
import "../../components/Header/chat.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
// import TypingAnimation from "./components/TypingAnimation.tsx";
// import chatBubble from "../../assets/chatbubble.svg";
import { extractContentFromDOM } from "../../services/domExtraction.tsx";
import paperclip from "../../assets/paperclip.svg";

interface ChatLogItem {
  type: string;
  message: string;
}

const DrugSummaryForm = () => {
  const [inputValue, setInputValue] = useState("");
  const [chatLog, setChatLog] = useState<ChatLogItem[]>([]); // Specify the type as ChatLogItem[]
  const [isLoading, setIsLoading] = useState(false);
  // const suggestionPrompts = [
  //   "Tell me about treatment options.",
  //   "What are the common side effects?",
  //   "How to manage medication schedule?",
  // ];
  const [pageContent, setPageContent] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollToBottomRef = useRef<HTMLDivElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === "application/pdf") {
        // setSelectedFile(file);
        setInputValue(file.name);
        // Update chat log to show a message about the uploaded file
        // setChatLog([
        //   ...chatLog,
        //   { type: "user", message: "PDF file uploaded." },
        // ]);
      } else {
        // Handle non-PDF files or errors
      }
    } else {
      // Handle the case where no file is selected
    }
  };

  const systemMessage = {
    role: "system",
    content: "You are a bot please keep conversation going.",
  };

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
    console.log(extractedContent);
    setPageContent(extractedContent);
  }, []);

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

  // const suggestionPrompts = [
  //   [
  //     "Tell me about treatment options.",
  //     "Additional details or related question.",
  //   ],
  //   [
  //     "What are the common side effects?",
  //     "Additional details or related question.",
  //   ],
  //   [
  //     "How to manage medication schedule?",
  //     "Additional details or related question.",
  //   ],
  //   ["Another question or topic?", "Additional details or related question."],
  // ];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newMessage = {
      message: inputValue,
      type: "user",
    };

    const newMessages = [...chatLog, newMessage];

    setChatLog(newMessages);

    sendMessage(newMessages);

    setInputValue("");
  };

  const sendMessage = (message: ChatLogItem[]) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const url = `${baseUrl}/chatgpt/chat`;

    const apiMessages = message.map((messageObject) => {
      let role = "";
      if (messageObject.type === "user") {
        role = "user";
      } else {
        role = "assistant";
      }
      return { role: role, content: messageObject.message };
    });

    systemMessage.content += `If applicable, please use the following content to ask questions. If not applicable,
      please answer to the best of your ability: ${pageContent}`;

    const apiRequestBody = {
      prompt: [systemMessage, ...apiMessages],
    };

    setIsLoading(true);

    axios
      .post(url, apiRequestBody)
      .then((response) => {
        console.log(response);
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          {
            type: "bot",
            message: response.data.message.choices[0].message.content,
          },
        ]);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
      });
  };

  return (
    <>
      <header className=" fixed w-full items-center ">
        <div
          className={
            "   h-20  w-full items-center justify-between border-b border-gray-300 bg-white lg:flex xl:px-72"
          }
        ></div>
      </header>

      <div
        className={
          "  fixed h-full  w-60 justify-between border-r border-gray-300 bg-white lg:flex"
        }
      >
        <div>
          <span className="bg-gradient-to-r  from-blue-500 via-blue-700 to-blue-300 bg-clip-text font-quicksand text-xl font-bold text-transparent lg:text-3xl ">
            Balancer
          </span>
        </div>
      </div>

      <div className="mx-auto  min-h-screen w-full max-w-[810px] overflow-y-auto border">
        <div className="h-[100px]"> </div>
        <div
          ref={chatContainerRef}
          id="chat_container"
          className="flex flex-col p-5 "
        >
          {chatLog.length === 0 ? (
            <>
              <div className="flex  flex-col gap-4 p-3">
                <div className="max-h-[100%] max-w-[310px] rounded-lg border-2 bg-stone-50 p-2 text-sky-950">
                  You can ask about the content on this page.
                </div>
                <div className="max-h-[100%] max-w-[190px] rounded-lg border-2 bg-stone-50 p-2 text-sky-950">
                  Or questions in general.
                </div>
              </div>
            </>
          ) : (
            chatLog.map((message, index) => (
              <div className="flex  flex-col gap-4 p-3">
                <div
                  key={index}
                  className={`${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }   p-2`}
                  ref={index === chatLog.length - 1 ? scrollToBottomRef : null}
                >
                  <div
                    className={`${
                      message.type === "user"
                        ? "border-2  bg-blue-200 text-neutral-600 "
                        : " border-2  bg-stone-50 text-sky-950 "
                    }rounded-lg  p-2`}
                  >
                    {message.message}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div key={chatLog.length} className="flex justify-between">
              <div className="max-w-sm rounded-lg p-4 text-white"></div>
            </div>
          )}
          <div className="h-[100px]"> </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="fixed bottom-0 flex  w-[808px]  bg-white p-5"
        >
          <div className="relative flex w-full  items-center ">
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 py-3 pl-10 pr-3"
              placeholder="Talk to me..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <button
              type="button"
              className="absolute left-0 ml-2"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
            >
              <img src={paperclip} alt="Upload" className="h-6" />
            </button>
            <input
              type="file"
              id="fileInput"
              ref={fileInputRef}
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
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
      </div>
    </>
  );
};

export default DrugSummaryForm;
